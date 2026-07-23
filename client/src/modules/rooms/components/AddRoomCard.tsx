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
import { BedDouble, Loader2 } from "lucide-react";

interface AddRoomCardProps {
  hostelBlock: string;
  setHostelBlock: (val: string) => void;
  roomNumber: string;
  setRoomNumber: (val: string) => void;
  capacity: number;
  setCapacity: (val: number) => void;
  busyRoom: boolean;
  blockGenderFilter: string;
  blocks: any[];
  addRoom: (e: React.FormEvent) => void;
}

export function AddRoomCard({
  hostelBlock,
  setHostelBlock,
  roomNumber,
  setRoomNumber,
  capacity,
  setCapacity,
  busyRoom,
  blockGenderFilter,
  blocks,
  addRoom,
}: AddRoomCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 font-semibold text-base border-b pb-3 mb-4">
        <BedDouble className="h-5 w-5 text-primary" />
        <span>Add New Room</span>
      </div>
      <form onSubmit={addRoom} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Hostel Block Collection</Label>
          <Select value={hostelBlock} onValueChange={setHostelBlock}>
            <SelectTrigger>
              <SelectValue placeholder="Select Hostel Block…" />
            </SelectTrigger>
            <SelectContent>
              {blocks.length === 0 ? (
                <SelectItem value="none" disabled>
                  No Blocks Available (Add in Lookups)
                </SelectItem>
              ) : (
                blocks
                  .filter(
                    (b) =>
                      blockGenderFilter === "all" ||
                      b.gender === blockGenderFilter,
                  )
                  .map((b) => (
                    <SelectItem key={b._id || b.name} value={b.name}>
                      {b.name} {b.code ? `(${b.code})` : ""} · {b.gender}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Room Number</Label>
          <Input
            required
            placeholder="e.g. 101"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Capacity</Label>
          <Input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2 flex justify-end pt-2">
          <Button type="submit" disabled={busyRoom || !hostelBlock}>
            {busyRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Add Room
          </Button>
        </div>
      </form>
    </Card>
  );
}
