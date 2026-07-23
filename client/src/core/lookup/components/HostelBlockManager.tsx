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
import { toast } from "sonner";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
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
        ))}
      </div>

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
