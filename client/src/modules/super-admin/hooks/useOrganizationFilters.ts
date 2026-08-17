import { useState, useMemo } from "react";
import { Organization } from "../types/organization.types";

export const useOrganizationFilters = (organizations: Organization[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "users" | "location">("newest");

  const filteredOrganizations = useMemo(() => {
    return organizations
      .filter((org) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchesName = org.name?.toLowerCase().includes(q);
          const matchesSlug = org.slug?.toLowerCase().includes(q);
          const matchesCity = org.location?.toLowerCase().includes(q);
          const matchesEmail = org.adminEmail?.toLowerCase().includes(q);
          if (!matchesName && !matchesSlug && !matchesCity && !matchesEmail) return false;
        }

        if (tierFilter !== "ALL" && (org.plan || "").toUpperCase() !== tierFilter.toUpperCase()) {
          return false;
        }

        if (
          statusFilter !== "ALL" &&
          (org.subscriptionStatus || "").toUpperCase() !== statusFilter.toUpperCase()
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }
        if (sortBy === "users") {
          return (b.totalUsers || 1) - (a.totalUsers || 1);
        }
        if (sortBy === "location") {
          return (a.location || "").localeCompare(b.location || "");
        }
        const dateA = new Date(a.createdDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.createdDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [organizations, searchTerm, tierFilter, statusFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setTierFilter("ALL");
    setStatusFilter("ALL");
  };

  return {
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredOrganizations,
    resetFilters,
  };
};

export default useOrganizationFilters;
