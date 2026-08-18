import React, { useState, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { MONTHS } from "./PublishBillForm";
import { Pencil, Loader2 } from "lucide-react";

interface EditBillBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: any;
  onSaveBatch: (
    month: number,
    year: number,
    genderTarget: string,
    newAmount: number,
    newDescription: string,
  ) => Promise<void>;
}

export function EditBillBatchModal({
  open,
  onOpenChange,
  batch,
  onSaveBatch,
}: EditBillBatchModalProps) {
  const [amount, setAmount] = useState<number>(3200);
  const [description, setDescription] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (batch) {
      setAmount(batch.amount || 0);
      setDescription(batch.description || "");
    }
  }, [batch]);

  if (!batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSaveBatch(
        batch.month,
        batch.year,
        batch.genderTarget,
        amount,
        description,
      );
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" /> Modify Bill Batch Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="p-3 rounded-md bg-muted/40 text-xs space-y-1 font-medium">
            <p>
              <b>Period:</b> {MONTHS[batch.month - 1]} {batch.year}
            </p>
            <p className="capitalize">
              <b>Target Hostel:</b> {batch.genderTarget === "all" ? "All Hostels" : `${batch.genderTarget} Hostel`}
            </p>
            <p>
              <b>Bills Count:</b> {batch.totalBills} Students
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Updated Amount Per Student (₹) *</Label>
            <Input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Updated Description (Optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Revised August 2026 mess dues"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || amount <= 0}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save &
              Update Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
