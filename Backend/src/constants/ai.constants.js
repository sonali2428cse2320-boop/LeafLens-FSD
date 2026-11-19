
const DIAGNOSIS_CONFIDENCE_THRESHOLD = 0.5;

const DIAGNOSIS_STATUS = Object.freeze({
  COMPLETED: "completed",
  LOW_CONFIDENCE: "low_confidence",
});

const DIAGNOSIS_HEALTH_STATUS = Object.freeze({
  HEALTHY: "healthy",
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
  UNCERTAIN: "uncertain",
});

const DIAGNOSIS_LIKELIHOOD = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

const DIAGNOSIS_LIMITS = Object.freeze({
  MAX_SYMPTOMS: 10,
  MAX_SYMPTOM_LENGTH: 200,
  MAX_RESULTS_PER_PAGE: 50,
  DEFAULT_PAGE_SIZE: 10,
});

module.exports = {
  DIAGNOSIS_CONFIDENCE_THRESHOLD,
  DIAGNOSIS_STATUS,
  DIAGNOSIS_HEALTH_STATUS,
  DIAGNOSIS_LIKELIHOOD,
  DIAGNOSIS_LIMITS,
};
