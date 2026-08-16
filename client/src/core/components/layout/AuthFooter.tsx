import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";

export interface AuthFooterProps {
  variant: "platform" | "tenant";
}

export function AuthFooter({ variant }: AuthFooterProps) {
  const { slug } = useParams<{ slug: string }>();

  if (variant === "platform") {
    return (
      <div className="mt-6 text-center space-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hostel Directory
        </Link>
        <p className="text-[11px] text-[var(--text-muted)]">
          © {new Date().getFullYear()} Campus Stay Platform. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 text-center space-y-2">
      <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Hostels
        </Link>
        <span>•</span>
        <a
          href="mailto:support@campusstay.com"
          className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <HelpCircle className="w-3 h-3" /> Need help?
        </a>
      </div>
      <p className="text-[11px] text-[var(--text-muted)]">
        Powered by Campus Stay Multi-Tenancy Architecture
      </p>
    </div>
  );
}

export default AuthFooter;
