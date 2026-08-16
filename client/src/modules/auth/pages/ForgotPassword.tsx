import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/core/lib/api";
import { useTenant } from "@/core/context/tenant-context";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { FormField } from "@/core/components/ui/FormField";
import { SubmitButton } from "@/core/components/ui/SubmitButton";
import { Input } from "@/core/components/ui/input";
import { getErrorMessage } from "@/utils/errorUtils";
import { resolveAuthVariant } from "@/utils/authVariant";
import { MailCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/core/context/auth-context";
import { useNavigate } from "react-router-dom";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const { user, role, loading: authLoading } = useAuth();
  const { fetchTenantBySlug } = useTenant();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const variant = resolveAuthVariant(slug);

  useEffect(() => {
    if (!authLoading && user) {
      if (role === "super_admin") {
        navigate("/super-admin", { replace: true });
      } else {
        const targetSlug = slug || user.organizationSlug || localStorage.getItem("tenant_slug") || "developer";
        navigate(`/organization/${targetSlug}/dashboard`, { replace: true });
      }
    }
  }, [authLoading, user, role, navigate, slug]);

  useEffect(() => {
    if (slug) {
      fetchTenantBySlug(slug);
    }
  }, [slug, fetchTenantBySlug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your account email");
      return;
    }

    setBusy(true);
    setErrorMsg(null);

    try {
      await api.post<any>("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Password reset instructions sent — please check your inbox");
    } catch (err: any) {
      const msg = getErrorMessage(err, "Failed to request password reset");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const backLink = slug ? `/organization/${slug}/login` : "/auth";

  return (
    <AuthLayout variant={variant}>
      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
          Forgot Password
        </h1>
        <p className="font-small text-xs text-[var(--text-muted)] mt-1">
          {sent
            ? "Recovery instructions dispatched"
            : "Enter your registered email to receive a password reset link"}
        </p>
      </div>

      {sent ? (
        <div className="space-y-5 text-center py-2">
          <div className="h-12 w-12 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] grid place-items-center mx-auto">
            <MailCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-h3 text-sm font-semibold text-[var(--text-primary)]">
              Check Your Inbox
            </h3>
            <p className="font-small text-xs text-[var(--text-muted)] leading-relaxed">
              If an account exists for{" "}
              <strong className="text-[var(--text-primary)]">{email}</strong>, a secure
              single-use reset link has been sent. The link expires in 15 minutes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to={backLink}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold rounded-md bg-[var(--color-surface-muted)] text-[var(--text-primary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            id="email"
            label="Registered Account Email"
            required
            error={errorMsg}
          >
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="e.g. user@hostel.edu"
              className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
            />
          </FormField>

          <div className="pt-2 space-y-3">
            <SubmitButton
              loading={busy}
              className="w-full font-semibold shadow-xs"
            >
              Send Password Reset Link
            </SubmitButton>

            <div className="text-center">
              <Link
                to={backLink}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
