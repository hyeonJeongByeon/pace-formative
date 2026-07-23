// PACE formative prototype — conversation engine.
// Implements DESIGN_SPEC.md §4 (arc + termination), §5 (coach budget),
// §6 (report card), §7 (message log → export). Scenario content lives in
// js/scenarios/*.js; prompts in js/prompts.js; caps in js/config.js.

(function () {
  const CFG = window.PACE_CONFIG;
  const PROMPTS = window.PACE_PROMPTS;
  const SCENARIOS = (window.PACE_SCENARIOS || []).slice().sort((a, b) => a.number - b.number);

  const SKILL_NAMES = { P: 'Present detailed information', A: 'Ask questions', C: 'Check understanding', E: 'Express concerns' };

  // ── Session state ───────────────────────────────────────────────────────
  let S = null;
  function freshState(scenario) {
    return {
      scenario,
      log: [],              // {ts, role, text, oppId?, oppStatus?}  (spec §7 log)
      queue: [],            // director schedule
      activeOpp: null,      // opportunity awaiting the participant's reply
      activeOppNudged: false,
      oppOutcomes: {},      // oppId -> {status, evidence, nudged}
      nudgesUsed: 0,
      praiseUsed: 0,
      patTurns: 0,
      startedAt: null,
      phase: 'chat',        // chat | awaiting-closing-answer | done
      capped: false,
      report: null,
      busy: false,
    };
  }

  // ── Proxy calls ─────────────────────────────────────────────────────────
  let passcode = sessionStorage.getItem('pace_passcode') || '';

  async function callModel(system, messages, maxTokens) {
    const r = await fetch(CFG.PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-study-passcode': passcode },
      body: JSON.stringify({ system, messages, max_tokens: maxTokens || 600 }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || data?.error || `Proxy error ${r.status}`);
    const text = data?.content?.[0]?.text;
    if (!text) throw new Error('Empty model response');
    return text;
  }

  function tryJSON(raw) {
    if (!raw) return null;
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const m = cleaned.match(/\{[\s\S]*\}/);
    try { return JSON.parse(m ? m[0] : cleaned); } catch { return null; }
  }

  // ── Logging (drives report card + researcher export, spec §7) ───────────
  function logMsg(role, text, extra) {
    S.log.push(Object.assign({ ts: new Date().toISOString(), role, text }, extra || {}));
  }

  // ── Director queue (guarantees every opportunity is surfaced, spec §4) ──
  function buildQueue(scenario) {
    const q = [{ type: 'opening' }];
    scenario.opportunities.forEach(opp => q.push({ type: 'opportunity', opp }));
    q.push({ type: 'closing' });
    return q;
  }

  function directorNote(item) {
    const sc = S.scenario;
    switch (item.type) {
      case 'opening':
        return 'Begin the visit (arc: opening). Greet the patient briefly per your persona and invite them to say what brings them in.';
      case 'opportunity':
        return item.opp.directorMove;
      case 'reoffer':
        return 'The patient may retry the last moment. ' + item.opp.reofferDirector;
      case 'closing':
        return `Move to closure (arc: closure). Ask your closing question, close to this wording: "${sc.closingQuestion}"`;
      case 'cap-close':
        return 'The visit is out of time. Gracefully and warmly close the visit in 1–2 sentences regardless of where things stand. Do not ask any further questions.';
    }
  }

  // Build the provider-facing message array from the log each turn:
  // clean transcript (no coach messages), director note appended to the last
  // user message. Coach is invisible to the provider by design.
  function providerMessages(note) {
    const msgs = [];
    S.log.forEach(m => {
      if (m.role === 'provider') msgs.push({ role: 'assistant', content: m.text });
      else if (m.role === 'participant') msgs.push({ role: 'user', content: m.text });
    });
    const noteLine = `[DIRECTOR: ${note}]`;
    if (msgs.length && msgs[msgs.length - 1].role === 'user') {
      msgs[msgs.length - 1] = { role: 'user', content: msgs[msgs.length - 1].content + '\n\n' + noteLine };
    } else {
      msgs.push({ role: 'user', content: noteLine });
    }
    return msgs;
  }

  async function providerTurn(item) {
    setBusy(true); showTyping(true);
    try {
      const raw = await callModel(
        PROMPTS.providerSystem(S.scenario),
        providerMessages(directorNote(item)),
        400
      );
      showTyping(false);
      const j = tryJSON(raw);
      const text = (j && j.message) ? j.message : raw.trim();
      logMsg('provider', text, item.type === 'opportunity' ? { oppId: item.opp.id } :
                               item.type === 'reoffer' ? { oppId: item.opp.id, reoffer: true } : {});
      addBubble('provider', text);

      if (item.type === 'opportunity') { S.activeOpp = item.opp; S.activeOppNudged = false; }
      if (item.type === 'reoffer') { S.activeOpp = item.opp; }
      if (item.type === 'closing') { S.phase = 'awaiting-closing-answer'; }
      if (item.type === 'cap-close') { return endRolePlay(); }
    } catch (e) {
      showTyping(false);
      addError(e.message);
    }
    setBusy(false);
  }

  // ── Opportunity classification ──────────────────────────────────────────
  async function classifyReply(opp, reply) {
    const providerMove = [...S.log].reverse().find(m => m.role === 'provider' && m.oppId === opp.id);
    try {
      const raw = await callModel(null, [{
        role: 'user',
        content: PROMPTS.classify(opp, providerMove ? providerMove.text : '', reply),
      }], 150);
      const j = tryJSON(raw);
      if (j && ['met', 'partial', 'missed'].includes(j.status)) return j;
    } catch (e) { /* classification failure falls through */ }
    return { status: 'partial', evidence: '' }; // fail-soft: never punish on classifier error
  }

  function lastLoggedRole() { return S.log.length ? S.log[S.log.length - 1].role : null; }

  // ── Main send flow ──────────────────────────────────────────────────────
  async function send() {
    if (!S || S.busy || S.phase === 'done') return;
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    setBusy(true);

    addBubble('participant', text);
    S.patTurns++;
    updateTurnCounter();
    if (S.patTurns === 1) document.getElementById('scenario-banner').classList.add('collapsed');

    // Termination (b): participant has answered the closing question → end.
    if (S.phase === 'awaiting-closing-answer') {
      logMsg('participant', text);
      return endRolePlay();
    }

    const capped = S.patTurns >= CFG.HARD_CAP_PARTICIPANT_TURNS ||
                   (Date.now() - S.startedAt) >= CFG.HARD_CAP_MINUTES * 60_000;

    if (S.activeOpp) {
      const opp = S.activeOpp;
      logMsg('participant', text, { oppId: opp.id });
      const wasRetry = S.activeOppNudged;
      const { status, evidence } = await classifyReply(opp, text);
      S.log[S.log.length - 1].oppStatus = status;

      if (status === 'missed' && !wasRetry && !capped &&
          S.nudgesUsed < CFG.COACH_NUDGE_BUDGET && lastLoggedRole() !== 'coach') {
        // Coach nudge (spec §5), then the provider re-offers once.
        S.nudgesUsed++;
        S.activeOppNudged = true;
        logMsg('coach', opp.nudge, { oppId: opp.id });
        addCoach(opp.nudge);
        await providerTurn({ type: 'reoffer', opp });
        return; // queue not advanced; participant retries this opportunity
      }

      // Finalize this opportunity (retry outcome wins; over-budget misses go
      // to the report card instead of the coach — spec §5).
      S.oppOutcomes[opp.id] = { status, evidence, nudged: wasRetry, skill: opp.skill };
      S.activeOpp = null;

      // One unprompted-success praise per session (spec §5), never stacking.
      if (status === 'met' && !wasRetry && S.praiseUsed < CFG.COACH_PRAISE_BUDGET &&
          lastLoggedRole() !== 'coach') {
        S.praiseUsed++;
        const praiseText = PROMPTS.praise(opp.skillLabel);
        logMsg('coach', praiseText, { oppId: opp.id, praise: true });
        addCoach(praiseText);
      }
    } else {
      logMsg('participant', text);
    }

    if (capped) { S.capped = true; return providerTurn({ type: 'cap-close' }); }

    const next = S.queue.shift();
    if (next) return providerTurn(next);
    return endRolePlay(); // queue exhausted (shouldn't normally hit before closing)
  }

  // ── Role-play lifecycle ─────────────────────────────────────────────────
  let chosenScenario = null;

  function startRolePlay() {
    S = freshState(chosenScenario);
    S.startedAt = Date.now();
    S.queue = buildQueue(S.scenario);

    document.getElementById('chat-avatar').textContent = S.scenario.provider.avatar;
    document.getElementById('chat-provider-name').textContent = S.scenario.provider.name;
    document.getElementById('chat-scenario-title').textContent = S.scenario.title;
    document.getElementById('scenario-banner-text').textContent = S.scenario.vignette.participantBriefing;
    document.getElementById('scenario-banner').classList.remove('collapsed');
    document.getElementById('chat-log').innerHTML = '';
    updateTurnCounter();
    show('view-chat');

    providerTurn(S.queue.shift());
  }

  function researcherEnd() {
    if (!S || S.phase === 'done' || S.busy) return;
    S.capped = true;
    providerTurn({ type: 'cap-close' });
  }

  async function endRolePlay() {
    S.phase = 'done';
    setBusy(true);
    document.getElementById('chat-input').placeholder = 'The visit has ended.';
    await generateReport();
  }

  // ── Report card (spec §6) ───────────────────────────────────────────────
  function annotatedTranscript() {
    return S.log.map(m => {
      const who = m.role === 'provider' ? 'Provider' : m.role === 'coach' ? 'COACH (aside)' : 'Participant';
      const opp = m.oppId ? ` [OPP:${m.oppId}${m.oppStatus ? '→' + m.oppStatus : ''}]` : '';
      return `${who}: ${m.text}${opp}`;
    }).join('\n');
  }

  function opportunityLogText() {
    return S.scenario.opportunities.map(o => {
      const out = S.oppOutcomes[o.id];
      const status = out ? out.status + (out.nudged ? ' (after coach nudge)' : '') : 'not reached';
      return `${o.id} — invited skill ${o.skill} (${o.skillLabel}): ${status}`;
    }).join('\n');
  }

  async function generateReport() {
    show('view-report');
    document.getElementById('report-sub').textContent =
      `Scenario: ${S.scenario.title} · ${S.patTurns} turns` + (S.capped ? ' · ended at time/turn cap' : '');
    const body = document.getElementById('report-body');
    body.innerHTML = '<div class="card">Building your report…</div>';

    try {
      const raw = await callModel(null, [{
        role: 'user',
        content: PROMPTS.reportCard(S.scenario, annotatedTranscript(), opportunityLogText()),
      }], 1200);
      S.report = tryJSON(raw);
    } catch (e) { S.report = null; }

    renderReport(body);
  }

  const RATING_CLASS = { 'Tried it': 'tried', 'Partially': 'partial', 'Opportunity missed': 'missed' };

  function renderReport(body) {
    if (!S.report || !S.report.components) {
      body.innerHTML = '<div class="card">The report could not be generated, but your full transcript is preserved — use “Download session (JSON)” below and the researcher can review it with you.</div>';
      return;
    }
    body.innerHTML = '';
    ['P', 'A', 'C', 'E'].forEach(k => {
      const c = S.report.components[k] || {};
      const rating = c.rating && RATING_CLASS[c.rating]
        ? `<span class="rating ${RATING_CLASS[c.rating]}">${c.rating}</span>`
        : `<span class="rating none">Not a focus this time</span>`;
      const card = document.createElement('div');
      card.className = 'card report-comp';
      card.innerHTML = `
        <div class="rc-head">
          <div class="pace-letter ${k}">${k}</div>
          <b>${SKILL_NAMES[k]}</b>
          ${rating}
        </div>
        ${c.whatYouDid ? `<div class="report-row"><b>What you did:</b> <span class="quote">${esc(c.whatYouDid)}</span></div>` : ''}
        ${c.strength ? `<div class="report-row"><b>Strength:</b> ${esc(c.strength)}</div>` : ''}
        ${c.tryNext ? `<div class="report-row"><b>One thing to try:</b> ${esc(c.tryNext)}</div>` : ''}
      `;
      body.appendChild(card);
    });
    if (S.report.goal) {
      const g = document.createElement('div');
      g.className = 'goal-band';
      g.innerHTML = `<div class="g-label">Goal for your next real visit</div>${esc(S.report.goal)}`;
      body.appendChild(g);
    }
  }

  // ── Researcher export (spec §1/§7 — client-side only; TODO(spec§8) format) ──
  function exportJSON() {
    const payload = {
      meta: {
        scenarioId: S.scenario.id,
        scenarioTitle: S.scenario.title,
        startedAt: new Date(S.startedAt).toISOString(),
        endedAt: new Date().toISOString(),
        participantTurns: S.patTurns,
        nudgesUsed: S.nudgesUsed,
        praiseUsed: S.praiseUsed,
        cappedEarly: S.capped,
      },
      opportunityOutcomes: S.oppOutcomes,
      log: S.log,
      reportCard: S.report,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pace-session-${S.scenario.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── UI helpers ──────────────────────────────────────────────────────────
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function addBubble(role, text) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    const avatar = role === 'provider' ? S.scenario.provider.avatar : 'You';
    div.innerHTML = `<div class="m-avatar">${avatar}</div><div class="bubble">${esc(text)}</div>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function addCoach(text) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = 'coach-aside';
    div.innerHTML = `<div class="coach-tag">🎓 Coach</div>${esc(text)}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function addError(message) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = 'err';
    div.textContent = '⚠ ' + message;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  let typingEl = null;
  function showTyping(on) {
    const log = document.getElementById('chat-log');
    if (on && !typingEl) {
      typingEl = document.createElement('div');
      typingEl.className = 'msg provider';
      typingEl.innerHTML = `<div class="m-avatar">${S.scenario.provider.avatar}</div><div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
      log.appendChild(typingEl);
      log.scrollTop = log.scrollHeight;
    } else if (!on && typingEl) { typingEl.remove(); typingEl = null; }
  }

  function setBusy(v) {
    if (S) S.busy = v;
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('send-btn');
    input.disabled = v || (S && S.phase === 'done');
    btn.disabled = input.disabled;
    if (!input.disabled) input.focus();
  }

  function updateTurnCounter() {
    document.getElementById('turn-counter').textContent =
      `Turn ${S.patTurns} of ${CFG.HARD_CAP_PARTICIPANT_TURNS} max`;
  }

  function show(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  // ── Setup screens ───────────────────────────────────────────────────────
  function enterPasscode() {
    const v = document.getElementById('passcode-input').value.trim();
    if (!v) { document.getElementById('gate-err').textContent = 'Passcode required.'; return; }
    passcode = v;
    sessionStorage.setItem('pace_passcode', v);
    show('view-education');
  }

  function buildMenu() {
    const list = document.getElementById('scenario-list');
    SCENARIOS.forEach(sc => {
      const card = document.createElement('div');
      card.className = 'card scenario-card';
      card.innerHTML = `
        <div style="margin-bottom:.3rem"><span class="num">${sc.number}</span><b>${sc.title}</b></div>
        <div style="font-size:.87rem;color:var(--ink-soft);margin-bottom:.45rem">${sc.menuDescription}</div>
        <div>${sc.targetSkills.map(s => `<span class="skill-chip">${s}</span>`).join('')}</div>`;
      card.onclick = () => {
        chosenScenario = sc;
        document.getElementById('brief-title').textContent = sc.title;
        document.getElementById('brief-text').textContent = sc.vignette.participantBriefing;
        show('view-briefing');
      };
      list.appendChild(card);
    });
  }

  buildMenu();
  if (passcode) show('view-education');

  // Public API for inline handlers
  window.App = { enterPasscode, show, startRolePlay, send, researcherEnd, exportJSON };
})();
