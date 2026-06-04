import { useMemo } from "react";
import { validateSubmission } from "../utils/validation";

const ComplianceTray = ({ rankedResults }) => {
  const validation = useMemo(() => validateSubmission(rankedResults), [rankedResults]);
  const isReady = rankedResults.length > 0;

  return (
    <div className="border-t border-borderline bg-canvas/90 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Submission Validation Engine</p>
          <h3 className="text-sm font-semibold text-slate-100">Technical Trace</h3>
        </div>
        <div className="text-xs text-slate-500">
          {isReady ? "Live" : "Idle"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 xl:grid-cols-4 gap-4 text-xs text-slate-400">
        <div className="border border-slate-800 rounded-md p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Element Counter</p>
          <p className={validation.totalRows === 100 ? "text-emerald" : "text-amber"}>
            {validation.totalRows}/100 rows
          </p>
        </div>
        <div className="border border-slate-800 rounded-md p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Primary Key</p>
          <p className={validation.uniqueCandidates === 100 ? "text-emerald" : "text-amber"}>
            {validation.uniqueCandidates} unique IDs
          </p>
        </div>
        <div className="border border-slate-800 rounded-md p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Rank Matrix</p>
          <p className={validation.uniqueRanks === 100 ? "text-emerald" : "text-amber"}>
            {validation.uniqueRanks} unique ranks
          </p>
        </div>
        <div className="border border-slate-800 rounded-md p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Compliance</p>
          <p className={validation.errors.length === 0 ? "text-emerald" : "text-amber"}>
            {validation.errors.length === 0 ? "No structural errors" : `${validation.errors.length} alerts`}
          </p>
        </div>
      </div>

      {validation.errors.length > 0 && (
        <div className="mt-3 border border-amber/40 bg-amber/10 rounded-md p-3 text-xs text-amber">
          <ul className="space-y-1">
            {validation.errors.slice(0, 5).map((error) => (
              <li key={error}>{error}</li>
            ))}
            {validation.errors.length > 5 && (
              <li>Additional findings suppressed for focus.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComplianceTray;
