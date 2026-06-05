import ScoreBar from "./ScoreBar";
import { detectTimelineAnomaly, deriveBreakdown, deriveReasoning } from "../utils/scoreUtils";
import { formatScore, formatPercent } from "../utils/formatters";

const CandidateCard = ({ result, candidate, onSelect }) => {
  const profile = candidate?.profile || {};
  const breakdown = deriveBreakdown(result, candidate);
  const reasoning = deriveReasoning(result, candidate);
  const anomaly = detectTimelineAnomaly(candidate);
  const topSkills = (candidate?.skills || []).slice(0, 4);

  const getScoreColor = (score) => {
    const val = score <= 1 ? score * 100 : score;
    if (val >= 80) return "text-emerald border-emerald/20 bg-emerald/5";
    if (val >= 60) return "text-cobalt border-cobalt/20 bg-cobalt/5";
    return "text-slate-400 border-slate-800 bg-slate-900/40";
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left px-6 py-5 hover:bg-slate-900/30 border-l-2 border-l-transparent hover:border-l-emerald/70 transition-all duration-300 ease-in-out bg-canvas rounded-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-none bg-slate-900 border border-slate-800 text-[10px] font-bold font-mono text-slate-400">
              #{result.rank}
            </span>
            <h3 className="text-base font-semibold text-slate-100 group-hover:text-emerald transition-colors duration-200">
              {profile.anonymized_name || "Unknown Candidate"}
            </h3>
            <span className="text-[10px] text-slate-600 font-mono">
              {result.candidate_id}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-300 mt-1.5 line-clamp-1">{profile.headline}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {profile.current_title} · {profile.current_company} · {profile.location}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Fit Index</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-none border font-mono text-base font-bold mt-1.5 shadow-sm ${getScoreColor(result.score)}`}>
            {formatScore(result.score)}
          </span>
        </div>
      </div>

      <div className="mt-4 bg-slate-950/20 border border-slate-900/60 rounded-none p-3">
        <ScoreBar
          segments={[
            { label: "Skill Congruence", value: breakdown.skill, color: "bg-emerald" },
            { label: "Semantic Sequence", value: breakdown.semantic, color: "bg-cobalt" },
            { label: "Platform Activity", value: breakdown.activity, color: "bg-slate-500" },
          ]}
        />
        <div className="grid grid-cols-3 text-[10px] text-slate-500 mt-2 font-mono">
          <span className="text-left">Skill: <strong className="text-slate-400">{formatPercent(breakdown.skill)}</strong></span>
          <span className="text-center">Semantic: <strong className="text-slate-400">{formatPercent(breakdown.semantic)}</strong></span>
          <span className="text-right">Activity: <strong className="text-slate-400">{formatPercent(breakdown.activity)}</strong></span>
        </div>
      </div>

      <p className="mt-3 text-xs font-mono text-slate-400 bg-slate-950/40 border border-slate-900/80 rounded-none p-2.5 line-clamp-2 leading-relaxed">
        {reasoning}
      </p>

      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {topSkills.map((skill) => (
            <span key={skill.name} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-none">
              {skill.name}
            </span>
          ))}
        </div>
      )}

      {anomaly && (
        <div className="mt-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber border border-amber/20 bg-amber/5 rounded-none p-2 shadow-sm animate-pulse">
          <svg className="h-4 w-4 shrink-0 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Employment history chronologies discrepancy detected.</span>
        </div>
      )}
    </button>
  );
};

export default CandidateCard;
