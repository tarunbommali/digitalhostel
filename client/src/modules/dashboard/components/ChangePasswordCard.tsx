import React, { useState } from "react";
import { api } from "@/core/lib/api";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    <Card className="p-6 max-w-xl">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <KeyRound className="h-5 w-5 text-primary" />
        <span>Change Password</span>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Current Password</Label>
          <Input
            required
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              required
              minLength={8}
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <Input
              required
              minLength={8}
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={changingPass}>
          {changingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Update Password
        </Button>
      </form>
    </Card>
  );
}
