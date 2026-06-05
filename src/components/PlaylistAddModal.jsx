import { useState } from "react";

const PlaylistAddModal = ({
  playlistCandidate,
  playlists,
  onClose,
  onCreatePlaylist,
  onAddCandidateToPlaylist,
  onRemoveCandidateFromPlaylist,
}) => {
  const [newListName, setNewListName] = useState("");
  const [creationError, setCreationError] = useState("");

  if (!playlistCandidate) return null;

  const { candidate, result } = playlistCandidate;
  const candidateId = candidate.candidate_id;
  const candidateName = candidate.profile?.anonymized_name || "Unknown Candidate";

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) return;

    // Check for duplicates
    if (playlists.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setCreationError("A playlist with this name already exists.");
      return;
    }

    setCreationError("");
    onCreatePlaylist(trimmed, playlistCandidate);
    setNewListName("");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-slate-950 border border-slate-800 p-6 shadow-2xl relative animate-fade-in font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-900 pb-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Classification Node</p>
            <h3 className="text-sm font-bold text-white mt-1">Manage Playlists</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Candidate Context Info */}
        <div className="bg-slate-900/30 border border-slate-900 p-3 mb-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Candidate</p>
          <p className="text-xs font-bold text-slate-200 mt-1">{candidateName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{candidate.profile?.headline || "No Headline"}</p>
        </div>

        {/* Playlists Checklist */}
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 mb-4 border-b border-slate-900 pb-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Assign to Lists</p>
          {playlists.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No playlists created yet.</p>
          ) : (
            playlists.map((playlist) => {
              const isMember = playlist.candidates.some((c) => c.candidate_id === candidateId);
              return (
                <label
                  key={playlist.id}
                  className="flex items-center justify-between p-2 hover:bg-slate-900/40 border border-transparent hover:border-slate-900 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isMember}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onAddCandidateToPlaylist(playlist.id, candidate, result);
                        } else {
                          onRemoveCandidateFromPlaylist(playlist.id, candidateId);
                        }
                      }}
                      className="accent-emerald h-3.5 w-3.5 bg-slate-950 border-slate-800 rounded-none focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-300 font-medium">{playlist.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded-none">
                    {playlist.candidates.length} profiles
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* Create New Playlist Form */}
        <form onSubmit={handleCreate} className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Create New Playlist</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => {
                setNewListName(e.target.value);
                setCreationError("");
              }}
              placeholder="e.g. Frontend Prospects"
              maxLength={40}
              className="flex-1 bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cobalt/60 transition-all rounded-none placeholder-slate-700"
            />
            <button
              type="submit"
              disabled={!newListName.trim()}
              className="bg-cobalt hover:bg-cobalt/90 disabled:opacity-40 disabled:hover:bg-cobalt text-white font-bold px-3 py-2 text-xs transition-colors rounded-none whitespace-nowrap"
            >
              Create & Add
            </button>
          </div>
          {creationError && (
            <p className="text-[10px] text-rose-500">{creationError}</p>
          )}
        </form>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end border-t border-slate-900 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold px-4 py-2 text-xs transition-colors rounded-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistAddModal;
