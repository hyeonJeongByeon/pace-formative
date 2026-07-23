// Scenario 3 — The confusing explanation (DESIGN_SPEC.md §3, cluster COMP).
// TODO(spec§8): clinical vignette details are placeholders — confirm with advisor.

window.PACE_SCENARIOS = window.PACE_SCENARIOS || [];
window.PACE_SCENARIOS.push({
  id: 'confusing',
  number: 3,
  title: 'The confusing explanation',
  menuDescription: 'The provider explains what\'s going on using medical terms you don\'t know, and the plan they give you is vague.',
  targetSkills: ['Check', 'Ask'],

  vignette: {
    // TODO(spec§8): placeholder vignette (knee pain).
    situation: 'The patient has had knee pain for a month, worse going down stairs. Today the provider examines it and explains a diagnosis and plan — using clinical language and without much detail.',
    participantBriefing: 'You\'ve had knee pain for a month, worse on stairs, and you\'re here to find out what it is and what to do. Your job: leave actually understanding the diagnosis and the plan. (Reminder: use only this made-up situation — please don\'t enter your real health information.)',
  },

  provider: {
    name: 'Dr. Okafor',
    avatar: '🦴',
    persona: 'A knowledgeable, efficient provider who talks the way they chart: precise clinical vocabulary, no definitions, no checking whether it landed. Not unkind — just on autopilot. When the patient asks what a term means or asks you to slow down, you explain clearly and in plain language; you\'re good at it when prompted.',
  },

  opportunities: [
    {
      id: 'c1', skill: 'A', skillLabel: 'Ask about unfamiliar terms',
      directorMove: 'Deliver the diagnosis in one jargon-dense sentence: the presentation is consistent with patellofemoral pain syndrome, likely some chondromalacia, non-operative management is indicated. Then move on as if that were clear.',
      metCriteria: 'The patient asks what any of the terms mean, asks for plain language, or asks a direct question about what the diagnosis actually is.',
      nudge: 'The provider used terms most people don\'t know — this is exactly the moment to ask. You could say: "Can you explain what patellofemoral syndrome means in plain language?"',
      reofferDirector: 'Notice their expression: "…I threw some vocabulary at you there. Want me to translate any of it?"',
    },
    {
      id: 'c2', skill: 'A', skillLabel: 'Ask for a concrete plan',
      directorMove: 'Give a vague plan with no specifics: "conservative management — activity modification, PT, NSAIDs as needed, and we\'ll reassess if it doesn\'t settle." Do not specify what to modify, how to get PT, doses, or timeframe.',
      metCriteria: 'The patient asks for specifics on any part of the plan: what exactly to do or avoid, how physical therapy gets arranged, what to take and how often, or how long before reassessing.',
      nudge: 'That plan had no specifics you could act on. Pin one down — for example: "What exactly should I change about my activity, and for how long?"',
      reofferDirector: 'Offer an opening: "Any part of that plan you want me to make more concrete?"',
    },
    {
      id: 'c3', skill: 'C', skillLabel: 'Check your understanding',
      directorMove: 'Wrap up the instructions briskly and, without asking whether they understood, say you\'ll see them back if it isn\'t better.',
      metCriteria: 'The patient summarizes the plan back in their own words to confirm it ("so just to make sure I have this right…"), or asks the provider to confirm their restatement.',
      nudge: 'Before this ends, try saying the plan back in your own words — it\'s the single best way to catch a misunderstanding. "So to make sure I\'ve got it: I do X, and if it\'s not better in Y, I come back — right?"',
      reofferDirector: 'Pause at the end: "That was a lot — do you want to run it back to me so we\'re sure we\'re on the same page?"',
    },
  ],

  closingQuestion: 'Anything else I can clear up before we finish?',
});
