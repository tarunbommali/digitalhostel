import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Server,
  Activity,
  Database,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { PageHeader } from "@/core/components/ui/PageHeader";
import { useOrganizations } from "../hooks/useOrganizations";
import { KPICards } from "../components/KPICards";
import { useOnline } from "@/core/hooks/useOnline";

export default function SuperAdminOverview() {
  const { organizations, loading, kpis } = useOrganizations();
  const isOnline = useOnline();

  useEffect(() => {
    document.title = "Platform Overview | Campus Stay Super Admin";
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <PageHeader
        eyebrow="Platform Administration"
        title="Platform Overview"
        description="Global system health, multi-tenant workspace distribution, and server infrastructure"
        breadcrumbs={[
          { label: "Super Admin", to: "/super-admin" },
          { label: "Overview" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/super-admin/organizations">
                <Building2 className="w-4 h-4 text-[var(--tenant-primary)]" />
                <span>View Organizations</span>
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm" className="gap-1.5 shadow-xs">
              <Link to="/super-admin/organizations/new">
                <Plus className="w-4 h-4" />
                <span>Create Organization</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* =========================================================================
          SYSTEM STATUS ROW
         ========================================================================= */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Platform Status</p>
              <p className="font-semibold text-[var(--color-success)]">Operational</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-[var(--tenant-primary)] border border-indigo-500/20 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Multi-Tenant DB</p>
              <p className="font-semibold text-[var(--color-success)]">Connected</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Target SLA</p>
              <p className="font-semibold text-[var(--text-primary)]">99.9% Target</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] flex items-center justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-[var(--color-success)] animate-pulse" : "bg-[var(--color-danger)]"
                  }`}
              />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Connection</p>
              <p className="font-semibold text-[var(--text-primary)]">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PLATFORM KPI CARDS
         ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-h3 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Workspace & Tenant Metrics
          </h2>
          <Link
            to="/super-admin/organizations"
            className="text-xs text-[var(--tenant-primary)] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Manage all organizations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <KPICards kpis={kpis} />
      </div>

      {/* =========================================================================
          RECENT ORGANIZATIONS PREVIEW & QUICK ACTIONS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Registered Organizations */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--tenant-primary)]" />
              <h3 className="font-h3 text-sm font-bold text-[var(--text-primary)]">
                Registered Hostel Workspaces
              </h3>
            </div>
            <Link
              to="/super-admin/organizations"
              className="text-xs text-[var(--tenant-primary)] hover:underline font-semibold"
            >
              View All ({organizations.length})
            </Link>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {organizations.slice(0, 5).map((org) => {
              const plan = (org.plan || "PRO").toUpperCase();
              return (
                <div
                  key={org._id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-[var(--color-surface-sunken)]/50 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{
                        backgroundColor: org.branding?.primaryColor || "var(--tenant-primary)",
                      }}
                    >
                      {org.name ? org.name.charAt(0) : "H"}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{org.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {org.location || "City"} • {org.adminEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={
                        plan === "ENTERPRISE" ? "enterprise" : plan === "PRO" ? "pro" : "basic"
                      }
                      size="sm"
                    >
                      {plan}
                    </Badge>
                    <Link
                      to={`/super-admin/organizations/${org._id}/edit`}
                      className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--tenant-primary)] font-medium hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/organization/${org.slug}/login`}
                      className="p-1 text-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
                      title="Access Portal"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Administration Shortcuts */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
            <Server className="w-4 h-4 text-indigo-500" />
            <h3 className="font-h3 text-sm font-bold text-[var(--text-primary)]">
              Quick Administration
            </h3>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/super-admin/organizations/new"
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] hover:border-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/5 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--tenant-primary)]">
                    Provision New Organization
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">Create workspace & credentials</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--tenant-primary)] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/super-admin/organizations"
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] hover:border-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/5 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--tenant-primary)]">
                    Subscription Tier Matrix
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">Switch plans & limit quotas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--tenant-primary)] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/"
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] hover:border-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/5 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--tenant-primary)]">
                    Public Hostel Directory
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">Preview tenant landing portal</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--tenant-primary)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
