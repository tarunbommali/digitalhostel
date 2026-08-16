import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Lock, Mail, ShieldAlert, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { user, role, signIn, isInOrganizationContext, clearOrganizationContext } = useAuth();
  const [email, setEmail] = useState("superadmin@insidehome.com");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in as super_admin, redirect to super admin dashboard
    if (user && role === "super_admin") {
      navigate("/super-admin");
      return;
    }

    // If logged in under an organization context, clear context for super admin login
    if (isInOrganizationContext()) {
      clearOrganizationContext();
      toast.info("Switching to Super Admin context");
    }

    // If authenticated but not super_admin, redirect away
    if (user && role !== "super_admin") {
      toast.error("You are not authorized to access Super Admin portal");
      navigate("/");
    }
  }, [user, role, navigate, isInOrganizationContext, clearOrganizationContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    // Clear any existing organization context
    clearOrganizationContext();

    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setErrorMsg(result.error);
      toast.error(result.error);
    } else if (result.user) {
      toast.success("Super Admin Authenticated");
      navigate("/super-admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Header */}
      <header className="h-[72px] border-b border-[#2A2A3D] bg-[#12121C]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 h-full flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-[#A1A1B5] hover:text-white hover:bg-white/5 gap-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Landing Page
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Inside Home Platform</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-[#14141F] border border-[#2A2A3D] rounded-2xl p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#6366F1] mx-auto mb-4 flex items-center justify-center text-white shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Super Admin Login</h2>
            <p className="text-xs text-[#A1A1B5] mt-1">Platform Core Control & Organization Management</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                Super Admin Email
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6B7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-[#6B6B7D] focus:ring-2 focus:ring-[#6366F1] rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                Password
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B6B7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-[#6B6B7D] focus:ring-2 focus:ring-[#6366F1] rounded-xl text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium rounded-xl transition-colors shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...
                </>
              ) : (
                "Access Control Console"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
