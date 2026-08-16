import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { FormField } from "@/core/components/ui/FormField";
import { PasswordInput } from "@/core/components/ui/PasswordInput";
import { SubmitButton } from "@/core/components/ui/SubmitButton";
import { Input } from "@/core/components/ui/input";
import { getErrorMessage } from "@/utils/errorUtils";
import { resolveAuthVariant } from "@/utils/authVariant";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const { slug } = useParams<{ slug: string }>();
  const { signIn, user, role, loading: authLoading, clearOrganizationContext } = useAuth();
  const { organization, loading: orgLoading, fetchTenantBySlug } = useTenant();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const variant = resolveAuthVariant(slug);

  useEffect(() => {
    if (slug) {
      fetchTenantBySlug(slug);
    }
  }, [slug, fetchTenantBySlug]);

  useEffect(() => {
    if (organization?.name) {
      document.title = `${organization.name} | Access Portal - Campus Stay`;
    } else if (slug) {
      document.title = `Hostel Portal (${slug}) | Campus Stay`;
    } else {
      document.title = "Sign In | Campus Stay";
    }
  }, [organization, slug]);

  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "super_admin") {
        navigate("/super-admin", { replace: true });
      } else {
        const targetSlug = slug || user.organizationSlug || organization?.slug || localStorage.getItem("tenant_slug") || "developer";
        navigate(`/organization/${targetSlug}/dashboard`, { replace: true });
      }
    }
  }, [user, role, authLoading, navigate, slug, organization]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter your email or phone number and password");
      return;
    }
    setBusy(true);
    setErrorMsg(null);

    try {
      if (user && organization && user.organizationId !== organization._id) {
        clearOrganizationContext();
      }

      const { error, user: loggedUser } = await signIn(identifier.trim(), password, slug);
      if (error) {
        setErrorMsg(error);
        toast.error(error);
      } else {
        toast.success(
          `Welcome back${organization?.name ? ` to ${organization.name}` : ""}`
        );
        if (loggedUser?.role === "super_admin" || identifier.toLowerCase().includes("superadmin")) {
          navigate("/super-admin");
        } else if (slug) {
          navigate(`/organization/${slug}/dashboard`);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      const msg = getErrorMessage(err, "Authentication failed");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--tenant-primary)] animate-spin" />
          <p className="font-small text-xs text-[var(--text-muted)]">
            Loading Organization Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (slug && !organization && !orgLoading) {
    return (
      <AuthLayout variant="platform">
        <div className="text-center space-y-4 py-4">
          <div className="h-12 w-12 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-border)] grid place-items-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-h2 text-lg font-bold text-[var(--text-primary)]">
              Hostel Organization Not Found
            </h2>
            <p className="font-small text-xs text-[var(--text-muted)] mt-1">
              The organization slug <code className="text-[var(--tenant-primary)] font-mono">"{slug}"</code> is not registered.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold rounded-md bg-[var(--tenant-primary)] text-white hover:bg-[var(--tenant-primary-hover)] transition-colors shadow-xs"
            >
              Browse Hostel Directory
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const orgName = organization?.name || "Campus Stay";

  return (
    <AuthLayout variant={variant}>
      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
          Sign in to {orgName}
        </h1>
        <p className="font-small text-xs text-[var(--text-muted)] mt-1">
          Enter your student or staff credentials to access portal
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          id="identifier"
          label="Email or Phone Number"
          required
          error={errorMsg && !password ? errorMsg : null}
        >
          <Input
            id="identifier"
            type="text"
            required
            placeholder="e.g. student@hostel.edu"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            className="bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--text-primary)] text-xs rounded-md h-9"
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          required
          error={errorMsg}
        >
          <PasswordInput
            id="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <Link
            to={slug ? `/forgot-password?slug=${slug}` : "/forgot-password"}
            className="text-xs text-[var(--tenant-primary)] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <SubmitButton
            loading={busy}
            className="w-full font-semibold shadow-xs"
          >
            Sign in to Workspace
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}

export default AuthPage;
