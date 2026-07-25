import React from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { PhoneInput } from "@/core/components/ui/phone-input";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { UserCog, Loader2 } from "lucide-react";

interface AddStaffFormProps {
  form: any;
  setForm: (form: any) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneDigits: string;
  setPhoneDigits: (digits: string) => void;
  busy: boolean;
  createStaff: (e: React.FormEvent) => void;
}

export function AddStaffForm({
  form,
  setForm,
  countryCode,
  setCountryCode,
  phoneDigits,
  setPhoneDigits,
  busy,
  createStaff,
}: AddStaffFormProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <UserCog className="h-5 w-5 text-primary" />
        <span>Add New Staff / Moderator Account</span>
      </div>

      <form onSubmit={createStaff} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>First Name *</Label>
          <Input
            required
            placeholder="e.g. Ramesh"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Last Name *</Label>
          <Input
            required
            placeholder="e.g. Kumar"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email Address *</Label>
          <Input
            required
            type="email"
            placeholder="warden@hostel.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
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
              <SelectItem value="male">👨 Male Warden (Boys Hostel Access)</SelectItem>
              <SelectItem value="female">👩 Female Warden (Girls Hostel Access)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Default Password (Visible) *</Label>
          <Input
            required
            type="text"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="font-mono bg-accent/10 border-primary/30"
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
        <div className="md:col-span-2 flex justify-end pt-2">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
            Staff Account
          </Button>
        </div>
      </form>
    </Card>
  );
}
