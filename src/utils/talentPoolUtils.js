export const getTalentPools = () => {
  try {
    const data = localStorage.getItem("rrr_recruiter_talent_pools");
    if (!data) {
      const defaultPools = [
        {
          id: "default-watchlist",
          name: "My Watchlist",
          createdAt: new Date().toISOString(),
          candidates: []
        }
      ];
      localStorage.setItem("rrr_recruiter_talent_pools", JSON.stringify(defaultPools));
      return defaultPools;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse talent pools from localStorage", e);
    return [];
  }
};

export const saveTalentPools = (pools) => {
  try {
    localStorage.setItem("rrr_recruiter_talent_pools", JSON.stringify(pools));
  } catch (e) {
    console.error("Failed to save talent pools to localStorage", e);
  }
};

export const createTalentPool = (name) => {
  const pools = getTalentPools();
  const trimmed = name.trim();
  if (!trimmed) return pools;
  
  if (pools.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return pools;
  }

  const newPool = {
    id: `pool-${Date.now()}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    candidates: []
  };
  pools.push(newPool);
  saveTalentPools(pools);
  return pools;
};

export const deleteTalentPool = (poolId) => {
  if (poolId === "default-watchlist") return getTalentPools(); // protect default watchlist
  const pools = getTalentPools().filter(p => p.id !== poolId);
  saveTalentPools(pools);
  return pools;
};

export const addCandidateToTalentPool = (poolId, candidate, result = null) => {
  const pools = getTalentPools();
  const pool = pools.find(p => p.id === poolId);
  if (pool) {
    const exists = pool.candidates.some(c => c.candidate_id === candidate.candidate_id);
    if (!exists) {
      pool.candidates.push({
        candidate_id: candidate.candidate_id,
        candidate,
        result: result || {
          candidate_id: candidate.candidate_id,
          rank: "-",
          score: 0
        }
      });
      saveTalentPools(pools);
    }
  }
  return pools;
};

export const removeCandidateFromTalentPool = (poolId, candidateId) => {
  const pools = getTalentPools();
  const pool = pools.find(p => p.id === poolId);
  if (pool) {
    pool.candidates = pool.candidates.filter(c => c.candidate_id !== candidateId);
    saveTalentPools(pools);
  }
  return pools;
};

export const getTalentPoolsWithCandidate = (candidateId) => {
  const pools = getTalentPools();
  return pools
    .filter(p => p.candidates.some(c => c.candidate_id === candidateId))
    .map(p => p.id);
};
