import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2, Building2, } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

import { useOrganizations } from "../hooks/useOrganizations";
import { useOrganizationFilters } from "../hooks/useOrganizationFilters";
import { FilterControls } from "../components/FilterControls";
import { OrganizationCard } from "../components/OrganizationCard";
import { ChangePlanModal } from "../components/ChangePlanModal";
import { Organization } from "../types/organization.types";

export default function SuperAdminDashboard() {
  const { organizations, loading, fetchOrganizations } = useOrganizations();
  const {
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
  } = useOrganizationFilters(organizations);

  const [planModalOrg, setPlanModalOrg] = useState<Organization | null>(null);

  useEffect(() => {
    document.title = "Platform Organizations | Campus Stay Super Admin";
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Platform Organizations
              </h1>
              {!loading && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full border border-[var(--tenant-primary)]/20">
                  {organizations.length} Total
                </span>
              )}
            </div>
            <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
              Global multi-tenant management, quota allocation, and tenant administrator credentials
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              asChild
              variant="primary"
              size="md"
              className="gap-2 shadow-xs font-semibold shrink-0"
            >
              <Link to="/super-admin/organizations/new">
                <Plus className="w-4 h-4" /> Create Organization Admin
              </Link>
            </Button>
          </div>
        </div>

        {/* Page-Specific Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Super Admin", to: "/super-admin", },
            { label: "Organizations" },
          ]}
        />
      </div>

      {/* Search, Filter & Sort Controls */}
      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tierFilter={tierFilter}
        setTierFilter={setTierFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={organizations.length}
        filteredCount={filteredOrganizations.length}
        onReset={resetFilters}
      />

      {/* Organizations Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-[var(--tenant-primary)] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Loading Registered Organizations...</p>
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[var(--color-surface)] border border-dashed border-[var(--color-border)]">
          <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="font-h3 text-[var(--text-primary)] mb-1">No organizations match your filters</h3>
          <p className="font-small text-xs text-[var(--text-muted)] max-w-md mx-auto mb-5">
            Try adjusting your search criteria or create a new organization admin below.
          </p>
          <Button onClick={resetFilters} variant="outline" size="sm">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org._id}
              org={org}
              onPlanChange={setPlanModalOrg}
            />
          ))}
        </div>
      )}

      {/* Plan Switcher Modal */}
      <ChangePlanModal
        organization={planModalOrg}
        onClose={() => setPlanModalOrg(null)}
        onSuccess={fetchOrganizations}
      />
    </div>
  );
}
