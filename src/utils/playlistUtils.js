export const getPlaylists = () => {
  try {
    const data = localStorage.getItem("rrr_recruiter_playlists");
    if (!data) {
      const defaultPlaylists = [
        {
          id: "default-watchlist",
          name: "My Watchlist",
          createdAt: new Date().toISOString(),
          candidates: []
        }
      ];
      localStorage.setItem("rrr_recruiter_playlists", JSON.stringify(defaultPlaylists));
      return defaultPlaylists;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse playlists from localStorage", e);
    return [];
  }
};

export const savePlaylists = (playlists) => {
  try {
    localStorage.setItem("rrr_recruiter_playlists", JSON.stringify(playlists));
  } catch (e) {
    console.error("Failed to save playlists to localStorage", e);
  }
};

export const createPlaylist = (name) => {
  const playlists = getPlaylists();
  const trimmed = name.trim();
  if (!trimmed) return playlists;
  
  // Prevent duplicate names
  if (playlists.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return playlists;
  }

  const newPlaylist = {
    id: `playlist-${Date.now()}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    candidates: []
  };
  playlists.push(newPlaylist);
  savePlaylists(playlists);
  return playlists;
};

export const deletePlaylist = (playlistId) => {
  if (playlistId === "default-watchlist") return getPlaylists(); // protect default playlist
  const playlists = getPlaylists().filter(p => p.id !== playlistId);
  savePlaylists(playlists);
  return playlists;
};

export const addCandidateToPlaylist = (playlistId, candidate, result = null) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    const exists = playlist.candidates.some(c => c.candidate_id === candidate.candidate_id);
    if (!exists) {
      playlist.candidates.push({
        candidate_id: candidate.candidate_id,
        candidate,
        result: result || {
          candidate_id: candidate.candidate_id,
          rank: "-",
          score: 0
        }
      });
      savePlaylists(playlists);
    }
  }
  return playlists;
};

export const removeCandidateFromPlaylist = (playlistId, candidateId) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.candidates = playlist.candidates.filter(c => c.candidate_id !== candidateId);
    savePlaylists(playlists);
  }
  return playlists;
};

export const getPlaylistsWithCandidate = (candidateId) => {
  const playlists = getPlaylists();
  return playlists
    .filter(p => p.candidates.some(c => c.candidate_id === candidateId))
    .map(p => p.id);
};
