import { useSuperAdmin } from "../context/super-admin-context";

/**
 * Super Admin Organizations Hook:
 * Connects directly to SuperAdminContext to avoid redundant API network requests.
 */
export const useOrganizations = () => {
  return useSuperAdmin();
};

export default useOrganizations;
