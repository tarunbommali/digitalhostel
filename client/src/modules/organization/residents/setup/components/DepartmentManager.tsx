import React, { useState } from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { toast } from "sonner";
import { Building, Plus, Trash2, Loader2 } from "lucide-react";
import { DepartmentItem } from "../types";
import { lookupService } from "../services/lookup.service";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface DepartmentManagerProps {
  departments: DepartmentItem[];
  onUpdate: () => void;
}

export function DepartmentManager({
  departments = [],
  onUpdate,
}: DepartmentManagerProps) {
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await lookupService.addDepartment(name.trim());
      toast.success(`Department "${name}" added successfully`);
      setName("");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to add department");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      await lookupService.deleteDepartment(selectedDept._id);
      toast.success(`Department "${selectedDept.name}" removed`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <Building className="h-5 w-5 text-primary" />
        <span>Departments ({safeDepartments.length})</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="e.g. Computer Science & Engineering"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" disabled={busy || !name.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
        </Button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {safeDepartments.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No departments added yet.</p>
        )}
        {safeDepartments.map((d) => (
          <div
            key={d._id}
            className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-sm"
          >
            <span className="font-medium">{d.name}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => {
                setSelectedDept(d);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {selectedDept && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Department"
          itemName={selectedDept.name}
          onConfirm={handleDelete}
        />
      )}
    </Card>
  );
}
