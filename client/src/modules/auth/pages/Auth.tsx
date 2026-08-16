import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Building2,
  Loader2,
  Eye,
  EyeOff,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Home,
} from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const { slug } = useParams<{ slug: string }>();
  const { signIn, user, role, loading: authLoading, clearOrganizationContext } = useAuth();
  const { organization, loading: orgLoading, fetchTenantBySlug } = useTenant();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchTenantBySlug(slug);
    }
  }, [slug, fetchTenantBySlug]);

  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "super_admin") {
        toast.info("Logged in as Super Admin");
        navigate("/super-admin");
      } else if (slug && organization?._id && user.organizationId === organization._id) {
        navigate(`/organization/${slug}/dashboard`);
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

    if (user && organization && user.organizationId !== organization._id) {
      clearOrganizationContext();
    }

    const { error, user: loggedUser } = await signIn(identifier.trim(), password, slug);
    setBusy(false);

    if (error) {
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
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-[#A1A1B5]">
            Loading Organization Details...
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = organization?.branding?.primaryColor || "#6366f1";
  const secondaryColor = organization?.branding?.secondaryColor || "#4f46e5";
  const logoUrl = organization?.branding?.logoUrl;
  const tagline = organization?.branding?.tagline || "Premium Hostel Management & Student Living";

  return (
    <div className="grid min-h-screen md:grid-cols-2 bg-[#0A0A12] text-white">
      {/* ============================================================ */}
      {/* LEFT PANEL - CUSTOM BRANDING (NO PLATFORM REFERENCES)        */}
      {/* ============================================================ */}
      <div className="hidden md:flex md:flex-col md:justify-between relative overflow-hidden bg-[#0D0D18] p-12 border-r border-[#23233433]">
        {/* Custom Ambient Glow based on primary color */}
        <div
          className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at top right, ${primaryColor}15, transparent 60%)`,
          }}
        />

        {/* Top Row - Organization Logo & Name */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={organization?.name || "Organization"}
                className="h-12 w-12 rounded-2xl object-cover border border-white/10 shadow-lg"
              />
            ) : (
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg font-bold text-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {organization?.name ? (
                  organization.name.charAt(0)
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
            )}
            <div>
              <h1
                className="font-extrabold text-lg leading-tight tracking-tight"
                style={{ color: primaryColor }}
              >
                {organization?.name || "Inside Home"}
              </h1>
              {organization && (
                <div className="flex items-center gap-2 text-xs text-[#A1A1B5] mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {organization.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/"
            className="text-xs text-[#A1A1B5] hover:text-white flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
        </div>

        {/* Middle Content - Organization Branding */}
        <div className="my-10 space-y-7 z-10">
          <div>
            <h2
              className="text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: primaryColor }}
            >
              {organization?.name || "Hostel Management"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#A1A1B5] max-w-lg">
              {tagline}
            </p>
          </div>

          {organization && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className="px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-semibold"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Access
              </span>
              <span
                className="px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-semibold"
                style={{
                  backgroundColor: `${secondaryColor}15`,
                  color: secondaryColor,
                  borderColor: `${secondaryColor}30`,
                }}
              >
                <Home className="h-3.5 w-3.5" />
                Student Portal
              </span>
            </div>
          )}
        </div>

        {/* Footer - Organization Copyright */}
        <p className="text-xs text-[#4A4A5D] z-10">
          © {new Date().getFullYear()} {organization?.name || "Inside Home"}. All rights reserved.
        </p>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL - SIGN IN FORM (CUSTOM BRANDING)                 */}
      {/* ============================================================ */}
      <div className="flex items-center justify-center p-6 bg-[#0A0A12]">
        <div className="w-full max-w-md rounded-2xl border border-[#2A2A3D] bg-[#14141F] p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
          {/* Custom Branding Top Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
            }}
          />

          {/* Organization Header */}
          {slug && organization && (
            <div className="mb-6 pb-4 border-b border-[#23233433] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={organization.name}
                    className="h-6 w-6 rounded-md object-cover"
                  />
                ) : (
                  <div
                    className="h-6 w-6 rounded-md flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {organization.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-white">
                  {organization.name}
                </span>
              </div>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                }}
              >
                {organization.location}
              </span>
            </div>
          )}

          {/* Sign In Header */}
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: primaryColor }}
            >
              Sign in to {organization?.name || "Account"}
            </h1>
            <p className="text-xs text-[#A1A1B5] mt-1.5">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label
                htmlFor="identifier"
                className="text-xs font-semibold text-[#A1A1B5] uppercase tracking-wide"
              >
                Email or Phone Number
              </Label>
              <Input
                id="identifier"
                type="text"
                required
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="bg-black/30 border-white/10 rounded-xl h-11 text-white placeholder:text-[#6B6B7D] focus-visible:ring-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-[#A1A1B5] uppercase tracking-wide"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="bg-black/30 border-white/10 rounded-xl h-11 pr-10 text-white placeholder:text-[#6B6B7D] focus-visible:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B7D] hover:text-white focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full font-semibold h-11 rounded-xl text-white shadow-lg transition-all hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 20px ${primaryColor}30`,
              }}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t border-[#23233433] text-center">
            <Link
              to="/"
              className="text-xs text-[#A1A1B5] hover:text-white inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;