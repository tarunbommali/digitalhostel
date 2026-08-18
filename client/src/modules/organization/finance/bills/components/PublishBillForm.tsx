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
import { Loader2 } from "lucide-react";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface PublishBillFormProps {
  genderTarget: "all" | "boys" | "girls";
  setGenderTarget: (v: "all" | "boys" | "girls") => void;
  month: number;
  setMonth: (v: number) => void;
  year: number;
  setYear: (v: number) => void;
  amount: number;
  setAmount: (v: number) => void;
  desc: string;
  setDesc: (v: string) => void;
  busy: boolean;
  handlePublish: (e: React.FormEvent) => void;
}

export function PublishBillForm({
  genderTarget,
  setGenderTarget,
  month,
  setMonth,
  year,
  setYear,
  amount,
  setAmount,
  desc,
  setDesc,
  busy,
  handlePublish,
}: PublishBillFormProps) {
  return (
    <Card className="p-6">
      <h2 className="font-semibold">Publish a monthly bill</h2>
      <p className="text-sm text-muted-foreground">
        Generates monthly bills per active student or separately by hostel gender
        (Boys / Girls).
      </p>
      <form
        className="mt-4 grid gap-4 md:grid-cols-6"
        onSubmit={handlePublish}
      >
        <div>
          <Label>Target Hostel</Label>
          <Select
            value={genderTarget}
            onValueChange={(v) => setGenderTarget(v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels / Students</SelectItem>
              <SelectItem value="boys">Boys Hostel Only</SelectItem>
              <SelectItem value="girls">Girls Hostel Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Month</Label>
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((mo, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  {mo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Description (optional)</Label>
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. August 2026 mess fee"
          />
        </div>
        <div className="md:col-span-6 flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Publish bills (
            {genderTarget === "all"
              ? "All"
              : genderTarget === "boys"
              ? "Boys"
              : "Girls"}
            )
          </Button>
        </div>
      </form>
    </Card>
  );
}
