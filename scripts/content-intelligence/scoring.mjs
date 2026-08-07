const penaltyValue = (candidate, key, maximum) => {
  const states = {
    inadequateEvidence: ["none", "inadequate"].includes(candidate.evidenceState) ? maximum : 0,
    likelyDuplication: ["likely", "duplicate"].includes(candidate.overlapState) ? Math.min(maximum, 10) : 0,
    unclearImageRights: candidate.imageRightsState === "unclear" ? maximum : 0,
    unsupportedNumericalPrecision: candidate.numericalPrecisionState === "unsupported" ? maximum : 0,
    genericTravelListFraming: ["generic-list", "sensational"].includes(candidate.framing) ? maximum : 0,
    confidentialityRisk: candidate.confidentialityState === "unresolved" ? maximum : 0,
  };
  return states[key];
};
export function scoreTopic(candidate, rules) {
  const unknownScores = Object.keys(candidate.scores ?? {}).filter((key) => !(key in rules.weights));
  if (unknownScores.length) throw new Error(`Unknown scoring key: ${unknownScores[0]}.`);
  const factorScores = Object.fromEntries(Object.keys(rules.weights).map((key) => [key, Number(candidate.scores?.[key] ?? 0)]));
  const rawScore = Math.round(Object.entries(rules.weights).reduce((sum, [key, weight]) => sum + (factorScores[key] / 5) * weight, 0));
  const penalties = Object.fromEntries(Object.entries(rules.penalties).map(([key, rule]) => [key, penaltyValue(candidate, key, rule.maximumDeduction)]));
  const finalScore = Math.max(0, Math.min(100, rawScore - Object.values(penalties).reduce((sum, value) => sum + value, 0)));
  let recommendedStatus = rules.statusBands.find((band) => finalScore >= band.minimum)?.status ?? "hold";
  let editorialGateResult = "score band";
  if (["none", "inadequate"].includes(candidate.evidenceState)) { recommendedStatus = "research first"; editorialGateResult = "evidence gate"; }
  if (candidate.confidentialityState === "unresolved") { recommendedStatus = "hold"; editorialGateResult = "confidentiality gate"; }
  if (candidate.imageRightsState === "unclear") editorialGateResult += "; image rights review required";
  return { factorScores, penalties, rawScore, finalScore, scoreExplanation: `Raw score ${rawScore}/100; deductions: ${Object.entries(penalties).filter(([, value]) => value).map(([key, value]) => `${key} ${value}`).join(", ") || "none"}.`, editorialGateResult, recommendedStatus };
}
