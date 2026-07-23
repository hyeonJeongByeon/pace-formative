// Scenario 4 — The hard-to-describe problem (DESIGN_SPEC.md §3, cluster EXPR).
// Neutral provider; the challenge lives on the participant's side: conveying an
// ambiguous symptom clearly (onset, duration, severity, impact).
// TODO(spec§8): clinical vignette details are placeholders — confirm with advisor.
// (Vignette choice mirrors the survey exemplar: trouble describing a rash.)

window.PACE_SCENARIOS = window.PACE_SCENARIOS || [];
window.PACE_SCENARIOS.push({
  id: 'hard-to-describe',
  number: 4,
  title: 'The hard-to-describe problem',
  menuDescription: 'The provider is perfectly nice — but your symptom is vague and hard to put into words, and it\'s on you to get it across.',
  targetSkills: ['Present'],

  vignette: {
    // TODO(spec§8): placeholder vignette (intermittent rash + odd skin sensation).
    situation: 'The patient has a skin problem that comes and goes: a faint blotchy rash on the forearms with an odd tingling-itch that isn\'t quite itching. It appears some evenings, lasts an hour or two, and is gone by morning — including today, so there is nothing to show.',
    participantBriefing: 'You have a rash that comes and goes — faint, blotchy, on your forearms, with a weird tingling that\'s hard to name. Of course, it\'s not there right now. Your job: describe it well enough (when it started, how often, what it feels like, what it stops you doing) that the provider can actually work with it. (Reminder: use only this made-up situation — please don\'t enter your real health information.)',
  },

  provider: {
    name: 'Dr. Rivera',
    avatar: '🌿',
    persona: 'A warm, neutral, unhurried provider — no communication obstacles at all. You ask reasonable open questions and give the patient room. You work with exactly what the patient gives you: if their description is thin, your working assessment stays visibly generic; if they give you specifics, your assessment sharpens accordingly. You never guess details they haven\'t provided.',
  },

  opportunities: [
    {
      id: 'h1', skill: 'P', skillLabel: 'Present the symptom in detail',
      directorMove: 'Open the visit warmly and ask an open question: "So, tell me what\'s been going on with your skin?" Then give them space — don\'t fire follow-up questions yet.',
      metCriteria: 'The patient goes beyond one vague line: attempts specifics on appearance, sensation, timing/onset, or frequency — even imperfectly.',
      nudge: 'This is your moment to paint the picture — when it started, how often it shows up, what it looks and feels like. Even "it\'s hard to describe, but the closest thing is…" works well.',
      reofferDirector: 'Stay open and unhurried: "Take your time — describe it however makes sense to you, even roughly."',
    },
    {
      id: 'h2', skill: 'P', skillLabel: 'Describe severity and impact',
      directorMove: 'Reflect neutrally on what they\'ve said so far, then ask ONE gentle open question about what it\'s like to live with: "And how much is this actually bothering you day to day?"',
      metCriteria: 'The patient conveys severity or life impact: how bothersome it is, what it interferes with (sleep, clothing choices, concentration), or how worried it makes them.',
      nudge: 'Providers calibrate on impact — say what it actually costs you: "It wakes me up some nights" tells them more than "it\'s annoying."',
      reofferDirector: 'Ask once more, concretely: "Has it changed anything you do — sleep, clothes, work?"',
    },
    {
      id: 'h3', skill: 'P', skillLabel: 'Correct the record',
      directorMove: 'Summarize their symptom back — but make the summary slightly WRONG or incomplete in one specific way (e.g., call it "an itchy rash that\'s there most of the time" if they said it comes and goes, or drop the tingling). Deliver it as your working note: "So what I\'m hearing is…"',
      metCriteria: 'The patient corrects or completes the summary — points out the error or adds back the missing element — rather than letting it stand.',
      nudge: 'The provider\'s summary didn\'t quite match what you said — fix the record now, before it goes in the chart. "Actually, one correction — it comes and goes, it\'s not constant."',
      reofferDirector: 'Double-check your own note: "Let me make sure I got that right — did I state it the way you\'d put it?"',
    },
  ],

  closingQuestion: 'Is there anything about it we haven\'t captured before we finish?',
});
