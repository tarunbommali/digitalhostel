import React from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { PhoneInput } from "@/core/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface EditStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  setForm: (form: any) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneDigits: string;
  setPhoneDigits: (digits: string) => void;
  busy: boolean;
  handleUpdate: (e: React.FormEvent) => void;
}

export function EditStaffModal({
  open,
  onOpenChange,
  form,
  setForm,
  countryCode,
  setCountryCode,
  phoneDigits,
  setPhoneDigits,
  busy,
  handleUpdate,
}: EditStaffModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Staff Account Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2 py-2">
          <div className="space-y-1.5">
            <Label>First Name *</Label>
            <Input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name *</Label>
            <Input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Email Address *</Label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Phone Number</Label>
            <PhoneInput
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phoneDigits={phoneDigits}
              setPhoneDigits={setPhoneDigits}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Gender & Attached Hostel Access *</Label>
            <Select
              value={form.gender}
              onValueChange={(val) => setForm({ ...form, gender: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">👨 Male Warden (Boys Access)</SelectItem>
                <SelectItem value="female">👩 Female Warden (Girls Access)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>New Password (Optional)</Label>
            <Input
              type="password"
              placeholder="Leave blank to keep unchanged"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Privilege Level / Specific Access *</Label>
            <Select
              value={form.moderatorType}
              onValueChange={(val: any) =>
                setForm({ ...form, moderatorType: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administration">
                  Administration (Add Students & Draft Bills)
                </SelectItem>
                <SelectItem value="discipline_monitor">
                  Discipline Warden / Monitor (Flag Students & Discipline Reports)
                </SelectItem>
                <SelectItem value="attendance_only">
                  Mess Attendance Staff (Mess Attendance Marking Only)
                </SelectItem>
                <SelectItem value="security_guard">
                  🛡️ Security Guard (Scan Digital ID & Manage Outing Logbook Only)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="md:col-span-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Staff Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
