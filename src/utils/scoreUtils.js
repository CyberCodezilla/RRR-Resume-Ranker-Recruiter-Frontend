import { formatPercent } from "./formatters";

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const average = (values) => {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

const safeNumber = (value) => (typeof value === "number" && !Number.isNaN(value) ? value : 0);

const monthsBetween = (start, end) => {
  if (!start || !end) {
    return null;
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
};

export const deriveBreakdown = (result, candidate) => {
  if (result?.breakdown) {
    const skill = clamp(result.breakdown.skill ?? result.breakdown.skill_match ?? 0);
    const semantic = clamp(result.breakdown.semantic ?? result.breakdown.semantic_fit ?? 0);
    const activity = clamp(result.breakdown.activity ?? result.breakdown.activity_signal ?? 0);
    return { skill, semantic, activity };
  }

  const skillAssessments = candidate?.redrob_signals?.skill_assessment_scores || {};
  const assessmentValues = Object.values(skillAssessments).map((value) => safeNumber(value));
  const skillCount = candidate?.skills?.length || 0;

  const skillScore = clamp(average(assessmentValues) / 100 * 0.7 + Math.min(skillCount / 20, 1) * 0.3);
  const years = safeNumber(candidate?.profile?.years_of_experience);
  const semanticScore = clamp(years / 15 * 0.6 + Math.min((candidate?.career_history?.length || 0) / 6, 1) * 0.4);

  const signals = candidate?.redrob_signals || {};
  const responseRate = safeNumber(signals.recruiter_response_rate);
  const completeness = safeNumber(signals.profile_completeness_score) / 100;
  const githubActivity = safeNumber(signals.github_activity_score);
  const githubScore = githubActivity > -1 ? githubActivity / 100 : 0.2;
  const activityScore = clamp(responseRate * 0.6 + completeness * 0.3 + githubScore * 0.1);

  return { skill: skillScore, semantic: semanticScore, activity: activityScore };
};

export const deriveReasoning = (result, candidate) => {
  if (result?.reasoning) {
    return result.reasoning;
  }

  const years = candidate?.profile?.years_of_experience ?? "--";
  const skillCount = candidate?.skills?.length ?? 0;
  const responseRate = candidate?.redrob_signals?.recruiter_response_rate;
  const responseText = responseRate != null ? formatPercent(responseRate) : "--";
  const title = candidate?.profile?.current_title || candidate?.profile?.headline || "Candidate";

  return `${title} with ${years} yrs; ${skillCount} skills; response rate ${responseText}.`;
};

export const computeFallbackRanking = (candidates) => {
  const scored = candidates.map((candidate) => {
    const breakdown = deriveBreakdown(null, candidate);
    const score =
      breakdown.skill * 0.45 +
      breakdown.semantic * 0.35 +
      breakdown.activity * 0.2;

    return {
      candidate_id: candidate.candidate_id,
      score: Number(score.toFixed(4)),
      reasoning: deriveReasoning(null, candidate),
      breakdown,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.candidate_id.localeCompare(b.candidate_id);
  });

  return scored.slice(0, 100).map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
};

export const normalizeRankedResults = (results, candidates) => {
  const candidateMap = new Map(
    candidates.map((candidate) => [candidate.candidate_id, candidate])
  );

  return (results || []).map((result, index) => {
    const candidateId = result.candidate_id || result.candidateId || result.id;
    const candidate = candidateMap.get(candidateId);
    const breakdown = deriveBreakdown(result, candidate);

    return {
      candidate_id: candidateId,
      rank: Number(result.rank ?? index + 1),
      score: Number(result.score ?? result.total_score ?? result.final_score ?? 0),
      reasoning: deriveReasoning(result, candidate),
      breakdown,
    };
  });
};

export const detectTimelineAnomaly = (candidate) => {
  const history = candidate?.career_history || [];
  if (!history.length) {
    return false;
  }

  const intervals = [];
  let totalMonths = 0;

  for (const role of history) {
    const start = role.start_date;
    const end = role.end_date || new Date().toISOString();
    const duration = safeNumber(role.duration_months);

    if (!start || !end) {
      continue;
    }

    const computed = monthsBetween(start, end);
    if (computed != null && Math.abs(computed - duration) > 3) {
      return true;
    }

    if (computed != null && computed < 0) {
      return true;
    }

    totalMonths += duration;
    intervals.push({ start: new Date(start), end: new Date(end) });
  }

  intervals.sort((a, b) => a.start - b.start);
  for (let i = 1; i < intervals.length; i += 1) {
    if (intervals[i].start < intervals[i - 1].end) {
      return true;
    }
  }

  const years = safeNumber(candidate?.profile?.years_of_experience);
  if (years > 0 && totalMonths > years * 12 + 12) {
    return true;
  }

  return false;
};
