import { useMemo, useState, useEffect } from "react";
import { validateSubmission } from "../utils/validation";

const ComplianceTray = ({ rankedResults, trayHeight }) => {
  const validation = useMemo(() => validateSubmission(rankedResults), [rankedResults]);
  const isReady = rankedResults.length > 0;

  // Window height tracking for dynamic vertical footprint compression
  const [viewportHeight, setViewportHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 1000);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isCompact = viewportHeight < 900;
  const actualHeight = isCompact ? 80 : (trayHeight || 160);

  if (isCompact) {
    return (
      <div 
        style={{ height: `${actualHeight}px` }} 
        className="border-t border-borderline bg-canvas/90 px-6 py-2.5 shrink-0 overflow-y-auto custom-scrollbar compliance-container font-mono flex items-center justify-between"
      >
        <div className="flex flex-row items-center justify-between w-full gap-4 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Validation Engine</p>
            <h3 className="text-xs font-bold text-slate-200">Technical Trace</h3>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">Rows:</span>
              <strong className={validation.totalRows === 100 ? "text-emerald" : "text-amber"}>
                {validation.totalRows}/100
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">IDs:</span>
              <strong className={validation.uniqueCandidates === 100 ? "text-emerald" : "text-amber"}>
                {validation.uniqueCandidates}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">Ranks:</span>
              <strong className={validation.uniqueRanks === 100 ? "text-emerald" : "text-amber"}>
                {validation.uniqueRanks}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">Status:</span>
              <strong className={validation.errors.length === 0 ? "text-emerald" : "text-amber"}>
                {validation.errors.length === 0 ? "COMPLIANT" : `${validation.errors.length} ALERTS`}
              </strong>
            </span>
          </div>

          <div className="text-[10px] text-slate-500 uppercase">
            {isReady ? "Live" : "Idle"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ height: `${actualHeight}px` }} 
      className="border-t border-borderline bg-canvas/90 px-6 py-4 shrink-0 overflow-y-auto custom-scrollbar compliance-container"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Submission Validation Engine</p>
          <h3 className="text-sm font-semibold text-slate-100 font-mono">Technical Trace</h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {isReady ? "Live" : "Idle"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 xl:grid-cols-4 gap-4 text-xs text-slate-400 font-mono">
        <div className="border border-slate-800 rounded-none p-3 bg-slate-950/20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Element Counter</p>
          <p className={validation.totalRows === 100 ? "text-emerald font-bold" : "text-amber font-bold"}>
            {validation.totalRows}/100 rows
          </p>
        </div>
        <div className="border border-slate-800 rounded-none p-3 bg-slate-950/20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Primary Key</p>
          <p className={validation.uniqueCandidates === 100 ? "text-emerald font-bold" : "text-amber font-bold"}>
            {validation.uniqueCandidates} unique IDs
          </p>
        </div>
        <div className="border border-slate-800 rounded-none p-3 bg-slate-950/20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Rank Matrix</p>
          <p className={validation.uniqueRanks === 100 ? "text-emerald font-bold" : "text-amber font-bold"}>
            {validation.uniqueRanks} unique ranks
          </p>
        </div>
        <div className="border border-slate-800 rounded-none p-3 bg-slate-950/20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Compliance</p>
          <p className={validation.errors.length === 0 ? "text-emerald font-bold" : "text-amber font-bold"}>
            {validation.errors.length === 0 ? "No structural errors" : `${validation.errors.length} alerts`}
          </p>
        </div>
      </div>

      {validation.errors.length > 0 && (
        <div className="mt-3 border border-amber/40 bg-amber/10 rounded-none p-3 text-xs text-amber font-mono">
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
