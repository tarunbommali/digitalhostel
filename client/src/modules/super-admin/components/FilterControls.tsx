import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  tierFilter: string;
  setTierFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortBy: "newest" | "name" | "users" | "location";
  setSortBy: (value: "newest" | "name" | "users" | "location") => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  setSearchTerm,
  tierFilter,
  setTierFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  totalCount,
  filteredCount,
  onReset,
}) => {
  const hasActiveFilters = Boolean(searchTerm || tierFilter !== "ALL" || statusFilter !== "ALL");

  return (
    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, city, slug, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-md pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--tenant-primary)] transition-colors"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-md px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--color-surface)]">All Tiers</option>
              <option value="ENTERPRISE" className="bg-[var(--color-surface)]">Enterprise Tier</option>
              <option value="PRO" className="bg-[var(--color-surface)]">Pro Tier</option>
              <option value="BASIC" className="bg-[var(--color-surface)]">Basic Tier</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-md px-2.5 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--color-surface)]">All Statuses</option>
              <option value="ACTIVE" className="bg-[var(--color-surface)]">Active</option>
              <option value="TRIAL" className="bg-[var(--color-surface)]">Trial</option>
              <option value="EXPIRED" className="bg-[var(--color-surface)]">Expired</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-md px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[var(--color-surface)]">Newest First</option>
              <option value="name" className="bg-[var(--color-surface)]">Name (A-Z)</option>
              <option value="users" className="bg-[var(--color-surface)]">Most Users</option>
              <option value="location" className="bg-[var(--color-surface)]">Location</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Strip */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--color-border)]">
        <span>
          Showing <strong className="text-[var(--text-primary)]">{filteredCount}</strong> of{" "}
          <strong className="text-[var(--text-primary)]">{totalCount}</strong> registered organizations
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[var(--tenant-primary)] hover:underline cursor-pointer font-medium"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
