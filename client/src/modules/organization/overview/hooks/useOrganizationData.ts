import { useOrganization } from "../context/organization-context";
import { useTenant } from "@/core/context/tenant-context";

export const useOrganizationData = () => {
  const { organization, loading: loadingTenant } = useTenant();
  const { stats, loadingStats, refreshOrganization } = useOrganization();

  return {
    organization,
    stats,
    loading: loadingTenant || loadingStats,
    refreshOrganization,
  };
};

export default useOrganizationData;
