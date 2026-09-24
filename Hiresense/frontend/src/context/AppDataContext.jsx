import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { listCandidates } from "../services/candidateService";
import { listJobDescriptions } from "../services/jobService";
import { useAuth } from "./AuthContext";

/**
 * Holds the signed-in user's candidates and job descriptions.
 *
 * Auth-aware by design: it only fetches once a user is authenticated, and
 * clears state on logout. Without that, a logged-out user's data would linger
 * in memory and briefly render for whoever logs in next on the same browser.
 */
const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  const [candidates, setCandidates] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [candidatesData, jdData] = await Promise.all([
        listCandidates(),
        listJobDescriptions(),
      ]);
      setCandidates(candidatesData);
      setJobDescriptions(jdData);
    } catch {
      // Backend unreachable — leave whatever is already rendered in place.
      // ApiStatusPill surfaces the outage separately, so wiping the screen
      // here would remove information without adding any.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializing) return;

    if (isAuthenticated) {
      refresh();
    } else {
      // Logged out (or session expired): drop everything so the next user
      // on this browser never sees the previous user's candidates.
      setCandidates([]);
      setJobDescriptions([]);
    }
  }, [isAuthenticated, initializing, refresh]);

  const addCandidate = useCallback((candidate, atsReport) => {
    setCandidates((prev) => [
      { ...candidate, ats_report: atsReport },
      ...prev.filter((c) => c.id !== candidate.id),
    ]);
  }, []);

  const addJobDescription = useCallback((jd) => {
    setJobDescriptions((prev) => [jd, ...prev.filter((j) => j.id !== jd.id)]);
  }, []);

  const removeCandidate = useCallback((id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const removeJobDescription = useCallback((id) => {
    setJobDescriptions((prev) => prev.filter((j) => j.id !== id));
  }, []);

  /**
   * "Clear session data" in Settings: drops the locally cached view only.
   * The records stay in the database, so the next refresh restores them —
   * which is exactly what the copy on that button promises.
   */
  const clearAll = useCallback(() => {
    setCandidates([]);
    setJobDescriptions([]);
  }, []);

  const getCandidateById = useCallback(
    (id) => candidates.find((c) => c.id === id),
    [candidates]
  );

  const getJobDescriptionById = useCallback(
    (id) => jobDescriptions.find((j) => j.id === id),
    [jobDescriptions]
  );

  const value = {
    candidates,
    jobDescriptions,
    loading,
    refresh,
    addCandidate,
    addJobDescription,
    removeCandidate,
    removeJobDescription,
    clearAll,
    getCandidateById,
    getJobDescriptionById,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
