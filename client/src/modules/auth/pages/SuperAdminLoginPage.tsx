import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { FormField } from "@/core/components/ui/FormField";
import { PasswordInput } from "@/core/components/ui/PasswordInput";
import { SubmitButton } from "@/core/components/ui/SubmitButton";
import { Input } from "@/core/components/ui/input";
import { getErrorMessage } from "@/utils/errorUtils";
import { toast } from "sonner";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { user, role, signIn, isInOrganizationContext, clearOrganizationContext } = useAuth();
  const [email, setEmail] = useState("superadmin@insidehome.com");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in as super_admin, redirect to super admin dashboard
    if (user && role === "super_admin") {
      navigate("/super-admin", { replace: true });
      return;
    }

    // If authenticated as a tenant user, redirect to their tenant dashboard
    if (user && role !== "super_admin") {
      const slug = user.organizationSlug || localStorage.getItem("tenant_slug") || "developer";
      navigate(`/organization/${slug}/dashboard`, { replace: true });
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setBusy(true);
    setErrorMsg(null);

    try {
      // Clear any existing organization context
      clearOrganizationContext();

      const result = await signIn(email, password);
      if (result.error) {
        setErrorMsg(result.error);
        toast.error(result.error);
      } else if (result.user) {
        toast.success("Super Admin Authenticated");
        navigate("/super-admin");
      }
    } catch (err: any) {
      const msg = getErrorMessage(err, "Super Admin authentication failed");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout variant="platform">
      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
          Super Admin Login
        </h1>
        <p className="font-small text-xs text-[var(--text-muted)] mt-1">
          Platform core administration & organization control
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="Super Admin Email"
          required
          error={errorMsg && !password ? errorMsg : null}
        >
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@campusstay.com"
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
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </FormField>

        <div className="pt-2">
          <SubmitButton
            loading={busy}
            className="w-full font-semibold shadow-xs"
          >
            Access Control Console
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
}
