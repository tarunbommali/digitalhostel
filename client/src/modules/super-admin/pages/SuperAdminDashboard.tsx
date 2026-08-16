import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Badge } from "@/core/components/ui/badge";
import {
  Building2,
  Plus,
  Shield,
  MapPin,
  Sparkles,
  Loader2,
  Search,
  Users,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAppDispatch, useAppSelector } from "@/utils/store";
import { closeMenu } from "@/utils/appSlice";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.app.isMenuOpen);
  const { signOut } = useAuth();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "users" | "location">("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    location: "Bangalore",
    plan: "Pro",
    subscriptionStatus: "Active",
    adminName: "",
    adminEmail: "",
    adminPassword: "Bommali@2001",
    tagline: "Modern Premium Student Hostel & Residency",
    logoUrl: "",
    primaryColor: "#4F46E5",
  });

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/super-admin/organizations");
      setOrganizations(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load registered organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Compute Platform KPI Metrics
  const kpis = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter((o) => o.subscriptionStatus === "Active").length;
    const totalUsers = organizations.reduce((acc, o) => acc + (o.totalUsers || 1), 0);
    const enterpriseCount = organizations.filter((o) => o.plan === "Enterprise").length;
    const proCount = organizations.filter((o) => o.plan === "Pro").length;
    const basicCount = organizations.filter((o) => o.plan === "Basic").length;

    return {
      total,
      active,
      totalUsers,
      enterpriseCount,
      proCount,
      basicCount,
    };
  }, [organizations]);

  // Filtered & Sorted Organizations
  const filteredOrganizations = useMemo(() => {
    return organizations
      .filter((org) => {
        // Search term matching
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchesName = org.name?.toLowerCase().includes(q);
          const matchesSlug = org.slug?.toLowerCase().includes(q);
          const matchesCity = org.location?.toLowerCase().includes(q);
          const matchesEmail = org.adminEmail?.toLowerCase().includes(q);
          if (!matchesName && !matchesSlug && !matchesCity && !matchesEmail) return false;
        }

        // Tier filter
        if (tierFilter !== "ALL" && org.plan?.toUpperCase() !== tierFilter.toUpperCase()) {
          return false;
        }

        // Status filter
        if (statusFilter !== "ALL" && org.subscriptionStatus?.toUpperCase() !== statusFilter.toUpperCase()) {
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
        // Default newest
        const dateA = new Date(a.createdDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.createdDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [organizations, searchTerm, tierFilter, statusFilter, sortBy]);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.adminEmail || !formData.adminPassword) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug.toLowerCase().trim(),
        location: formData.location,
        plan: formData.plan,
        subscriptionStatus: formData.subscriptionStatus,
        adminName: formData.adminName || `${formData.name} Administrator`,
        adminEmail: formData.adminEmail.toLowerCase().trim(),
        adminPassword: formData.adminPassword,
        tagline: formData.tagline,
        branding: {
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
        },
      };

      const res: any = await api.post("/super-admin/organizations", payload);
      toast.success(res.message || "Organization & Admin Account Created Successfully!");
      setShowModal(false);
      setFormData({
        name: "",
        slug: "",
        location: "Bangalore",
        plan: "Pro",
        subscriptionStatus: "Active",
        adminName: "",
        adminEmail: "",
        adminPassword: "Bommali@2001",
        tagline: "Modern Premium Student Hostel & Residency",
        logoUrl: "",
        primaryColor: "#4F46E5",
      });
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      {/* Super Admin Persistent Sidebar */}
      <Sidebar />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(closeMenu())}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Universal Sticky Topbar */}
        <Header />

        {/* Responsive Content Container */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-8">
          {/* =========================================================================
              1. PAGE HEADER & PRIMARY ACTION
             ========================================================================= */}
          <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  Platform Organizations
                </h1>
                <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
                  Global multi-tenant management, quota allocation, and tenant administrator credentials
                </p>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                variant="primary"
                size="md"
                className="gap-2 shadow-xs font-semibold shrink-0"
              >
                <Plus className="w-4 h-4" /> Create Organization Admin
              </Button>
            </div>
            <Breadcrumbs />
          </div>

          {/* =========================================================================
              2. PLATFORM KPI METRIC STRIP (Per §7 Standards)
             ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Hostels */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                  Total Hostels
                </p>
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {kpis.total}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Registered Workspaces</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] grid place-items-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2: Active Subscriptions */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                  Active Tenants
                </p>
                <h3 className="font-display text-2xl font-bold text-[var(--color-success)] mt-1">
                  {kpis.active}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {kpis.total > 0 ? `${Math.round((kpis.active / kpis.total) * 100)}% active rate` : "No tenants"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] grid place-items-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 3: Total Platform Users */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                  Platform Users
                </p>
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {kpis.totalUsers}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Admins & Residents</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 grid place-items-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 4: Tier Distribution */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-caption text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">
                  Tier Breakdown
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                    {kpis.enterpriseCount} Ent
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                    {kpis.proCount} Pro
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--text-muted)] border border-[var(--color-border)]">
                    {kpis.basicCount} Basic
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Tier Distribution</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. SEARCH, FILTER & SORT CONTROLS (Per §9 Pattern)
             ========================================================================= */}
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
                Showing <strong className="text-[var(--text-primary)]">{filteredOrganizations.length}</strong> of{" "}
                <strong className="text-[var(--text-primary)]">{organizations.length}</strong> registered organizations
              </span>
              {(searchTerm || tierFilter !== "ALL" || statusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setTierFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="text-[var(--tenant-primary)] hover:underline cursor-pointer font-medium"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              4. ORGANIZATIONS DATA GRID WITH POLISHED AFFORDANCES
             ========================================================================= */}
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
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setTierFilter("ALL");
                  setStatusFilter("ALL");
                }}
                variant="outline"
                size="sm"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrganizations.map((org) => {
                const plan = (org.plan || "PRO").toUpperCase();
                const status = (org.subscriptionStatus || "Active").toLowerCase();

                // Status text coloring
                const statusTextColor =
                  status === "active"
                    ? "text-[var(--color-success)]"
                    : status === "trial"
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-danger)]";

                return (
                  <div
                    key={org._id}
                    className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 flex flex-col justify-between hover:border-[var(--color-border-strong)] hover:shadow-md transition-all group duration-200 relative"
                  >
                    <div>
                      {/* Card Header: Avatar, Name, Location & Tier Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {org.branding?.logoUrl ? (
                            <img
                              src={org.branding.logoUrl}
                              alt={org.name}
                              className="w-11 h-11 rounded-lg object-contain border border-[var(--color-border)] shrink-0 bg-white p-0.5"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0"
                              style={{ backgroundColor: org.branding?.primaryColor || "var(--tenant-primary)" }}
                            >
                              {org.name ? org.name.charAt(0) : "H"}
                            </div>
                          )}
                          <div className="truncate">
                            <h3 className="font-body-medium text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--tenant-primary)] transition-colors">
                              {org.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[var(--tenant-primary)] shrink-0" />
                              <span className="truncate">{org.location || "City Location"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Hierarchical Tier Badge (Enterprise = solid prominent, Pro = accent, Basic = neutral) */}
                        {plan === "ENTERPRISE" ? (
                          <Badge variant="enterprise" size="sm">
                            ENTERPRISE
                          </Badge>
                        ) : plan === "PRO" ? (
                          <Badge variant="pro" size="sm">
                            PRO
                          </Badge>
                        ) : (
                          <Badge variant="basic" size="sm">
                            BASIC
                          </Badge>
                        )}
                      </div>

                      {/* Stats & Details Grid */}
                      <div className="space-y-2.5 text-xs bg-[var(--color-surface-sunken)] p-3.5 rounded-lg border border-[var(--color-border)] mb-4">
                        {/* Route Slug with Direct Click & Copy */}
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-muted)]">Route Slug:</span>
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/organization/${org.slug}/login`}
                              className="font-mono text-[var(--tenant-primary)] hover:underline flex items-center gap-1 text-[11px] font-medium"
                              title="Open hostel portal"
                            >
                              organization/{org.slug}
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(`organization/${org.slug}`, `slug-${org._id}`, "Route slug");
                              }}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded cursor-pointer transition-colors"
                              title="Copy route slug"
                            >
                              {copiedId === `slug-${org._id}` ? (
                                <Check className="w-3 h-3 text-[var(--color-success)]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Subscription Status */}
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-muted)]">Subscription:</span>
                          <span className={`font-semibold capitalize flex items-center gap-1.5 ${statusTextColor}`}>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                status === "active"
                                  ? "bg-[var(--color-success)]"
                                  : status === "trial"
                                  ? "bg-[var(--color-warning)]"
                                  : "bg-[var(--color-danger)]"
                              }`}
                            />
                            {org.subscriptionStatus || "Active"}
                          </span>
                        </div>

                        {/* Admin Account with Copy Button & Tooltip */}
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-muted)]">Admin Account:</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono text-[var(--text-primary)] truncate max-w-[140px] text-[11px]"
                              title={org.adminEmail}
                            >
                              {org.adminEmail}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(org.adminEmail, `email-${org._id}`, "Admin email");
                              }}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded cursor-pointer transition-colors"
                              title={`Copy ${org.adminEmail}`}
                            >
                              {copiedId === `email-${org._id}` ? (
                                <Check className="w-3 h-3 text-[var(--color-success)]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Total Users */}
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-muted)]">Total Users:</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {org.totalUsers || 1} Registered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Provisioning State (Neutral Info Badge) & View Portal Affordance */}
                    <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm">
                          Provisioned
                        </Badge>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {new Date(org.createdDate || org.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Primary Navigation Affordance */}
                      <Link
                        to={`/organization/${org.slug}/login`}
                        className="flex items-center gap-1 text-xs font-semibold text-[var(--tenant-primary)] hover:translate-x-0.5 transition-transform"
                      >
                        <span>Access Portal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: CREATE ORGANIZATION & ADMIN
         ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 max-w-2xl w-full shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--tenant-primary)] flex items-center justify-center text-white font-bold shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-h3 text-lg text-[var(--text-primary)]">Create Organization & Admin</h3>
                  <p className="font-small text-xs text-[var(--text-muted)]">
                    Provision multi-tenant credentials for new hostel workspace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-label text-[var(--text-primary)]">
                    Hostel / Organization Name <span className="text-[var(--color-danger)]">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Royal Crown Hostel"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                      setFormData({ ...formData, name, slug });
                    }}
                    className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-label text-[var(--text-primary)]">
                    URL Slug (Route Path) <span className="text-[var(--color-danger)]">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. royal-crown"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--tenant-primary)] font-mono text-xs rounded-md h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-label text-[var(--text-primary)]">
                    Location (City) <span className="text-[var(--color-danger)]">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-label text-[var(--text-primary)]">Subscription Plan</Label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                    className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
                  >
                    <option value="Basic">Basic Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-label text-[var(--text-primary)]">Subscription Status</Label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, subscriptionStatus: e.target.value as any })
                    }
                    className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--text-primary)] text-xs px-3 focus:outline-none focus:border-[var(--tenant-primary)]"
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)]">
                <h4 className="font-h3 text-xs text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
                  Tenant Administrator Initial Account
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-label text-[var(--text-primary)]">
                      Admin Email (Login ID) <span className="text-[var(--color-danger)]">*</span>
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="admin@hostel.edu"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-label text-[var(--text-primary)]">
                      Admin Temporary Password <span className="text-[var(--color-danger)]">*</span>
                    </Label>
                    <Input
                      type="password"
                      required
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)]">
                <h4 className="font-h3 text-xs text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tenant Branding Customization (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-label text-[var(--text-primary)]">Hostel Tagline</Label>
                    <Input
                      placeholder="e.g. Modern Student Living"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-label text-[var(--text-primary)]">Primary Brand Color (Hex)</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] p-0.5 cursor-pointer"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] font-mono text-xs rounded-md h-9 flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  className="gap-1.5"
                >
                  Create & Provision Organization
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
