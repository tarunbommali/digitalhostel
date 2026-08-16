import React from "react";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { Meal } from "../types";

interface ManualUidFormProps {
  uid: string;
  setUid: (uid: string) => void;
  busy: boolean;
  meal: Meal;
  onSubmit: (e: React.FormEvent) => void;
}

export function ManualUidForm({
  uid,
  setUid,
  busy,
  meal,
  onSubmit,
}: ManualUidFormProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <QrCode className="h-5 w-5 text-primary" />
        <span>Manual UID Entry</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="uid">Hostel 6-Digit UID</Label>
          <Input
            id="uid"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="e.g. 100023"
            value={uid}
            onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
            className="font-mono text-2xl tracking-widest h-14"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 text-base font-medium"
          disabled={busy || uid.length !== 6}
        >
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Mark{" "}
          {meal.toUpperCase()}
        </Button>
      </form>
    </Card>
  );
}
