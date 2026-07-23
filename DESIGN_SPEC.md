# PACE Role-Play Prototype — Design Specification

Formative study probe for a 60-minute patient interview (N=20). This spec is the source of truth for design decisions; all were derived from survey data (N=117 analyzed finished responses; 79 interview-interested) collected via Prolific and ITHS, systematically coded for challenge themes and coping engagement (THEMATIC_ANALYSIS_MEMO.md), plus the PACE training framework. Do not change scenario structure, termination logic, or report card structure without flagging it as a deviation from the study design.

## 1. Context and constraints

- Used inside a think-aloud session: **~10 minutes of participant interaction total** (reading materials + one role-play + report card). Everything must be skimmable and fast.
- One participant does **one scenario**, assigned by the researcher to match the communication challenge cluster the participant reported in the pre-interview survey. The scenario menu is still shown (participants are asked which they *would* pick, to test the selection UI), but the researcher then directs them to their assigned scenario.
- Architecture: static HTML/JS frontend in a **public repo**, deployed as a participant-facing website. AI = **Anthropic Claude API**, called through a small serverless proxy (e.g., Vercel function or Cloudflare Worker) that holds the API key server-side. **The API key must never appear in frontend code, the repo, or commit history.** Proxy should enforce a study passcode and basic rate limiting.
- No PHI is collected by design: participants use hypothetical/standardized scenario content, not their real medical details. The PACE education screen and role-play instructions should remind participants not to enter real personal health information. (The Claude API is not BAA-covered; this design constraint is what keeps the study compliant.)
- The researcher must be able to see/export the transcript and the report card afterward (interview probes reference both).

## 2. User flow

1. **PACE education screen(s).** Brief text materials introducing PACE: **P**resent detailed information, **A**sk questions, **C**heck understanding, **E**xpress concerns. Keep to ~2–3 min of reading. Each component gets a one-line definition + one example phrase.
2. **Scenario selection screen.** Menu of 5 scenarios (below), each with a 1–2 sentence patient-perspective description. Participant browses; researcher directs to assigned scenario.
3. **Role-play.** Participant plays themselves as the patient; the AI plays the provider. A separate "communication coach" voice intervenes inline (visually distinct from the provider, e.g., different color/label) at trigger points.
4. **Report card.** Generated at conversation end. Structured per Section 6.
5. (Researcher-facing) transcript + report card export.

## 3. Scenarios (data-driven)

Each scenario corresponds to one empirically derived challenge cluster from the survey and emphasizes specific PACE skills. System/logistics challenges (prescriptions not sent, referrals, billing) are **out of scope by design**: they are not within-visit dyadic communication and PACE cannot train them.

| # | Scenario | Provider persona/behavior | Primary PACE skills |
|---|----------|---------------------------|---------------------|
| 1 | The dismissive visit | Brushes off a symptom ("that's pretty normal, I wouldn't worry"), doesn't probe | Express, Present (persistence) |
| 2 | The rushed visit | Answers curtly, tries to close the visit early, interrupts | Ask, Express, agenda-setting |
| 3 | The confusing explanation | Uses unexplained jargon, gives a vague plan | Check, Ask |
| 4 | The hard-to-describe problem | Neutral provider; the challenge is that the participant's symptom is ambiguous and they must convey it clearly | Present (onset, duration, severity, impact) |
| 5 | The judgmental comment | Makes an off-topic or subtly stigmatizing remark (e.g., unsolicited weight comment during an unrelated visit) | Express, redirect to agenda |

Scenario content notes:
- The five-scenario set was validated by a systematic coding of all 117 finished survey responses (see THEMATIC_ANALYSIS_MEMO.md): every cluster has 7–29 primary cases in the interview-interested pool, with dismissed/unheard the dominant cluster (29).
- Scenario 1 (dismissive) will carry the most participants; prioritize its script quality during iteration.
- Rushed and dismissed frequently co-occur in the data. Scenario 2's script must make time pressure itself the obstacle (interruptions, moving to close early, short answers) and avoid dismissive content, so participants experience scenarios 1 and 2 as distinct.
- Scenarios are **standardized**, not personalized re-enactments of the participant's reported event. Clinical details should be common, low-acuity, and non-traumatic (rash, knee pain, fatigue, medication follow-up).
- Scenario 5 must stay mild. Survey respondents, disproportionately ITHS/clinical participants, reported serious stigma (race, substance use, hostile staff); the role-play version uses a mild analog (weight/lifestyle remark) to avoid distress while exercising the same skill. The interview protocol probes whether the mild version feels like adequate practice for the severe reality.
- Participants whose only reported challenge was system/logistics have no matched scenario; if interviewed, assign scenario 1 and note the mismatch in the session log.

## 4. Conversation structure and termination

Each role-play follows a scripted **visit arc**: opening → problem presentation → provider explanation/plan → closure.

- Embedded along the arc are **3–4 "communication opportunities"**: scripted provider moves that invite a PACE behavior (drops jargon → invites Check; moves to wrap up → invites Ask/Express; dismisses concern → invites Express/persist). Each scenario defines its opportunities explicitly in its system prompt/config.
- **Termination rule:** the conversation ends when (a) all embedded opportunities have been surfaced AND (b) the provider has asked a closing question ("Anything else before we finish?") and the participant has responded. 
- **Hard cap:** 12 participant turns or 10 minutes, whichever comes first. On cap, the provider gracefully closes the visit regardless of arc position.
- Rationale (for reference): mirrors OSCE/standardized-patient station design; guarantees consistent skill-elicitation evidence for the report card; protects session time budget.

## 5. Coach interventions

- Trigger rule: **missed opportunity**. If the participant's response to an embedded opportunity does not attempt the invited PACE behavior, the coach intervenes with one short nudge (1–2 sentences: name the moment + suggest a concrete phrasing). Example: "The doctor used the term 'idiopathic' — this is a good moment to check your understanding. You could ask, 'Can you explain what that means for me?'"
- Also allow **one brief positive reinforcement** when the participant successfully uses a PACE behavior unprompted.
- **Budget: max 2–3 interventions per role-play.** If more opportunities are missed, remaining ones go to the report card instead. Interventions must not stack (never two coach messages in a row).
- After a nudge, the provider re-offers the opportunity once (e.g., pauses, or restates), so the participant can retry.

## 6. Report card

Generated from the transcript at termination. Structure, per PACE component:

1. **What you did** — short summary quoting the participant's own words from the transcript.
2. **Rating** — three-level indicator only: *Tried it / Partially / Opportunity missed*, mapped to the embedded opportunities. **No numeric scores.**
3. **One strength** (specific, behavior-level).
4. **One thing to try** — a concrete alternative phrasing.

Close with a single **"goal for your next real visit"** line (feed-forward). Total length target: fits on one screen without scrolling much; this is read in ~2 minutes and then discussed in the interview.

Rationale: constructive alignment (assessment mirrors the PACE framework taught); Hattie & Timperley feedback model (specific, behavior-level, feed-forward); numeric scores are non-actionable and potentially discouraging in a health context.

## 7. Implementation notes

- Provider and coach should be clearly distinct in the UI (name, color, avatar). The coach must feel like an aside, not a third conversation partner.
- Each scenario = a config object: persona description, visit arc script, list of embedded opportunities (each with: trigger condition, invited PACE skill, coach nudge text, retry behavior), closing line.
- Log per message: timestamp, role (participant/provider/coach), and which opportunity (if any) it relates to and whether it was met/missed. This log drives the report card and the researcher export.
- Report card generation can be a second LLM call over the annotated transcript, constrained to the Section 6 structure (prompt it to return structured JSON, render client-side).
- Keep model prompts and scenario configs in separate, editable files; scenario wording will be iterated after early pilot interviews.
- Repo hygiene (public repo): API key in environment variables only, `.env` in `.gitignore` from the first commit, `.env.example` documenting required variables. All Claude API calls go through the serverless proxy; the frontend never talks to api.anthropic.com directly.
- Transcript/report card export stays client-side (download as JSON/print view); do not persist participant transcripts on the server.

## 8. Open items (do not silently resolve)

- Final wording of PACE education materials (adapting from existing PACE text materials used in the interview protocol).
- Exact clinical vignette details per scenario (keep low-acuity; confirm with advisor).
- Whether participants type or speak (current assumption: typed chat).
- Export format for researcher (current assumption: JSON + printable report card view).
