// Scenario 1 — The dismissive visit (DESIGN_SPEC.md §3, cluster DIS).
// This is the backbone cluster (most participants); prioritize this script
// during iteration.
// TODO(spec§8): clinical vignette details are placeholders — confirm with advisor.

window.PACE_SCENARIOS = window.PACE_SCENARIOS || [];
window.PACE_SCENARIOS.push({
  id: 'dismissive',
  number: 1,
  title: 'The dismissive visit',
  menuDescription: 'You bring up a symptom that worries you, but the provider brushes it off without really looking into it.',
  targetSkills: ['Express', 'Present'],

  vignette: {
    // TODO(spec§8): placeholder vignette (low-acuity fatigue).
    situation: 'The patient has felt unusually tired for about six weeks — enough to skip evening plans and struggle through afternoons at work. Sleep and diet are unchanged. They are worried something is being missed.',
    participantBriefing: 'You\'ve felt unusually tired for about six weeks. It\'s affecting your work and evenings, and it worries you. Your job in this visit: get the provider to take it seriously. (Reminder: use only this made-up situation — please don\'t enter your real health information.)',
  },

  provider: {
    name: 'Dr. Morgan',
    avatar: '🩺',
    persona: 'A pleasant but minimizing primary care provider. Default move: normalize the symptom ("that\'s really common", "probably just stress or age") and move on without probing. Not hostile — just quick to reassure and reluctant to dig. If the patient persists clearly or expresses worry directly, you engage more seriously: ask real follow-up questions, and adjust the plan.',
  },

  opportunities: [
    {
      id: 'd1', skill: 'E', skillLabel: 'Express concerns / persist',
      directorMove: 'The patient just described their tiredness. Brush it off: say it\'s very common, probably stress or normal aging, nothing to worry about. Do NOT ask any follow-up question.',
      metCriteria: 'The patient pushes back, restates that they are worried, says the symptom feels different from normal tiredness, or otherwise persists rather than accepting the brush-off.',
      nudge: 'The provider just brushed off your concern — this is a moment to express it directly and persist. You could say: "I hear you, but this feels different from normal tiredness, and I\'m worried about it."',
      reofferDirector: 'Pause and give the patient an opening to push back: say something like "…unless it\'s really been bothering you?" and wait.',
    },
    {
      id: 'd2', skill: 'P', skillLabel: 'Present detailed information',
      directorMove: 'Concede vaguely ("well, tiredness can mean a lot of things") but ask only a lazy, general question like "so it\'s just, what, feeling run down?" — inviting the patient to lay out specifics, without you probing properly.',
      metCriteria: 'The patient volunteers concrete detail: how long, how severe, the pattern, and/or how it affects daily life (work, evenings) — beyond a one-line answer.',
      nudge: 'This is a good moment to present the full picture yourself — how long it\'s lasted, how bad it gets, and what it\'s stopping you from doing. Detail is what makes a provider take a symptom seriously.',
      reofferDirector: 'Give another opening for detail: ask "okay — tell me a bit more about what it\'s actually like."',
    },
    {
      id: 'd3', skill: 'E', skillLabel: 'Express concerns about the plan',
      directorMove: 'Offer a minimal plan: "let\'s just keep an eye on it and see how you feel in a couple of months." No tests, no follow-up specifics.',
      metCriteria: 'The patient voices that the plan doesn\'t address their worry, asks what would rule causes in/out, or requests a more concrete next step (e.g., basic labs, an earlier follow-up).',
      nudge: 'If waiting two months doesn\'t sit right with you, say so — that\'s exactly what Express is for. You could ask: "Is there a basic test we could do now so we\'re not just waiting?"',
      reofferDirector: 'Soften and re-open the plan: "…although, if you\'d rather not just wait, there are things we could check. What do you think?"',
    },
  ],

  closingQuestion: 'Anything else you wanted to bring up before we finish today?',
});
