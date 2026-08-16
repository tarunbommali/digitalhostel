import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { toast } from "sonner";
import { RecordPaymentCard } from "../components/RecordPaymentCard";
import { AdminPaymentsTable } from "../components/AdminPaymentsTable";
import { StudentPaymentsView } from "../components/StudentPaymentsView";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

function AdminPayments() {
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [amount, setAmount] = useState(0);
  const [referenceId, setReferenceId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refreshData = useCallback(() => {
    setLoading(true);
    Promise.all([api.get<any>("/payments"), api.get<any>("/students?limit=1000")])
      .then(([pData, sData]) => {
        setPayments(Array.isArray(pData) ? pData : pData?.payments || []);
        setStudents(Array.isArray(sData) ? sData : sData?.students || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent || amount <= 0 || !referenceId.trim()) {
      toast.error("Please select a student, enter amount, and provide SBI Collect Reference ID");
      return;
    }
    setBusy(true);
    try {
      await api.post("/payments/record", {
        studentId: selectedStudent._id,
        amount,
        paymentMethod: "sbi_collect",
        referenceId: referenceId.trim(),
        remarks,
      });
      toast.success(`SBI Collect payment recorded for ${selectedStudent.fullName}`);
      setAmount(0);
      setReferenceId("");
      setRemarks("");
      setSelectedStudent(null);
      setStudentSearch("");
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setBusy(false);
    }
  }

  const searchMatches = students
    .filter((s) => {
      if (studentSearch.length < 2 || selectedStudent) return false;
      const term = studentSearch.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(term) ||
        s.hostelUid.includes(term) ||
        s.registrationNumber?.toLowerCase().includes(term)
      );
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Fee Collections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record SBI Collect payments, generate receipts, and track transaction histories
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <RecordPaymentCard
        studentSearch={studentSearch} setStudentSearch={setStudentSearch}
        selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent}
        amount={amount} setAmount={setAmount}
        referenceId={referenceId} setReferenceId={setReferenceId}
        remarks={remarks} setRemarks={setRemarks}
        busy={busy} searchMatches={searchMatches}
        handleRecordPayment={handleRecordPayment}
      />

      <AdminPaymentsTable loading={loading} payments={payments} />
    </div>
  );
}

export function PaymentsPage() {
  const { role } = useAuth();
  return role === "admin" ? <AdminPayments /> : <StudentPaymentsView />;
}

export default PaymentsPage;
