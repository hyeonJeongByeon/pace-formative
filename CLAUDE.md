# PACE Formative Study — Project Rules

## Authoritative spec
`DESIGN_SPEC.md` in this repo is the source of truth for all design decisions
(scenario structure, termination logic, coach budget, report card structure).
Do not change anything the spec defines without explicitly flagging it as a
deviation from the study design. When code and spec disagree, the spec wins.

## Section 8 open items stay unresolved
The items in DESIGN_SPEC.md §8 (education material wording, clinical vignette
details, typed vs. spoken input, researcher export format) are intentionally
undecided. Implement them only as clearly labeled placeholders — mark them
`TODO(spec§8)` in code — and never silently pick a final answer for them.
Current working assumptions: typed chat; export = JSON + printable report view.

## Participant data is never committed
No participant data files enter this repo, ever: no survey exports, no coded
CSVs, no transcripts, no report cards, no session logs, no files containing
response IDs or emails. `.gitignore` blocks `*.csv` as a backstop, but the rule
covers any format. Transcript/report export is client-side download only; no
server-side persistence (DESIGN_SPEC.md §7).

## Secrets
This will be a public repo. The Anthropic API key exists only in the serverless
proxy's environment (see `.env.example`); it must never appear in frontend
code, committed files, or commit history. All model calls go through the proxy
— the frontend never calls api.anthropic.com directly.
