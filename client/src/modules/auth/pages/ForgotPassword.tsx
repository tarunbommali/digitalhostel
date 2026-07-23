import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      await api.post<any>("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent — check your inbox");
    } catch (err: any) {
      toast.error(err.message || "Failed to request password reset");
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
            Password recovery
          </h2>
          <p className="mt-3 text-sm opacity-80 max-w-sm">
            Enter your account email and we will send you a secure link to reset
            your password.
          </p>
        </div>
        <p className="text-xs opacity-50">
          © {new Date().getFullYear()} JNTUGV
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <h1 className="mt-4 text-2xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent
              ? "We have emailed you a reset link."
              : "Enter your email to receive a password reset link."}
          </p>

          {sent ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-md border bg-muted/40 p-6 text-center">
              <MailCheck className="h-8 w-8 text-accent" />
              <p className="text-sm font-medium">Check your inbox</p>
              <p className="text-xs text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>,
                you will receive a reset link shortly.
              </p>
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
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send
                reset link
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;
