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
import { Building2, Plus, Trash2, Edit, Lock } from "lucide-react";
import { usePlanFeature } from "@/core/hooks/usePlanFeature";
import { HostelBlockItem, HostelGender } from "../types";
import { HOSTEL_GENDERS } from "../constants";
import { lookupService } from "../services/lookup.service";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

import { getErrorMessage } from "@/utils/errorUtils";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { GenderBadge } from "@/components/ui/GenderBadge";

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

  const { getLimit, currentPlan, isSuperAdmin } = usePlanFeature();
  const maxBlocks = isSuperAdmin ? Infinity : getLimit("maxBlocks");
  const isBlockLimitReached = blocks.length >= maxBlocks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isBlockLimitReached) {
      toast.error(`Block limit reached for ${currentPlan} plan (${maxBlocks} max). Upgrade to Pro for unlimited blocks.`);
      return;
    }
    setBusy(true);
    try {
      await lookupService.addBlock(name.trim(), code.trim(), gender);
      toast.success(`Hostel Block "${name}" added successfully`);
      setName("");
      setCode("");
      onUpdate();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to add hostel block"));
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
      toast.error(getErrorMessage(err, "Failed to update hostel block"));
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
      toast.error(getErrorMessage(err, "Failed to delete hostel block"));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div className="flex items-center gap-2 font-semibold text-base">
          <Building2 className="h-5 w-5 text-primary" />
          <span>Hostel Blocks ({blocks.length}{maxBlocks !== Infinity ? `/${maxBlocks}` : ""})</span>
        </div>
        {isBlockLimitReached && (
          <Badge variant="pro" size="sm">
            <Lock className="w-3 h-3 mr-1" />
            1 Block Limit (Basic)
          </Badge>
        )}
      </div>

      {isBlockLimitReached && (
        <div className="mb-4 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center justify-between">
          <span>Basic plan allows 1 active block. Upgrade to Pro for unlimited blocks.</span>
        </div>
      )}

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
          <SubmitButton
            type="submit"
            disabled={!name.trim()}
            loading={busy}
            icon={Plus}
            className="shrink-0"
          >
            Add
          </SubmitButton>
        </div>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {blocks.length === 0 && (
          <EmptyState message="No hostel blocks added yet." icon={Building2} />
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
              <GenderBadge gender={b.gender} />
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
              <SubmitButton type="submit" loading={busyEdit} disabled={!editName.trim()}>
                Save Changes
              </SubmitButton>
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
