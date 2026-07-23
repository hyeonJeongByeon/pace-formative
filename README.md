# PACE Role-Play Prototype (Formative Study)

Practice tool for a formative study on patient communication training (PACE:
Present, Ask, Check, Express). A participant does a short role-play with an AI
provider; a coach nudges at missed communication opportunities; a report card
is generated at the end. See `DESIGN_SPEC.md` (authoritative) and `CLAUDE.md`
(project rules).

## Layout

```
index.html              app shell (views: gate → education → menu → briefing → chat → report)
css/styles.css
js/config.js            proxy URL + caps/budgets (researcher-editable)
js/prompts.js           model prompt templates (researcher-editable)
js/scenarios/*.js       one file per scenario: persona, vignette, opportunities,
                        coach nudge wording (researcher-editable — iterate here)
js/app.js               conversation engine (opportunity scheduling, coach budget,
                        termination, logging, report card, export)
proxy/worker.js         Cloudflare Worker — the only place the API key lives
proxy/wrangler.toml
archive/                pre-spec prototype, reference only
```

## One-time setup

1. **Deploy the proxy** (needs a free Cloudflare account):

   ```bash
   cd proxy
   npx wrangler login          # opens browser
   npx wrangler deploy         # prints your worker URL
   npx wrangler secret put ANTHROPIC_API_KEY    # paste key at the hidden prompt
   npx wrangler secret put STUDY_PASSCODE       # choose the session passcode
   ```

2. **Point the frontend at the proxy**: put the printed worker URL into
   `js/config.js` → `PROXY_URL`.

3. **Deploy the frontend** as any static site (GitHub Pages works: Settings →
   Pages → deploy from `main`). Then tighten `ALLOWED_ORIGIN` in
   `proxy/wrangler.toml` to that origin and `npx wrangler deploy` again.

## Local development

```bash
python3 -m http.server 8080     # from repo root; open http://localhost:8080
```

The chat requires the deployed proxy (there is no local mock). Everything
before the chat (education, menu, briefing) works without it.

## Editing scenarios (post-pilot iteration)

Each scenario is one self-contained file in `js/scenarios/`. The fields you
will most likely touch: `menuDescription`, `vignette.*`, `provider.persona`,
and each opportunity's `directorMove` / `metCriteria` / `nudge` /
`reofferDirector`. No other file needs to change.

## Study-session flow (researcher)

1. Open the site, enter the study passcode.
2. Participant reads the PACE education screen (~2 min).
3. Participant browses the menu; you direct them to their assigned scenario.
4. Role-play runs (~12 turns / 10 min max; "End visit" in the header is your
   escape hatch — the provider closes gracefully).
5. Report card appears; discuss, then **Download session (JSON)** and/or
   **Print report**. Nothing is stored server-side.

## Rules that must not regress

- API key: proxy environment only. Never in frontend code, repo, or history.
- No participant data committed to this repo, ever (see `CLAUDE.md`).
- `TODO(spec§8)` placeholders (education wording, vignette details, typed vs.
  spoken, export format) stay unresolved until decided outside the code.
