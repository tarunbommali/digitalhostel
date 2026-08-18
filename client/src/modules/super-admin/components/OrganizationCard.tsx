import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Edit,
  MoreVertical,
  Settings,
  Eye,
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/core/components/ui/dropdown-menu";
import { Organization } from "../types/organization.types";
import { toast } from "sonner";

interface OrganizationCardProps {
  org: Organization;
  onPlanChange: (org: Organization) => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ org, onPlanChange }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const plan = String(org.plan || "pro").toLowerCase();
  const status = String(org.subscriptionStatus || "active").toLowerCase();

  const statusTextColor =
    status === "active"
      ? "text-[var(--color-success)]"
      : status === "trial"
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-danger)]";

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 flex flex-col justify-between hover:border-[var(--color-border-strong)] hover:shadow-lg transition-all group duration-200 relative">
      <div>
        {/* Card Header: Avatar, Name, Location, Badges & Actions */}
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

          {/* Action Menu & Tier Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {plan === "enterprise" ? (
              <Badge variant="enterprise" size="sm">
                ENTERPRISE
              </Badge>
            ) : plan === "pro" ? (
              <Badge variant="pro" size="sm">
                PRO
              </Badge>
            ) : (
              <Badge variant="basic" size="sm">
                BASIC
              </Badge>
            )}

            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[var(--color-surface-sunken)] transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link
                    to={`/super-admin/organizations/${org._id}/edit`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
                    <span>Edit Organization</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onPlanChange(org)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-500" />
                  <span>Change Plan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to={`/organization/${org.slug}/login`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>View Tenant Portal</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats & Details Grid */}
        <div className="space-y-2.5 text-xs bg-[var(--color-surface-sunken)] p-3.5 rounded-lg border border-[var(--color-border)] mb-4">
          {/* Route Slug */}
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
              {status}
            </span>
          </div>

          {/* Admin Account */}
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
              {org.totalUsers !== undefined && org.totalUsers !== null
                ? `${org.totalUsers} Registered`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Edit & Access Portal */}
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onPlanChange(org)}
            className="text-[11px] font-semibold text-[var(--tenant-primary)] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Change Plan</span>
          </button>
          <span className="text-[var(--color-border)]">|</span>
          <Link
            to={`/super-admin/organizations/${org._id}/edit`}
            className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--tenant-primary)] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </Link>
        </div>

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
};

export default OrganizationCard;
