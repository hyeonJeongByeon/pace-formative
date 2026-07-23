// App configuration. Researcher-editable.
window.PACE_CONFIG = {
  // Deployed Cloudflare Worker URL. Set after `wrangler deploy`.
  PROXY_URL: 'https://pace-proxy.pace-formative.workers.dev',

  // Hard caps — DESIGN_SPEC.md §4. Do not change without flagging a spec deviation.
  HARD_CAP_PARTICIPANT_TURNS: 12,
  HARD_CAP_MINUTES: 10,

  // Coach budget — DESIGN_SPEC.md §5.
  COACH_NUDGE_BUDGET: 3,     // max nudge interventions per role-play (spec: 2–3)
  COACH_PRAISE_BUDGET: 1,    // max positive reinforcements per role-play
};
