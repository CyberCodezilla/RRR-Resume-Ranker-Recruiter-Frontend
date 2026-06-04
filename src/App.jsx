import { useMemo, useState, useEffect } from "react";
import InputPanel from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import CandidateModal from "./components/CandidateModal";
import ComplianceTray from "./components/ComplianceTray";
import { rankCandidates } from "./api/rankApi";
import { computeFallbackRanking, normalizeRankedResults } from "./utils/scoreUtils";

const App = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [rankedResults, setRankedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  // Dynamic layout resizing states
  const [leftWidth, setLeftWidth] = useState(40); // left panel width in percentage (default 40%)
  const [trayHeight, setTrayHeight] = useState(160); // compliance tray height in pixels (default 160px)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startResizingWidth = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = leftWidth;

    const doDrag = (mouseMoveEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const deltaPct = (deltaX / window.innerWidth) * 100;
      const newWidth = Math.max(20, Math.min(60, startWidth + deltaPct)); // restrict between 20% and 60%
      setLeftWidth(newWidth);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startResizingHeight = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startY = mouseDownEvent.clientY;
    const startHeight = trayHeight;

    const doDrag = (mouseMoveEvent) => {
      const deltaY = mouseMoveEvent.clientY - startY;
      const newHeight = Math.max(80, Math.min(400, startHeight - deltaY)); // restrict between 80px and 400px
      setTrayHeight(newHeight);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const candidateMap = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.candidate_id, candidate])),
    [candidates]
  );

  const selectedCandidate = selectedCandidateId
    ? candidateMap.get(selectedCandidateId)
    : null;
  const selectedResult = selectedCandidateId
    ? rankedResults.find((result) => result.candidate_id === selectedCandidateId)
    : null;

  const handleRun = async () => {
    if (!jobDescription.trim() || candidates.length === 0) {
      setError("Job description and candidates are required.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const results = await rankCandidates({
        jobDescription,
        candidates,
      });
      setRankedResults(normalizeRankedResults(results, candidates));
    } catch (err) {
      const fallback = computeFallbackRanking(candidates);
      setRankedResults(fallback);
      setError(
        err instanceof Error
          ? `API unavailable. Loaded local ranking. ${err.message}`
          : "API unavailable. Loaded local ranking."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-midnight">
      <div className={`h-full ${isDesktop ? "flex flex-row" : "flex flex-col overflow-y-auto"}`}>
        {/* Left Column (Inputs) */}
        <section
          className="h-full border-r border-borderline bg-canvas/80 shrink-0"
          style={isDesktop ? { width: `${leftWidth}%` } : { width: "100%" }}
        >
          <InputPanel
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            candidates={candidates}
            setCandidates={setCandidates}
            onRun={handleRun}
            isLoading={isLoading}
            error={error}
            setError={setError}
          />
        </section>

        {/* Vertical Resizer Handle */}
        {isDesktop && (
          <div
            onMouseDown={startResizingWidth}
            className="w-1 cursor-col-resize bg-slate-900 border-x border-slate-950 hover:bg-emerald/75 transition-colors h-full flex items-center justify-center relative z-20 group shrink-0"
            title="Drag horizontally to resize panels"
          >
            <div className="absolute h-10 w-1 rounded-full bg-slate-700 group-hover:bg-emerald transition-colors" />
          </div>
        )}

        {/* Right Column (Results + Compliance) */}
        <section
          className="h-full flex flex-col min-h-0 overflow-hidden"
          style={isDesktop ? { width: `${100 - leftWidth}%` } : { width: "100%" }}
        >
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ResultsPanel
              rankedResults={rankedResults}
              candidates={candidates}
              isLoading={isLoading}
              onSelectCandidate={setSelectedCandidateId}
            />
          </div>

          {/* Horizontal Resizer Handle */}
          {isDesktop && (
            <div
              onMouseDown={startResizingHeight}
              className="h-1 cursor-row-resize bg-slate-900 border-y border-slate-950 hover:bg-emerald/75 transition-colors w-full flex items-center justify-center relative z-20 group shrink-0"
              title="Drag vertically to resize Compliance details"
            >
              <div className="absolute w-12 h-1 rounded-full bg-slate-700 group-hover:bg-emerald transition-colors" />
            </div>
          )}

          {/* Compliance Details Container */}
          <div
            style={isDesktop ? { height: `${trayHeight}px` } : { height: "auto" }}
            className="shrink-0 overflow-y-auto custom-scrollbar bg-canvas"
          >
            <ComplianceTray rankedResults={rankedResults} />
          </div>
        </section>
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          result={selectedResult}
          onClose={() => setSelectedCandidateId(null)}
        />
      )}
    </div>
  );
};

export default App;
