import { formatDate, formatNumber, formatPercent, formatScore } from "../utils/formatters";
import { deriveBreakdown, deriveReasoning } from "../utils/scoreUtils";

const formatBool = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "--";
};

const formatRange = (range) => {
  if (!range) return "--";
  return `${formatNumber(range.min, 1)} - ${formatNumber(range.max, 1)} LPA`;
};

const getCompanyCategory = (industry) => {
  if (!industry) return "Unknown";
  return industry.toLowerCase().includes("it") ? "IT Services" : "Product";
};

const ProgressBar = ({ value, color }) => {
  const width = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="h-1 w-full rounded bg-slate-900 mt-1">
      <div className={`h-1 rounded ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
};

const getRoleAnomaly = (role, index, career) => {
  const start = role.start_date;
  const end = role.end_date || new Date().toISOString();
  const duration = Number(role.duration_months || 0);

  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
    const computed = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    if (Math.abs(computed - duration) > 3) {
      return `Duration mismatch (reported ${duration}m, computed ${computed}m)`;
    }
    if (computed < 0) {
      return "Negative duration (invalid date order)";
    }
  }

  const currentInterval = { start: new Date(start), end: new Date(end) };
  for (let i = 0; i < career.length; i++) {
    if (i === index) continue;
    const other = career[i];
    const otherStart = other.start_date;
    const otherEnd = other.end_date || new Date().toISOString();
    if (!otherStart || !otherEnd) continue;
    const otherInterval = { start: new Date(otherStart), end: new Date(otherEnd) };
    if (currentInterval.start < otherInterval.end && otherInterval.start < currentInterval.end) {
      return `Overlaps with role: ${other.title} at ${other.company}`;
    }
  }

  return null;
};

const CandidateModal = ({ candidate, result, onClose }) => {
  const profile = candidate.profile || {};
  const signals = candidate.redrob_signals || {};
  const breakdown = deriveBreakdown(result, candidate);
  const reasoning = deriveReasoning(result, candidate);
  const skillScores = signals.skill_assessment_scores || {};
  const skills = candidate.skills || [];

  const skillRows = skills.map((skill) => ({
    name: skill.name,
    proficiency: skill.proficiency,
    assessment: skillScores[skill.name],
    duration: skill.duration_months,
  }));

  Object.keys(skillScores).forEach((name) => {
    if (!skillRows.find((row) => row.name === name)) {
      skillRows.push({
        name,
        proficiency: "--",
        assessment: skillScores[name],
        duration: "--",
      });
    }
  });

  const getProficiencyStyle = (prof) => {
    const p = String(prof).toLowerCase();
    if (p === "expert") return "bg-emerald/10 text-emerald border-emerald/20";
    if (p === "advanced") return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    if (p === "intermediate") return "bg-cobalt/10 text-cobalt border-cobalt/20";
    if (p === "beginner") return "bg-slate-800 text-slate-400 border-slate-700";
    return "bg-slate-900 text-slate-500 border-slate-800";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="h-full w-full max-w-5xl bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-900 bg-slate-950">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-mono">Profile Explorer</p>
            <h3 className="text-xl font-bold text-white mt-1">{profile.anonymized_name}</h3>
            <p className="text-xs text-slate-400 mt-1">{profile.headline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-wider font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded transition-all duration-200"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-3.5 text-xs font-mono text-slate-500 border-b border-slate-900 bg-slate-950/60 flex flex-wrap gap-x-4 gap-y-1">
          <span>Overall Fit Score: <strong className="text-emerald">{formatScore(result?.score)}</strong></span>
          <span className="text-slate-800">|</span>
          <span>Skill Match: <strong className="text-emerald">{formatPercent(breakdown.skill)}</strong></span>
          <span className="text-slate-800">|</span>
          <span>Semantic Match: <strong className="text-cobalt">{formatPercent(breakdown.semantic)}</strong></span>
          <span className="text-slate-800">|</span>
          <span>Platform Activity: <strong className="text-slate-300">{formatPercent(breakdown.activity)}</strong></span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="rounded-lg border border-slate-900 bg-slate-950/40 p-4 shadow-sm">
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">Automated Reasoning Synthesizer</h4>
            <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950 border border-slate-900 rounded p-3">
              {reasoning}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="border border-slate-900 bg-slate-900/10 rounded-lg p-5 flex flex-col">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-900 pb-3 mb-4">
                Employment Timeline Trace
              </h4>
              <div className="relative pl-6 border-l border-slate-800 space-y-6 flex-1">
                {candidate.career_history?.map((role, index) => {
                  const roleAnomaly = getRoleAnomaly(role, index, candidate.career_history || []);
                  return (
                    <div key={`${role.company}-${index}`} className="relative group">
                      <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-slate-950 transition-all duration-300 ${
                        roleAnomaly 
                          ? "border-amber shadow-[0_0_8px_rgba(217,119,6,0.3)] animate-pulse" 
                          : "border-slate-700 group-hover:border-emerald"
                      }`} />
                      
                      <div className={`rounded-md p-3.5 border transition-all duration-300 ${
                        roleAnomaly 
                          ? "bg-amber/5 border-amber/25 shadow-sm shadow-amber-500/5" 
                          : "bg-slate-950/60 border-slate-900 group-hover:border-slate-800"
                      }`}>
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <h5 className="text-xs font-semibold text-slate-100">{role.title}</h5>
                          <span className="text-[10px] font-mono text-slate-500">
                            {formatDate(role.start_date)} - {role.end_date ? formatDate(role.end_date) : "Present"}
                          </span>
                        </div>
                        <p className="text-xs text-emerald mt-0.5">{role.company}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {role.industry} · {getCompanyCategory(role.industry)} · {role.company_size} emp
                        </p>
                        {role.description && (
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed italic border-t border-slate-900 pt-2 font-sans">
                            &ldquo;{role.description}&rdquo;
                          </p>
                        )}
                        {roleAnomaly && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-amber border border-amber/20 bg-amber/10 p-1.5 rounded animate-pulse">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{roleAnomaly}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-6">
              <div className="border border-slate-900 bg-slate-900/10 rounded-lg p-5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-900 pb-3 mb-4">
                  Skills Assessment Ledger
                </h4>
                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-b border-slate-900 pb-2">
                    <span className="col-span-5">Skill Name</span>
                    <span className="col-span-4 text-center">Declared Prof.</span>
                    <span className="col-span-3 text-right">Assessed Score</span>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {skillRows.length === 0 && <p className="text-slate-500 text-xs italic">No skills catalogued.</p>}
                    {skillRows.map((skill) => (
                      <div key={skill.name} className="grid grid-cols-12 items-center text-xs border-b border-slate-900/30 pb-2">
                        <span className="col-span-5 font-semibold text-slate-200">{skill.name}</span>
                        <span className="col-span-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-mono capitalize ${getProficiencyStyle(skill.proficiency)}`}>
                            {skill.proficiency || "--"}
                          </span>
                        </span>
                        <span className="col-span-3 text-right font-mono font-bold text-emerald">
                          {skill.assessment != null ? `${formatNumber(skill.assessment, 0)}%` : "--"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-slate-900 bg-slate-900/10 rounded-lg p-5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-900 pb-3 mb-4">
                  Behavioral Signal Matrix
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                  <div className="border border-slate-900 bg-slate-950 p-3 rounded space-y-2 shadow-inner">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-1 mb-2 font-bold">Availability & Compensation</p>
                    <div className="flex justify-between">
                      <span>Notice Period:</span>
                      <span className={signals.notice_period_days <= 30 ? "text-emerald font-bold" : "text-slate-300"}>{signals.notice_period_days ?? "--"} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salary Expected:</span>
                      <span className="text-slate-300 font-semibold">{formatRange(signals.expected_salary_range_inr_lpa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Work Mode:</span>
                      <span className="text-slate-300 capitalize">{signals.preferred_work_mode ?? "--"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open To Work:</span>
                      <span className="text-slate-300">{formatBool(signals.open_to_work_flag)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relocation:</span>
                      <span className="text-slate-300">{formatBool(signals.willing_to_relocate)}</span>
                    </div>
                  </div>

                  <div className="border border-slate-900 bg-slate-950 p-3 rounded space-y-2.5 shadow-inner">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-1 mb-2 font-bold">Engagement Scores</p>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Recruiter Response:</span>
                        <span className="text-emerald font-bold">{formatPercent(signals.recruiter_response_rate)}</span>
                      </div>
                      <ProgressBar value={signals.recruiter_response_rate || 0} color="bg-emerald" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Interview Complete:</span>
                        <span className="text-cobalt font-bold">{formatPercent(signals.interview_completion_rate)}</span>
                      </div>
                      <ProgressBar value={signals.interview_completion_rate || 0} color="bg-cobalt" />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Avg Response Time:</span>
                      <span className="text-slate-300 font-semibold">{formatNumber(signals.avg_response_time_hours, 1)} hrs</span>
                    </div>
                  </div>

                  <div className="border border-slate-900 bg-slate-950 p-3 rounded space-y-2 shadow-inner">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-1 mb-2 font-bold">Verification Checklist</p>
                    <div className="flex justify-between">
                      <span>Email Verified:</span>
                      <span className={signals.verified_email ? "text-emerald" : "text-slate-600"}>{formatBool(signals.verified_email)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone Verified:</span>
                      <span className={signals.verified_phone ? "text-emerald" : "text-slate-600"}>{formatBool(signals.verified_phone)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LinkedIn Connected:</span>
                      <span className={signals.linkedin_connected ? "text-cobalt" : "text-slate-600"}>{formatBool(signals.linkedin_connected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GitHub Connected:</span>
                      <span className={signals.github_activity_score !== -1 ? "text-indigo-400" : "text-slate-600"}>
                        {signals.github_activity_score !== -1 ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-900 bg-slate-950 p-3 rounded space-y-2 shadow-inner">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-1 mb-2 font-bold">Activity Signals (30d)</p>
                    <div className="flex justify-between">
                      <span>Profile Completeness:</span>
                      <span className="text-slate-300 font-bold">{formatNumber(signals.profile_completeness_score, 1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profile Views:</span>
                      <span className="text-slate-300 font-semibold">{signals.profile_views_received_30d ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applications Sent:</span>
                      <span className="text-slate-300 font-semibold">{signals.applications_submitted_30d ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Search Appearances:</span>
                      <span className="text-slate-300 font-semibold">{signals.search_appearance_30d ?? 0}</span>
                    </div>
                    {signals.github_activity_score !== -1 && (
                      <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-1.5 text-indigo-400">
                        <span>GitHub Score:</span>
                        <span>{formatNumber(signals.github_activity_score, 1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
