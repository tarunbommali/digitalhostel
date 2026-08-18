import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  itemName,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to remove <b>"{itemName}"</b>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={handleConfirm}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Permanently
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
