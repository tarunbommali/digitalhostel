import * as React from "react";
import { Filter, DoorOpen, Bed, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";

interface RoomsGridTableProps {
  loading: boolean;
  rooms: any[];
  blocks: any[];
  blockGenderFilter: string;
  setBlockGenderFilter: (val: string) => void;
}

export function RoomsGridTable({
  loading,
  rooms,
  blocks,
  blockGenderFilter,
  setBlockGenderFilter,
}: RoomsGridTableProps) {
  const filteredRooms = rooms.filter((r) => {
    if (blockGenderFilter === "all") return true;
    const matchedBlock = blocks.find((b) => b.name === r.hostelBlock);
    return matchedBlock ? matchedBlock.gender === blockGenderFilter : true;
  });

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm space-y-5">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <h3 className="font-h3 text-[var(--text-primary)]">Rooms & Bed Visualizer ({filteredRooms.length})</h3>
          <p className="font-small text-[var(--text-muted)]">Real-time room occupancy and student allocation slots</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--text-muted)]" />
          <Select value={blockGenderFilter} onValueChange={setBlockGenderFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]">
              <SelectValue placeholder="Hostel Gender" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--text-primary)]">
              <SelectItem value="all">All Hostel Blocks</SelectItem>
              <SelectItem value="boys">Boys Hostels Only</SelectItem>
              <SelectItem value="girls">Girls Hostels Only</SelectItem>
              <SelectItem value="co-ed">Co-Ed Hostels Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredRooms.length === 0 && (
        <div className="py-12 text-center text-sm text-[var(--text-muted)]">
          No rooms match the selected hostel block filter.
        </div>
      )}

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((r) => {
          const matchedBlock = blocks.find((b) => b.name === r.hostelBlock);
          const capacity = r.capacity || 3;
          const occupancy = r.occupancy || 0;
          const available = Math.max(0, capacity - occupancy);
          const percent = Math.round((occupancy / capacity) * 100);

          return (
            <div
              key={r.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 p-4 hover:border-[var(--color-border-strong)] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Title & Block Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-[var(--tenant-primary)]" />
                    <span className="font-body-medium text-sm text-[var(--text-primary)] font-semibold">
                      Room {r.roomNumber}
                    </span>
                  </div>
                  <Badge variant={matchedBlock?.gender === "girls" ? "brand" : "neutral"} size="sm">
                    {r.hostelBlock}
                  </Badge>
                </div>

                {/* Occupancy Indicator Bar */}
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5">
                  <span>Capacity: {capacity}</span>
                  <span>Occupied: {occupancy}</span>
                  <span className={available > 0 ? "text-[var(--color-success)] font-medium" : "text-[var(--text-muted)]"}>
                    Available: {available}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent === 100 ? "bg-[var(--color-danger)]" : percent > 50 ? "bg-[var(--tenant-primary)]" : "bg-[var(--color-success)]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Bed Allocation Slots */}
                <div className="space-y-1.5">
                  {Array.from({ length: capacity }).map((_, bIdx) => {
                    const bedNum = bIdx + 1;
                    const allocated = r.beds?.find((b: any) => b.bedNumber === bedNum);

                    return (
                      <div
                        key={bedNum}
                        className={`p-2 rounded-md text-xs flex items-center justify-between transition-colors ${
                          allocated
                            ? "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-primary)]"
                            : "border border-dashed border-[var(--color-border)] text-[var(--text-muted)] bg-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Bed className={`h-3.5 w-3.5 shrink-0 ${allocated ? "text-[var(--tenant-primary)]" : "text-[var(--text-muted)]"}`} />
                          <span className="font-mono font-semibold text-[11px]">Bed {bedNum}:</span>
                          {allocated ? (
                            <span className="truncate text-xs font-medium text-[var(--text-primary)]">
                              {allocated.studentName}
                            </span>
                          ) : (
                            <span className="text-[11px] italic">FREE / AVAILABLE</span>
                          )}
                        </div>
                        {allocated && (
                          <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0 ml-1">
                            {allocated.studentReg}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
