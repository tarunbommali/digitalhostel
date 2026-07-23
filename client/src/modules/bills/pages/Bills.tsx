import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { toast } from "sonner";
import { PublishBillForm } from "../components/PublishBillForm";
import { AdminBillsTable } from "../components/AdminBillsTable";
import { StudentBillsView } from "../components/StudentBillsView";
import { EditBillBatchModal } from "../components/EditBillBatchModal";

function AdminBills() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [amount, setAmount] = useState(3200);
  const [genderTarget, setGenderTarget] = useState<"all" | "boys" | "girls">("all");
  const [desc, setDesc] = useState("");
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Edit Batch Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);

  const fetchBills = useCallback(() => {
    setLoading(true);
    api
      .get<any[]>("/bills")
      .then(setBills)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r: any = await api.post("/bills/publish", {
        month,
        year,
        amount,
        description: desc,
        genderTarget,
      });
      toast.success(
        r.message ||
          `Generated ${r.count} bills for ${
            genderTarget === "all" ? "all students" : `${genderTarget} hostel`
          }`,
      );
      setDesc("");
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish bills");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyBatch(m: number, y: number, target?: string) {
    try {
      const res: any = await api.put("/bills/verify-period", {
        month: m,
        year: y,
        genderTarget: target,
      });
      toast.success(`Verified & published ${res.verifiedCount} bills to students!`);
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify bill batch");
    }
  }

  async function handleSaveBatch(
    m: number,
    y: number,
    target: string,
    newAmount: number,
    newDescription: string,
  ) {
    try {
      const res: any = await api.put("/bills/update-batch", {
        month: m,
        year: y,
        genderTarget: target,
        newAmount,
        newDescription,
      });
      toast.success(`Updated ${res.updatedCount} bills in batch!`);
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || "Failed to update bill batch");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monthly Billing</h1>
        <p className="text-sm text-muted-foreground">
          Publish monthly mess fees and manage admin verification releases
        </p>
      </div>

      <PublishBillForm
        genderTarget={genderTarget} setGenderTarget={setGenderTarget}
        month={month} setMonth={setMonth}
        year={year} setYear={setYear}
        amount={amount} setAmount={setAmount}
        desc={desc} setDesc={setDesc}
        busy={busy} handlePublish={handlePublish}
      />

      <AdminBillsTable
        loading={loading} bills={bills}
        onVerifyBatch={handleVerifyBatch}
        onEditBatch={(batch) => {
          setEditingBatch(batch);
          setEditModalOpen(true);
        }}
      />

      <EditBillBatchModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        batch={editingBatch}
        onSaveBatch={handleSaveBatch}
      />
    </div>
  );
}

export function BillsPage() {
  const { role } = useAuth();
  return role === "admin" || role === "moderator" ? <AdminBills /> : <StudentBillsView />;
}

export default BillsPage;
