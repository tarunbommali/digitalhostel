import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api } from "@/core/lib/api";
import { useTenant } from "@/core/context/tenant-context";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { FormField } from "@/core/components/ui/FormField";
import { PasswordInput } from "@/core/components/ui/PasswordInput";
import { SubmitButton } from "@/core/components/ui/SubmitButton";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { getErrorMessage } from "@/utils/errorUtils";
import { resolveAuthVariant } from "@/utils/authVariant";
import { CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/core/context/auth-context";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const slug = searchParams.get("slug") || "";
  const { user, role, loading: authLoading } = useAuth();
  const { fetchTenantBySlug } = useTenant();

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
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

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token.trim()) {
      const msg = "Reset token is required. Please check the link from your email.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match. Please re-enter.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setBusy(true);
    setErrorMsg(null);

    try {
      await api.post<any>("/auth/reset-password", {
        token: token.trim(),
        password,
      });
      setDone(true);
      toast.success("Password updated successfully! All previous sessions invalidated.");
    } catch (err: any) {
      const msg = getErrorMessage(err, "Failed to reset password. The link may have expired.");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const loginLink = slug ? `/organization/${slug}/login` : "/auth";

  return (
    <AuthLayout variant={variant}>
      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
          Reset Password
        </h1>
        <p className="font-small text-xs text-[var(--text-muted)] mt-1">
          {done
            ? "Your account credentials have been secured"
            : "Choose a strong, unique password for your account"}
        </p>
      </div>

      {done ? (
        <div className="space-y-5 text-center py-2">
          <div className="h-12 w-12 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] grid place-items-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-h3 text-sm font-semibold text-[var(--text-primary)]">
              Password Changed Successfully
            </h3>
            <p className="font-small text-xs text-[var(--text-muted)] leading-relaxed">
              Your new password is now active. All active sessions have been securely terminated.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate(loginLink)}
              variant="primary"
              className="w-full font-semibold shadow-xs"
            >
              Sign In With New Password
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          {!tokenFromQuery && (
            <FormField
              id="token"
              label="Reset Verification Token"
              required
              helperText="Paste the 64-character verification token from your email"
            >
              <Input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                placeholder="Paste token here..."
                className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] font-mono text-xs rounded-md h-9"
              />
            </FormField>
          )}

          <FormField
            id="new-password"
            label="New Password"
            required
            helperText="Minimum 8 characters with letters, numbers & symbols"
          >
            <PasswordInput
              id="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </FormField>

          <FormField
            id="confirm-password"
            label="Confirm New Password"
            required
            error={errorMsg}
          >
            <PasswordInput
              id="confirm-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </FormField>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Token invalid or expired</span>
              </div>
              <Link
                to={slug ? `/forgot-password?slug=${slug}` : "/forgot-password"}
                className="font-semibold underline shrink-0"
              >
                Request new link
              </Link>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <SubmitButton
              loading={busy}
              className="w-full font-semibold shadow-xs"
            >
              Update Password & Invalidate Sessions
            </SubmitButton>

            <div className="text-center">
              <Link
                to={loginLink}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Return to Sign In
              </Link>
            </div>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPasswordPage;
