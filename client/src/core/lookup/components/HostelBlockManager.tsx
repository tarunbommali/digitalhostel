import React, { useState } from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { toast } from "sonner";
import { Building2, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { HostelBlockItem, HostelGender } from "../types";
import { HOSTEL_GENDERS } from "../constants";
import { lookupService } from "../services/lookup.service";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface HostelBlockManagerProps {
  blocks: HostelBlockItem[];
  onUpdate: () => void;
}

export function HostelBlockManager({
  blocks,
  onUpdate,
}: HostelBlockManagerProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [gender, setGender] = useState<HostelGender>("boys");
  const [busy, setBusy] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<HostelBlockItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editGender, setEditGender] = useState<HostelGender>("boys");
  const [busyEdit, setBusyEdit] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<HostelBlockItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await lookupService.addBlock(name.trim(), code.trim(), gender);
      toast.success(`Hostel Block "${name}" added successfully`);
      setName("");
      setCode("");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to add hostel block");
    } finally {
      setBusy(false);
    }
  };

  const openEditModal = (b: HostelBlockItem) => {
    setEditingBlock(b);
    setEditName(b.name);
    setEditCode(b.code || "");
    setEditGender(b.gender || "boys");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock || !editName.trim()) return;
    setBusyEdit(true);
    try {
      await lookupService.updateBlock(
        editingBlock._id,
        editName.trim(),
        editCode.trim(),
        editGender
      );
      toast.success(`Hostel Block updated successfully`);
      setEditModalOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update hostel block");
    } finally {
      setBusyEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlock) return;
    try {
      await lookupService.deleteBlock(selectedBlock._id);
      toast.success(`Hostel Block "${selectedBlock.name}" removed`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete hostel block");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <span>Hostel Blocks ({blocks.length})</span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3 mb-4">
        <Input
          placeholder="Block Name (e.g. Ganga)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Block Code (e.g. BH-1)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="flex gap-2">
          <Select value={gender} onValueChange={(v) => setGender(v as HostelGender)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOSTEL_GENDERS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={busy || !name.trim()} className="shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </Button>
        </div>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {blocks.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No hostel blocks added yet.</p>
        )}
        {blocks.map((b) => (
          <div
            key={b._id}
            className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{b.name}</span>
              {b.code && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {b.code}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize text-xs">
                {b.gender} Hostel
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => openEditModal(b)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelectedBlock(b);
                  setDeleteModalOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Block Name & Details Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hostel Block Name & Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Hostel Block Name *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                placeholder="e.g. Boys Hostel - Block A"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Block Code</Label>
              <Input
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder="e.g. BH-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hostel Type / Gender *</Label>
              <Select
                value={editGender}
                onValueChange={(v) => setEditGender(v as HostelGender)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOSTEL_GENDERS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busyEdit || !editName.trim()}>
                {busyEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedBlock && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Hostel Block"
          itemName={selectedBlock.name}
          onConfirm={handleDelete}
        />
      )}
    </Card>
  );
}
