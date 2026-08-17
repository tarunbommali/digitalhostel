import { useDashboard } from "../context/dashboard-context";

/**
 * Custom hook to consume cached dashboard metrics and trigger manual refreshes.
 */
export const useDashboardStats = () => {
  return useDashboard();
};

export default useDashboardStats;
