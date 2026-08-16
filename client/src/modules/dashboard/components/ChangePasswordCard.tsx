import React, { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/core/lib/api";
import { Button } from "@/core/components/ui/button";

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changingPass, setChangingPass] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setChangingPass(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm max-w-xl">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 mb-4">
        <KeyRound className="h-4 w-4 text-[var(--tenant-primary)]" />
        <h3 className="font-h3 text-[var(--text-primary)]">Security & Password</h3>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
        <div>
          <label className="font-label text-[var(--text-primary)] block mb-1.5">
            Current Password <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="relative">
            <input
              required
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 pr-10 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label={showCurrent ? "Hide current password" : "Show current password"}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label text-[var(--text-primary)] block mb-1.5">
              New Password <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="relative">
              <input
                required
                minLength={8}
                type={showNew ? "text" : "password"}
                placeholder="Min 8 chars"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 pr-10 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label={showNew ? "Hide new password" : "Show new password"}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-label text-[var(--text-primary)] block mb-1.5">
              Confirm New Password <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="relative">
              <input
                required
                minLength={8}
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 pr-10 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-[var(--tenant-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary" loading={changingPass} className="w-full mt-2">
          Update Security Credentials
        </Button>
      </form>
    </div>
  );
}
