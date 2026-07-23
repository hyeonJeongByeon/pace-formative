// Scenario 2 — The rushed visit (DESIGN_SPEC.md §3, cluster RUSH).
// Per spec §3 notes: time pressure itself must be the obstacle (interruptions,
// closing early, short answers) — NOT dismissive content, so scenarios 1 and 2
// stay distinct in participant experience.
// TODO(spec§8): clinical vignette details are placeholders — confirm with advisor.

window.PACE_SCENARIOS = window.PACE_SCENARIOS || [];
window.PACE_SCENARIOS.push({
  id: 'rushed',
  number: 2,
  title: 'The rushed visit',
  menuDescription: 'The provider is running behind and keeps trying to wrap up the visit before you\'ve gotten to everything you came for.',
  targetSkills: ['Ask', 'Express', 'Present'],

  vignette: {
    // TODO(spec§8): placeholder vignette (medication follow-up).
    situation: 'The patient is at a follow-up for a blood pressure medication started three months ago. They need a refill, but they also have two other things on their list: occasional lightheadedness when standing up, and a question about whether they can exercise harder.',
    participantBriefing: 'You\'re here for a blood pressure medication follow-up. You need the refill — but you also want to mention lightheadedness when standing, and ask about exercising harder. The provider is rushed; your job is to get through your whole list anyway. (Reminder: use only this made-up situation — please don\'t enter your real health information.)',
  },

  provider: {
    name: 'Dr. Lee',
    avatar: '⏱️',
    persona: 'A competent, friendly provider having a badly overbooked day. You answer accurately but curtly, mention the schedule ("we\'re a bit slammed today"), and try to close the visit as soon as the surface task (the refill) is handled. You are NOT dismissive — you take anything the patient raises seriously — but they have to get it in before you reach the door. If the patient sets an agenda or insists, you slow down and address it properly.',
  },

  opportunities: [
    {
      id: 'r1', skill: 'E', skillLabel: 'Express / set your agenda',
      directorMove: 'Open briskly: confirm this is the blood-pressure refill visit, say the numbers look fine and you\'ll send the refill, and start moving toward wrapping up — all in one breath. Do not ask if they have other concerns.',
      metCriteria: 'The patient states up front that they have other items to cover (mentions the lightheadedness and/or the exercise question, or says "I have a couple of things today").',
      nudge: 'The visit is about to end with your list untouched. Set your agenda now — you could say: "Before we finish, I have two other things today: some lightheadedness, and a question about exercise."',
      reofferDirector: 'Hand on the door, pause: "Sorry — was there something else you needed today?" and wait.',
    },
    {
      id: 'r2', skill: 'A', skillLabel: 'Ask questions',
      directorMove: 'Address whatever they raised, but with a rapid, compressed answer that leaves obvious gaps (e.g., for lightheadedness: "that can happen with this med, stand up slower" — no when-to-worry, no alternatives), then move to close again.',
      metCriteria: 'The patient asks a direct follow-up question — e.g., when the lightheadedness would be concerning, whether the dose should change, or specifics on the exercise question.',
      nudge: 'That answer was quick and left gaps — it\'s okay to hold the moment and ask. For example: "When would the lightheadedness be something to worry about?"',
      reofferDirector: 'Catch yourself rushing: "That was quick of me — anything you want me to expand on?"',
    },
    {
      id: 'r3', skill: 'E', skillLabel: 'Express / hold the floor',
      directorMove: 'Start closing early again while at least one of the patient\'s items is still unaddressed: summarize hastily ("Okay so — refill\'s in, stand up slow, we\'re good") and reach to end the visit.',
      metCriteria: 'The patient holds the floor: says they still have an unanswered item, or returns to the un-covered topic instead of accepting the close.',
      nudge: 'You still have something on your list. It\'s fine to hold the door: "One more thing before we stop — I still need an answer about the exercise."',
      reofferDirector: 'Stop, sit back down verbally: "You know what, take your time — what\'s the last thing?"',
    },
  ],

  closingQuestion: 'Okay — did we get through everything on your list today?',
});
