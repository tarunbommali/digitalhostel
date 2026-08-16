import * as React from "react";
import { Search, Filter, Calendar, ArrowUpDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Button } from "@/core/components/ui/button";

interface StudentsFilterBarProps {
  q: string;
  setQ: (val: string) => void;
  selectedGender: string;
  setSelectedGender: (val: string) => void;
  selectedProgram: string;
  setSelectedProgram: (val: string) => void;
  selectedDept: string;
  setSelectedDept: (val: string) => void;
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  duesFilter: string;
  setDuesFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  departments: any[];
  academicYears: any[];
  setPage: (p: number) => void;
}

export function StudentsFilterBar({
  q,
  setQ,
  selectedGender,
  setSelectedGender,
  selectedProgram,
  setSelectedProgram,
  selectedDept,
  setSelectedDept,
  selectedYear,
  setSelectedYear,
  duesFilter,
  setDuesFilter,
  sortBy,
  setSortBy,
  sortOrder,
  toggleSortOrder,
  departments,
  academicYears,
  setPage,
}: StudentsFilterBarProps) {
  const hasActiveFilters =
    q.trim() !== "" ||
    selectedGender !== "all" ||
    selectedProgram !== "all" ||
    selectedDept !== "all" ||
    selectedYear !== "all" ||
    duesFilter !== "all";

  const clearAllFilters = () => {
    setQ("");
    setSelectedGender("all");
    setSelectedProgram("all");
    setSelectedDept("all");
    setSelectedYear("all");
    setDuesFilter("all");
    setPage(1);
  };

  const getDeptName = (id: string) => departments.find((d) => d._id === id)?.name || id;
  const getYearName = (id: string) => academicYears.find((y) => y._id === id)?.name || id;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-3">
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 text-xs">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
            placeholder="Search student, UID, reg no, email…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Gender Filter */}
        <div>
          <Select
            value={selectedGender}
            onValueChange={(val) => {
              setSelectedGender(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="all">All Hostels</SelectItem>
              <SelectItem value="boys">Boys Hostel</SelectItem>
              <SelectItem value="girls">Girls Hostel</SelectItem>
              <SelectItem value="co-ed">Co-Ed Hostel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Program Filter */}
        <div>
          <Select
            value={selectedProgram}
            onValueChange={(val) => {
              setSelectedProgram(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="UG">UG (Undergrad)</SelectItem>
              <SelectItem value="PG">PG (Postgrad)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div>
          <Select
            value={selectedDept}
            onValueChange={(val) => {
              setSelectedDept(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Academic Year Batch Filter */}
        <div>
          <Select
            value={selectedYear}
            onValueChange={(val) => {
              setSelectedYear(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="all">All Batches</SelectItem>
              {academicYears.map((y) => (
                <SelectItem key={y._id} value={y._id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dues Status Filter */}
        <div>
          <Select
            value={duesFilter}
            onValueChange={(val) => {
              setDuesFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Dues" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="all">All Dues</SelectItem>
              <SelectItem value="with_dues">With Dues</SelectItem>
              <SelectItem value="no_dues">No Dues (Paid)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-1.5">
          <Select
            value={sortBy}
            onValueChange={(val) => {
              setSortBy(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs flex-1 bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="fullName">Full Name</SelectItem>
              <SelectItem value="registrationNumber">Reg No</SelectItem>
              <SelectItem value="dues">Dues</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort: ${sortOrder.toUpperCase()}`}
            className="h-9 w-9 shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]/50 flex-wrap text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Active filters:</span>
          {q.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              Search: "{q}"
              <button onClick={() => setQ("")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedDept !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              Dept: {getDeptName(selectedDept)}
              <button onClick={() => setSelectedDept("all")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedYear !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              Batch: {getYearName(selectedYear)}
              <button onClick={() => setSelectedYear("all")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {duesFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              Dues: {duesFilter === "with_dues" ? "Pending Dues" : "No Dues"}
              <button onClick={() => setDuesFilter("all")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[11px] text-[var(--tenant-primary)] hover:underline ml-auto font-medium cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
