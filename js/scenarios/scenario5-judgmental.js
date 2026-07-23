// Scenario 5 — The judgmental comment (DESIGN_SPEC.md §3, cluster JUDG).
// MUST STAY MILD (spec §3 notes): survey respondents reported far more severe
// stigma (race, substance use, hostile staff); this standardized version uses a
// mild weight/lifestyle analog to exercise the same skill without distress.
// The interview protocol probes whether the mild version feels like adequate
// practice for the severe reality — do not escalate the script to "fix" that.
// TODO(spec§8): clinical vignette details are placeholders — confirm with advisor.

window.PACE_SCENARIOS = window.PACE_SCENARIOS || [];
window.PACE_SCENARIOS.push({
  id: 'judgmental',
  number: 5,
  title: 'The judgmental comment',
  menuDescription: 'You\'re in for something routine when the provider makes an off-topic comment about your weight and lifestyle. It stings, and it\'s not what you came for.',
  targetSkills: ['Express'],

  vignette: {
    // TODO(spec§8): placeholder vignette (sinus congestion visit + weight remark).
    situation: 'The patient is in for two weeks of sinus congestion — a routine visit. Partway through, the provider makes an unsolicited comment connecting the visit to the patient\'s weight and lifestyle, which is unrelated to why they came.',
    participantBriefing: 'You\'re here for two weeks of sinus congestion — that\'s it. At some point the provider will make an off-topic remark about your weight. Your job: name how the comment lands (if you choose to) and steer the visit back to what you actually came for. (Reminder: use only this made-up situation — please don\'t enter your real health information.)',
  },

  provider: {
    name: 'Dr. Whitfield',
    avatar: '🌡️',
    persona: 'A brisk, confident provider who considers unsolicited lifestyle commentary part of good doctoring. Your remarks are mild and delivered as helpfulness, never hostile — think "while you\'re here, you\'d feel better across the board if you dropped a few pounds." IMPORTANT: keep all such remarks mild; never mock, never moralize at length, never mention anything beyond weight/general lifestyle. If the patient names the comment or redirects, respond like a professional caught off guard but decent: acknowledge briefly, don\'t argue or double down, and return to the sinus problem.',
  },

  opportunities: [
    {
      id: 'j1', skill: 'E', skillLabel: 'Express / name the moment',
      directorMove: 'While assessing the sinus complaint, drop ONE mild unsolicited remark tying general health to their weight ("some of this congestion sluggishness — honestly, carrying less weight would help everything"). Then continue as if nothing happened.',
      metCriteria: 'The patient responds to the remark at all on their own terms: names that it felt off-topic or uncomfortable, questions its relevance, or explicitly sets it aside — rather than silently absorbing it.',
      nudge: 'That comment was off-topic, and it\'s okay to say so — calmly naming it is a skill. You could say: "I\'d rather stay focused on my sinuses today — the weight comment isn\'t what I\'m here for."',
      reofferDirector: 'Leave a small silence, then a half-acknowledgment that reopens the moment: "…anyway, where was I. You were saying about the congestion?"',
    },
    {
      id: 'j2', skill: 'E', skillLabel: 'Redirect to your agenda',
      directorMove: 'Drift once more toward general lifestyle territory — briefly and mildly ("sleep, exercise, all of it matters") — steering away from the sinus problem the patient came for.',
      metCriteria: 'The patient steers the visit back to the sinus complaint: restates what they came for, asks a sinus-related question, or explicitly moves the agenda back.',
      nudge: 'The visit is drifting from what you came for. Pull it back — "What I really need today is help with the congestion. What do you think is going on there?"',
      reofferDirector: 'Catch yourself: "But that\'s not why you booked today — remind me exactly what the congestion\'s been doing?"',
    },
    {
      id: 'j3', skill: 'A', skillLabel: 'Ask about the actual problem',
      directorMove: 'Now properly address the sinus issue: give a short assessment (likely viral or allergic congestion) and a simple plan (saline rinse, an OTC option, return if worse) — but compressed, leaving room for questions.',
      metCriteria: 'The patient asks at least one question about the assessment or plan (which OTC option, how long before it should improve, what "worse" means).',
      nudge: 'Now that you\'ve got the visit back on track, use it — ask something concrete, like "How long should I try the rinse before coming back?"',
      reofferDirector: 'Offer the opening: "Questions on any of that before we wrap up?"',
    },
  ],

  closingQuestion: 'Alright — anything else before we finish up?',
});
