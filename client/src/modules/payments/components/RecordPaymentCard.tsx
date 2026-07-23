import React from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { CreditCard, Loader2 } from "lucide-react";

interface RecordPaymentCardProps {
  studentSearch: string;
  setStudentSearch: (val: string) => void;
  selectedStudent: any;
  setSelectedStudent: (s: any) => void;
  amount: number;
  setAmount: (val: number) => void;
  referenceId: string;
  setReferenceId: (val: string) => void;
  remarks: string;
  setRemarks: (val: string) => void;
  busy: boolean;
  searchMatches: any[];
  handleRecordPayment: (e: React.FormEvent) => void;
}

export function RecordPaymentCard({
  studentSearch,
  setStudentSearch,
  selectedStudent,
  setSelectedStudent,
  amount,
  setAmount,
  referenceId,
  setReferenceId,
  remarks,
  setRemarks,
  busy,
  searchMatches,
  handleRecordPayment,
}: RecordPaymentCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <span>Record SBI Collect Payment</span>
      </div>

      <form onSubmit={handleRecordPayment} className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Label>Student</Label>
          {selectedStudent ? (
            <div className="flex items-center justify-between p-2.5 rounded-md border bg-primary/5 border-primary/20">
              <div>
                <p className="font-semibold text-sm leading-tight">{selectedStudent.fullName}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  UID: {selectedStudent.hostelUid} · Reg: {selectedStudent.registrationNumber || "—"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentSearch("");
                }}
              >
                Change
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder="Search by name, UID, reg no…"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setSelectedStudent(null);
                }}
              />
              {searchMatches.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                  {searchMatches.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      className="block w-full px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        setSelectedStudent(s);
                        setStudentSearch(`${s.fullName} (${s.hostelUid})`);
                      }}
                    >
                      <div className="font-medium">{s.fullName}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        UID: {s.hostelUid} · Reg: {s.registrationNumber || "—"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <Label>Payment Method</Label>
          <Select value="sbi_collect" disabled>
            <SelectTrigger className="font-semibold">
              <SelectValue placeholder="SBI Collect" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sbi_collect">🏛️ SBI Collect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>SBI Collect Reference Payment ID *</Label>
          <Input
            required
            placeholder="e.g. DU12345678"
            className="font-mono uppercase"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />
        </div>

        <div>
          <Label>Amount Paid (₹) *</Label>
          <Input
            type="number"
            min={1}
            required
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="e.g. 3200"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Remarks / Fee Details (Optional)</Label>
          <Input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. August 2026 mess dues receipt"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button
            type="submit"
            disabled={!selectedStudent || amount <= 0 || !referenceId.trim() || busy}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Record
            SBI Collect Payment
          </Button>
        </div>
      </form>
    </Card>
  );
}
