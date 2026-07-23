import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      await api.post<any>("/auth/reset-password", { email, password });
      setDone(true);
      toast.success("Password updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-sidebar p-12 text-sidebar-foreground md:flex md:flex-col md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">JNTUGV</p>
            <p className="text-xs opacity-70">Hostel Management</p>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Set a new password
          </h2>
          <p className="mt-3 text-sm opacity-80 max-w-sm">
            Choose a strong password you have not used before. You will be asked
            to sign in again after the change.
          </p>
        </div>
        <p className="text-xs opacity-50">
          © {new Date().getFullYear()} JNTUGV
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {done
              ? "Your password has been updated."
              : "Enter your email, and confirm your new password."}
          </p>

          {done ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-md border bg-muted/40 p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-accent" />
              <p className="text-sm font-medium">Password updated</p>
              <p className="text-xs text-muted-foreground">
                Please sign in with your new password.
              </p>
              <Button className="mt-2" onClick={() => navigate("/auth")}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@jntugv.local"
                />
              </div>
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Update password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
export default ResetPasswordPage;
