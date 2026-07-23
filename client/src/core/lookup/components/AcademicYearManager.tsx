import React, { useState } from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { AcademicYearItem } from "../types";
import { lookupService } from "../services/lookup.service";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface AcademicYearManagerProps {
  academicYears: AcademicYearItem[];
  onUpdate: () => void;
}

export function AcademicYearManager({
  academicYears,
  onUpdate,
}: AcademicYearManagerProps) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYearItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await lookupService.addAcademicYear(name.trim());
      toast.success(`Academic Year "${name}" added successfully`);
      setName("");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to add academic year");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedYear) return;
    try {
      await lookupService.deleteAcademicYear(selectedYear._id);
      toast.success(`Academic Year "${selectedYear.name}" removed`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete academic year");
    }
  };

  const handleToggleCompletion = async (year: AcademicYearItem) => {
    setTogglingId(year._id);
    try {
      const res = await lookupService.toggleAcademicYearCompletion(year._id);
      if (res.result && res.result.updatedStudents > 0) {
        toast.success(
          `Academic Year "${year.name}" marked ${!year.isCompleted ? "Completed" : "Active"}. ${res.result.updatedStudents} students graduated & ${res.result.releasedBeds} beds released.`
        );
      } else {
        toast.success(`Academic Year "${year.name}" status updated`);
      }
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update academic year status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <span>Academic Batches ({academicYears.length})</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="e.g. 2024-2028"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" disabled={busy || !name.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
        </Button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {academicYears.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No academic years added yet.</p>
        )}
        {academicYears.map((y) => (
          <div
            key={y._id}
            className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{y.name}</span>
              <Badge variant={y.isCompleted ? "secondary" : "default"} className="text-[10px]">
                {y.isCompleted ? "Completed" : "Active Batch"}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1"
                disabled={togglingId === y._id}
                onClick={() => handleToggleCompletion(y)}
              >
                {togglingId === y._id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {y.isCompleted ? "Reactivate" : "Mark Complete"}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelectedYear(y);
                  setDeleteModalOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedYear && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Academic Year"
          itemName={selectedYear.name}
          onConfirm={handleDelete}
        />
      )}
    </Card>
  );
}
