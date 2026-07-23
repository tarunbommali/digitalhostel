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
import { UserCheck, Loader2 } from "lucide-react";

interface AllocateBedCardProps {
  allocRoomId: string;
  setAllocRoomId: (id: string) => void;
  allocStudent: string;
  setAllocStudent: (val: string) => void;
  pickedStudentId: string | null;
  setPickedStudentId: (id: string | null) => void;
  bedNumber: string;
  setBedNumber: (num: string) => void;
  busyAlloc: boolean;
  blockGenderFilter: string;
  rooms: any[];
  blocks: any[];
  studentSearchMatches: any[];
  allocate: (e: React.FormEvent) => void;
}

export function AllocateBedCard({
  allocRoomId,
  setAllocRoomId,
  allocStudent,
  setAllocStudent,
  pickedStudentId,
  setPickedStudentId,
  bedNumber,
  setBedNumber,
  busyAlloc,
  blockGenderFilter,
  rooms,
  blocks,
  studentSearchMatches,
  allocate,
}: AllocateBedCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <UserCheck className="h-5 w-5 text-primary" />
        <span>Allocate Bed</span>
      </div>
      <form onSubmit={allocate} className="grid gap-4">
        <div className="space-y-1.5">
          <Label>Room</Label>
          <Select value={allocRoomId} onValueChange={setAllocRoomId}>
            <SelectTrigger>
              <SelectValue placeholder="Select room…" />
            </SelectTrigger>
            <SelectContent>
              {rooms
                .filter((r) => {
                  if (blockGenderFilter === "all") return true;
                  const matchedBlock = blocks.find(
                    (b) => b.name === r.hostelBlock,
                  );
                  return matchedBlock
                    ? matchedBlock.gender === blockGenderFilter
                    : true;
                })
                .map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.hostelBlock} · Room {r.roomNumber} ({r.occupancy}/
                    {r.capacity} occupied)
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 relative">
          <Label>Student (Search by Name, Reg No, or UID)</Label>
          {pickedStudentId ? (
            <div className="flex items-center justify-between p-2.5 rounded-md border bg-primary/5 border-primary/20">
              <div>
                <p className="font-semibold text-sm leading-tight">{allocStudent}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">Student Picked for Room Allocation</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  setPickedStudentId(null);
                  setAllocStudent("");
                }}
              >
                Change
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder="Search by student name, Reg No, or UID…"
                value={allocStudent}
                onChange={(e) => {
                  setAllocStudent(e.target.value);
                  setPickedStudentId(null);
                }}
              />
              {studentSearchMatches.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                  {studentSearchMatches.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      className="block w-full px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        setPickedStudentId(s._id);
                        setAllocStudent(
                          `${s.fullName} (${s.registrationNumber || s.hostelUid})`,
                        );
                      }}
                    >
                      <span className="font-medium">{s.fullName}</span>{" "}
                      <span className="font-mono text-xs text-muted-foreground block sm:inline sm:ml-2">
                        Reg: {s.registrationNumber || "—"} · UID: {s.hostelUid}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Bed Number</Label>
            <Input
              value={bedNumber}
              placeholder="e.g. 1"
              onChange={(e) => setBedNumber(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full"
              disabled={busyAlloc || !allocRoomId || !pickedStudentId}
            >
              {busyAlloc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Allocate
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
