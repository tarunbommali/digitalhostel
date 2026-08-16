import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/utils/useDebounce";
import { API_ENDPOINTS } from "@/utils/constants";
import { AddRoomCard } from "../components/AddRoomCard";
import { AllocateBedCard } from "../components/AllocateBedCard";
import { RoomsGridTable } from "../components/RoomsGridTable";

export function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Block gender filter state (all, boys, girls, co-ed)
  const [blockGenderFilter, setBlockGenderFilter] = useState<string>("all");

  // Add Room form state
  const [hostelBlock, setHostelBlock] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [busyRoom, setBusyRoom] = useState(false);

  // Allocate Bed form state
  const [allocRoomId, setAllocRoomId] = useState("");
  const [allocStudent, setAllocStudent] = useState("");
  const [pickedStudentId, setPickedStudentId] = useState<string | null>(null);
  const [bedNumber, setBedNumber] = useState("1");
  const [busyAlloc, setBusyAlloc] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, sData, blks] = await Promise.all([
        api.get<any[]>(API_ENDPOINTS.ROOMS),
        api.get<any>(`${API_ENDPOINTS.STUDENTS}?limit=200`),
        api.get<any[]>("/lookups/blocks"),
      ]);
      setRooms(rData);
      setStudents(Array.isArray(sData) ? sData : sData?.students || []);
      setBlocks(blks);

      if (blks && blks.length > 0 && !hostelBlock) {
        setHostelBlock(blks[0].name);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, [hostelBlock]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!hostelBlock || !roomNumber.trim()) {
      toast.error("Select block and enter room number");
      return;
    }
    setBusyRoom(true);
    try {
      await api.post("/rooms", { hostelBlock, roomNumber, capacity });
      toast.success(`Room ${roomNumber} added to ${hostelBlock}`);
      setRoomNumber("");
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Failed to add room");
    } finally {
      setBusyRoom(false);
    }
  }

  async function allocate(e: React.FormEvent) {
    e.preventDefault();
    if (!allocRoomId || !pickedStudentId) {
      toast.error("Select room and student from suggestions");
      return;
    }
    setBusyAlloc(true);
    try {
      await api.post(`/rooms/${allocRoomId}/allocate`, {
        studentId: pickedStudentId,
        bedNumber: parseInt(bedNumber, 10) || 1,
      });
      toast.success("Bed allocated successfully");
      setAllocStudent("");
      setPickedStudentId(null);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Failed to allocate bed");
    } finally {
      setBusyAlloc(false);
    }
  }

  const studentSearchMatches = allocStudent.trim()
    ? students
        .filter((s) => {
          const q = allocStudent.toLowerCase().trim();
          return (
            s.fullName?.toLowerCase().includes(q) ||
            s.registrationNumber?.toLowerCase().includes(q) ||
            s.hostelUid?.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rooms & Bed Allocation</h1>
        <p className="text-sm text-muted-foreground">
          Manage hostel blocks, room capacities, and assign student bed allocations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AddRoomCard
          hostelBlock={hostelBlock} setHostelBlock={setHostelBlock}
          roomNumber={roomNumber} setRoomNumber={setRoomNumber}
          capacity={capacity} setCapacity={setCapacity}
          busyRoom={busyRoom} blockGenderFilter={blockGenderFilter}
          blocks={blocks} addRoom={addRoom}
        />

        <AllocateBedCard
          allocRoomId={allocRoomId} setAllocRoomId={setAllocRoomId}
          allocStudent={allocStudent} setAllocStudent={setAllocStudent}
          pickedStudentId={pickedStudentId} setPickedStudentId={setPickedStudentId}
          bedNumber={bedNumber} setBedNumber={setBedNumber}
          busyAlloc={busyAlloc} blockGenderFilter={blockGenderFilter}
          rooms={rooms} blocks={blocks}
          studentSearchMatches={studentSearchMatches} allocate={allocate}
        />
      </div>

      <RoomsGridTable
        loading={loading} rooms={rooms} blocks={blocks}
        blockGenderFilter={blockGenderFilter} setBlockGenderFilter={setBlockGenderFilter}
      />
    </div>
  );
}

export default RoomsPage;
