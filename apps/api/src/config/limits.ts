/**
 * Hard limits for Worker-Friendly RAG Answers
 * Configurable without editing prompt templates.
 */
export const ANSWER_LIMITS = {
  ANSWER_MAX_WORDS: 80,
  HEADLINE_MAX_WORDS: 12,
  STEPS_MAX_COUNT: 5,
  STEP_MAX_WORDS: 15,
  WARNINGS_MAX_COUNT: 3,
  WARNING_MAX_WORDS: 12,
  SENTENCE_AVG_WORDS: 12,
  SENTENCE_MAX_WORDS: 18,
  // Simpler mode tightened limits
  SIMPLER_STEPS_MAX_COUNT: 4,
  SIMPLER_STEP_MAX_WORDS: 10,
  SIMPLER_HEADLINE_MAX_WORDS: 10,
} as const;

export type AnswerLimits = typeof ANSWER_LIMITS;

