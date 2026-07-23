import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Card } from "@/core/components/ui/card";
import {
  Building2,
  Loader2,
  QrCode,
  UtensilsCrossed,
  Home,
  CreditCard,
  FileText,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const { signIn, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      navigate("/dashboard");
    }
  }, [user, role, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter your email or phone number and password");
      return;
    }
    setBusy(true);
    const { error } = await signIn(identifier.trim(), password);
    setBusy(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Welcome back");
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left Panel - University Branding */}
      <div className="hidden bg-sidebar p-10 text-sidebar-foreground md:flex md:flex-col md:justify-between overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Digital Hostel for JNTUGV</h1>
            <p className="text-xs opacity-75">Secure • Smart • Connected</p>
          </div>
        </div>

        <div className="my-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-sidebar-primary-foreground">
              JNTUGV Hostel Management & Digital Pass System
            </h2>
            <p className="mt-3 text-xs leading-relaxed opacity-85 text-sidebar-foreground/90">
              A comprehensive digital platform designed for JNTUGV University to streamline hostel administration, student services, and campus operations.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Core Modules</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 opacity-90">
                <QrCode className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Digital ID Card</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <UtensilsCrossed className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Mess Attendance</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <Home className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Hostel, Block & Room Allocation</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Billing & Payments</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Leave & Reports</span>
              </div>
              <div className="flex items-center gap-2 opacity-90">
                <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Student Profile</span>
              </div>
              <div className="flex items-center gap-2 opacity-90 col-span-2">
                <LayoutDashboard className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Administrative Staff</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs opacity-50">
          © {new Date().getFullYear()} JNTU Gurajada Vizianagaram. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex items-center justify-center p-6 bg-muted/20">
        <Card className="w-full max-w-md p-8 shadow-lg border-primary/10">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Account</h1>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input
                id="identifier"
                type="text"
                required
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full font-medium" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AuthPage;