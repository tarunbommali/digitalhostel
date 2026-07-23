import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Filter } from "lucide-react";

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
    <Card className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
        <div className="flex items-center gap-2 font-semibold text-base">
          <span>Rooms & Bed Allocations ({filteredRooms.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={blockGenderFilter}
            onValueChange={setBlockGenderFilter}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs font-medium">
              <SelectValue placeholder="Filter Block Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostel Blocks</SelectItem>
              <SelectItem value="boys">Boys Hostels Only</SelectItem>
              <SelectItem value="girls">Girls Hostels Only</SelectItem>
              <SelectItem value="co-ed">Co-Ed Hostels Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hostel Block</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Current Beds & Allocated Students</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading &&
            Array.from({ length: 4 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
              </TableRow>
            ))}
          {!loading && filteredRooms.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-sm text-muted-foreground py-8"
              >
                No rooms match the selected Hostel Block gender filter.
              </TableCell>
            </TableRow>
          )}
          {filteredRooms.map((r) => {
            const matchedBlock = blocks.find((b) => b.name === r.hostelBlock);
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{r.hostelBlock}</span>
                    {matchedBlock?.gender && (
                      <Badge
                        variant={
                          matchedBlock.gender === "boys"
                            ? "default"
                            : matchedBlock.gender === "girls"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] capitalize px-1.5 py-0"
                      >
                        {matchedBlock.gender}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono">
                  Room {r.roomNumber}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {r.occupancy} / {r.capacity} Occupied
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.beds && r.beds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {r.beds.map((b: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-xs bg-muted/40 border px-2.5 py-1 rounded-md"
                        >
                          <b className="font-mono text-primary">
                            Bed {b.bedNumber}:
                          </b>{" "}
                          {b.studentName} ({b.studentReg})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No beds allocated
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
