import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { AddStaffForm } from "../components/AddStaffForm";
import { StaffListTable } from "../components/StaffListTable";
import { EditStaffModal } from "../components/EditStaffModal";

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
    moderatorType: "administration" as
      | "administration"
      | "discipline_monitor"
      | "attendance_only"
      | "security_guard"
      | "full",
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneDigits, setPhoneDigits] = useState("");

  // Edit Staff Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editCountryCode, setEditCountryCode] = useState("+91");
  const [editPhoneDigits, setEditPhoneDigits] = useState("");
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "male",
    password: "",
    moderatorType: "administration" as any,
  });
  const [busyEdit, setBusyEdit] = useState(false);

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
      await api.post("/moderators", {
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

  const openEditModal = (staff: any) => {
    setEditingStaffId(staff._id);
    const rawPhone = staff.phone || "";
    const digitsOnly = rawPhone.replace(/\D/g, "");
    setEditCountryCode("+91");
    setEditPhoneDigits(digitsOnly.slice(-10));

    const fName = staff.firstName || (staff.fullName || "").split(" ")[0] || "";
    const lName = staff.lastName || (staff.fullName || "").split(" ").slice(1).join(" ") || "";

    setEditForm({
      firstName: fName,
      lastName: lName,
      fullName: staff.fullName || `${fName} ${lName}`,
      email: staff.email || "",
      phone: staff.phone || "",
      gender: staff.gender || "male",
      password: "",
      moderatorType: staff.moderatorType || (staff.role === "security_guard" ? "security_guard" : "administration"),
    });
    setEditModalOpen(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;
    setBusyEdit(true);

    const fullPhone = editPhoneDigits.trim()
      ? `${editCountryCode} ${editPhoneDigits.trim()}`
      : "";

    try {
      await api.put(`/moderators/${editingStaffId}`, {
        ...editForm,
        phone: fullPhone,
      });
      toast.success("Staff account updated successfully");
      setEditModalOpen(false);
      fetchMods();
    } catch (err: any) {
      toast.error(err.message || "Failed to update staff account");
    } finally {
      setBusyEdit(false);
    }
  };

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
          Create and manage staff accounts with specific privilege levels (Administration, Warden, Attendance, Security Guard)
        </p>
      </div>

      <AddStaffForm
        form={form} setForm={setForm}
        countryCode={countryCode} setCountryCode={setCountryCode}
        phoneDigits={phoneDigits} setPhoneDigits={setPhoneDigits}
        busy={busy} createStaff={createStaff}
      />

      <StaffListTable
        loading={loading}
        mods={mods}
        toggleActive={toggleActive}
        openEditModal={openEditModal}
      />

      <EditStaffModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        form={editForm}
        setForm={setEditForm}
        countryCode={editCountryCode}
        setCountryCode={setEditCountryCode}
        phoneDigits={editPhoneDigits}
        setPhoneDigits={setEditPhoneDigits}
        busy={busyEdit}
        handleUpdate={handleUpdateStaff}
      />
    </div>
  );
}

export default ModeratorsPage;
