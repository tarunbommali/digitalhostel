import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { AddStaffForm } from "../components/AddStaffForm";
import { StaffListTable } from "../components/StaffListTable";

export function ModeratorsPage() {
  const [mods, setMods] = useState<any[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "Password#123",
    firstName: "",
    lastName: "",
    fullName: "",
    gender: "male",
    phone: "",
    moderatorType: "administration" as "administration" | "discipline_monitor" | "attendance_only" | "full",
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");

  const fetchMods = useCallback(() => {
    setLoading(true);
    api
      .get<any[]>("/moderators")
      .then(setMods)
      .catch((err) => toast.error(err.message || "Failed to load staff accounts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMods();
  }, [fetchMods]);

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || (!form.firstName && !form.fullName)) {
      toast.error("First name and email are required");
      return;
    }
    setBusy(true);

    const fullPhone = phoneDigits.trim()
      ? `${countryCode} ${phoneDigits.trim()}`
      : "";

    try {
      const res: any = await api.post("/moderators", {
        ...form,
        phone: fullPhone,
      });
      const createdName = `${form.firstName} ${form.lastName}`.trim() || form.fullName || "Staff Member";
      toast.success(`Staff account for ${createdName} created successfully`);
      setForm({
        email: "",
        password: "Password#123",
        firstName: "",
        lastName: "",
        fullName: "",
        gender: "male",
        phone: "",
        moderatorType: "administration",
      });
      setPhoneDigits("");
      fetchMods();
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff account");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await api.put(`/moderators/${id}/status`, { active: !active });
      toast.success(`Account ${!active ? "enabled" : "disabled"}`);
      fetchMods();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff & Moderators</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage staff accounts with specific privilege levels (Administration, Warden, Attendance)
        </p>
      </div>

      <AddStaffForm
        form={form} setForm={setForm}
        countryCode={countryCode} setCountryCode={setCountryCode}
        phoneDigits={phoneDigits} setPhoneDigits={setPhoneDigits}
        busy={busy} createStaff={createStaff}
      />

      <StaffListTable loading={loading} mods={mods} toggleActive={toggleActive} />
    </div>
  );
}

export default ModeratorsPage;
