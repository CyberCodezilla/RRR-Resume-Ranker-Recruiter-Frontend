import { useMemo, useState } from "react";
import CandidateCard from "./CandidateCard";
import { detectTimelineAnomaly } from "../utils/scoreUtils";
import { exportPdfReport, exportWordReport } from "../utils/reportGenerator";

const ResultsPanel = ({
  rankedResults,
  candidates,
  isLoading,
  onSelectCandidate,
  jobDescription,
}) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [anomalyFilter, setAnomalyFilter] = useState("all"); // "all" | "only" | "exclude"
  const [availableOnly, setAvailableOnly] = useState(false);
  const [githubOnly, setGithubOnly] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeFiltersText = useMemo(() => {
    const filters = [];
    if (availableOnly) filters.push("Notice Period ≤ 30 Days");
    if (githubOnly) filters.push("GitHub Attached");
    if (anomalyFilter === "only") filters.push("Anomalies Only");
    if (anomalyFilter === "exclude") filters.push("Clean Timelines Only");
    if (query.trim()) filters.push(`Search: "${query.trim()}"`);
    return filters.join(", ") || "None (Full Shortlist)";
  }, [availableOnly, githubOnly, anomalyFilter, query]);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportPdfReport(
        filtered,
        jobDescription,
        stats,
        query,
        sortBy,
        activeFiltersText
      );
    } catch (err) {
      alert("Unable to generate PDF report.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportWord = () => {
    exportWordReport(
      filtered,
      jobDescription,
      stats,
      query,
      sortBy,
      activeFiltersText
    );
  };

  const stats = useMemo(() => {
    if (rankedResults.length === 0) {
      return { total: 0, avgScore: "0.0", anomalies: 0, availablePct: "0" };
    }
    const candidateMap = new Map(
      candidates.map((candidate) => [candidate.candidate_id, candidate])
    );

    const total = rankedResults.length;
    let sumScore = 0;
    let anomalies = 0;
    let availableCount = 0;

    rankedResults.forEach((res) => {
      const score = res.score <= 1 ? res.score * 100 : res.score;
      sumScore += score;

      const cand = candidateMap.get(res.candidate_id);
      if (cand) {
        if (detectTimelineAnomaly(cand)) {
          anomalies++;
        }
        const notice = cand.redrob_signals?.notice_period_days;
        if (notice != null && notice <= 30) {
          availableCount++;
        }
      }
    });

    return {
      total,
      avgScore: (sumScore / total).toFixed(1),
      anomalies,
      availablePct: ((availableCount / total) * 100).toFixed(0),
    };
  }, [rankedResults, candidates]);

  const filtered = useMemo(() => {
    const candidateMap = new Map(
      candidates.map((candidate) => [candidate.candidate_id, candidate])
    );

    const search = query.trim().toLowerCase();
    let itemsList = rankedResults.map((result) => ({
      result,
      candidate: candidateMap.get(result.candidate_id),
    }));

    if (search) {
      itemsList = itemsList.filter((row) => {
        const profile = row.candidate?.profile || {};
        const haystack = [
          profile.anonymized_name,
          profile.headline,
          profile.current_company,
          profile.current_title,
          profile.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    itemsList = itemsList.filter((row) => {
      const candidate = row.candidate;
      if (!candidate) return true;

      const isAnomaly = detectTimelineAnomaly(candidate);
      if (anomalyFilter === "only" && !isAnomaly) return false;
      if (anomalyFilter === "exclude" && isAnomaly) return false;

      if (availableOnly) {
        const notice = candidate.redrob_signals?.notice_period_days;
        if (notice == null || notice > 30) return false;
      }

      if (githubOnly) {
        const gh = candidate.redrob_signals?.github_activity_score;
        if (gh == null || gh === -1) return false;
      }

      return true;
    });

    itemsList.sort((a, b) => {
      if (sortBy === "experience") {
        const expA = a.candidate?.profile?.years_of_experience || 0;
        const expB = b.candidate?.profile?.years_of_experience || 0;
        return expB - expA;
      }
      if (sortBy === "notice") {
        const noticeA = a.candidate?.redrob_signals?.notice_period_days ?? 999;
        const noticeB = b.candidate?.redrob_signals?.notice_period_days ?? 999;
        return noticeA - noticeB;
      }
      if (sortBy === "completeness") {
        const compA = a.candidate?.redrob_signals?.profile_completeness_score || 0;
        const compB = b.candidate?.redrob_signals?.profile_completeness_score || 0;
        return compB - compA;
      }
      if (sortBy === "skills") {
        const skillsA = a.candidate?.skills?.length || 0;
        const skillsB = b.candidate?.skills?.length || 0;
        return skillsB - skillsA;
      }
      return (a.result.rank || 0) - (b.result.rank || 0);
    });

    return itemsList;
  }, [rankedResults, candidates, query, sortBy, anomalyFilter, availableOnly, githubOnly]);

  return (
    <div className="flex-1 flex flex-col border-b border-borderline bg-canvas min-h-0 overflow-hidden">
      <div className="px-4 py-4 sm:px-6 sm:pt-6 sm:pb-4 border-b border-borderline/80 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-mono">Shortlist Console</p>
            <h2 className="text-xl font-bold text-white mt-1">Ranked Shortlist</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400">
              {filtered.length} matching
            </span>
            {rankedResults.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isExportingPdf || filtered.length === 0}
                  onClick={handleExportPdf}
                  className="text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-200"
                  title="Export current filtered results as PDF"
                >
                  <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{isExportingPdf ? "PDF..." : "PDF"}</span>
                </button>
                
                <button
                  type="button"
                  disabled={filtered.length === 0}
                  onClick={handleExportWord}
                  className="text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all duration-200"
                  title="Export current filtered results as Word Document"
                >
                  <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Word</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {rankedResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-3 shadow-md shadow-black/10">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Ingested Pool</p>
              <p className="text-lg font-bold font-mono text-slate-200 mt-1">{stats.total}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-3 shadow-md shadow-black/10">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Mean Fit Score</p>
              <p className="text-lg font-bold font-mono text-emerald mt-1">{stats.avgScore}%</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-3 shadow-md shadow-black/10">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Notice &le; 30d</p>
              <p className="text-lg font-bold font-mono text-cobalt mt-1">{stats.availablePct}%</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-3 shadow-md shadow-black/10">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Anomalies Flagged</p>
              <p className={`text-lg font-bold font-mono mt-1 ${stats.anomalies > 0 ? "text-amber" : "text-slate-400"}`}>
                {stats.anomalies}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, headline, company, location..."
                className="w-full rounded-md border border-slate-800 bg-slate-950/50 px-3.5 py-2 pl-9 text-sm text-slate-200 placeholder-slate-600 focus:border-cobalt/60 focus:ring-1 focus:ring-cobalt/20 focus:outline-none transition-all duration-200 ease-in-out"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-300 focus:border-cobalt focus:outline-none transition-all duration-200"
            >
              <option value="rank">Sort by Rank</option>
              <option value="experience">Sort by Experience</option>
              <option value="notice">Sort by Notice Period</option>
              <option value="completeness">Sort by Profile Completeness</option>
              <option value="skills">Sort by Skills Count</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mr-1.5">Filters:</span>
            
            <button
              type="button"
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-2.5 py-1 rounded border transition-all duration-200 ${
                availableOnly 
                  ? "bg-cobalt/15 border-cobalt/40 text-cobalt font-medium shadow-sm shadow-cobalt/10" 
                  : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}
            >
              Notice &le; 30 Days
            </button>

            <button
              type="button"
              onClick={() => setGithubOnly(!githubOnly)}
              className={`px-2.5 py-1 rounded border transition-all duration-200 ${
                githubOnly 
                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-medium shadow-sm shadow-indigo-500/10" 
                  : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}
            >
              GitHub Attached
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1"></div>

            <button
              type="button"
              onClick={() => setAnomalyFilter(anomalyFilter === "all" ? "exclude" : "all")}
              className={`px-2.5 py-1 rounded border transition-all duration-200 ${
                anomalyFilter === "exclude"
                  ? "bg-emerald/15 border-emerald/40 text-emerald font-medium shadow-sm shadow-emerald/10"
                  : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}
            >
              Hide Anomalies
            </button>

            <button
              type="button"
              onClick={() => setAnomalyFilter(anomalyFilter === "only" ? "all" : "only")}
              className={`px-2.5 py-1 rounded border transition-all duration-200 ${
                anomalyFilter === "only"
                  ? "bg-amber/15 border-amber/40 text-amber font-medium shadow-sm shadow-amber/10 animate-pulse"
                  : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}
            >
              Anomalies Only
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-900">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-emerald/20 border-t-emerald animate-spin"></div>
            <p className="text-sm font-mono text-slate-400 tracking-wide">Executing ranking matrix algorithms...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center h-48">
            <svg className="h-8 w-8 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-slate-400 font-semibold">No active candidates found</p>
            <p className="text-xs text-slate-500 mt-1">Configure inputs or adjust filters to construct the candidate hierarchy.</p>
          </div>
        )}

        {!isLoading && filtered.map(({ result, candidate }) => (
          <CandidateCard
            key={result.candidate_id}
            result={result}
            candidate={candidate}
            onSelect={() => onSelectCandidate(result.candidate_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
