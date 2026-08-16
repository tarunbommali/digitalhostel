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
import { UserCog, Users, QrCode, Utensils, ShieldAlert, CheckCircle2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

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
  // Privilege toggles mapping to moderator types
  const privileges = [
    {
      id: "students_full",
      moderatorType: "administration",
      title: "Full Operation on Students",
      category: "Student Directory",
      description: "Complete access to create, edit, view directory, allocate rooms, and manage student status.",
      icon: Users,
    },
    {
      id: "students_add_only",
      moderatorType: "administration",
      title: "Adding & Bulk Import Only",
      category: "Student Directory",
      description: "Restricted access to create new student accounts & upload CSV spreadsheets only.",
      icon: Users,
    },
    {
      id: "security_outpass",
      moderatorType: "security_guard",
      title: "Security Option (Gate Scanner & Outpass)",
      category: "Gate Control",
      description: "Scan student Digital Pass at gate entries/exits & log real-time OUT/IN movement.",
      icon: QrCode,
    },
    {
      id: "mess_attendance",
      moderatorType: "attendance_only",
      title: "Mess Attendance Marking",
      category: "Dining Hall",
      description: "Scan student QR cards for breakfast, lunch, and dinner meal attendance marking.",
      icon: Utensils,
    },
    {
      id: "discipline_flags",
      moderatorType: "discipline_monitor",
      title: "Discipline Flags & Safety Reports",
      category: "Discipline Control",
      description: "Raise & resolve disciplinary flags, write incident reports, and review leave applications.",
      icon: ShieldAlert,
    },
  ];

  const handlePrivilegeToggle = (privilegeId: string, moderatorTypeVal: string) => {
    const currentPermissions: string[] = form.permissions || [form.moderatorType || "administration"];
    let updatedPermissions: string[];

    if (currentPermissions.includes(privilegeId)) {
      updatedPermissions = currentPermissions.filter((p) => p !== privilegeId);
    } else {
      updatedPermissions = [...currentPermissions, privilegeId];
    }

    setForm({
      ...form,
      permissions: updatedPermissions,
      moderatorType: moderatorTypeVal,
    });
  };

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

        {/* Feature & Action Privileges Checkbox Grid */}
        <div className="space-y-3 md:col-span-2 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Staff Feature & Operational Privileges *
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select specific operational actions this staff account is allowed to perform.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {privileges.map((item) => {
              const Icon = item.icon;
              const isChecked =
                (form.permissions && form.permissions.includes(item.id)) ||
                form.moderatorType === item.moderatorType;

              return (
                <div
                  key={item.id}
                  onClick={() => handlePrivilegeToggle(item.id, item.moderatorType)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handlePrivilegeToggle(item.id, item.moderatorType)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        {item.title}
                      </span>
                      {isChecked && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end pt-2">
          <SubmitButton type="submit" loading={busy}>
            Create Staff Account
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}
