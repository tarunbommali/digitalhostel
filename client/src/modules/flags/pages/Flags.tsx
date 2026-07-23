import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TYPES = ["discipline", "billing", "attendance", "other"] as const;

export function FlagsPage() {
  const { role } = useAuth();
  const isStaff = role === "admin" || role === "moderator";

  const [flags, setFlags] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [type, setType] = useState<(typeof TYPES)[number]>("discipline");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshData = useCallback(() => {
    setLoading(true);
    const promises = [api.get<any>("/flags")];
    if (isStaff) {
      promises.push(api.get<any>("/students?limit=1000"));
    }

    Promise.all(promises)
      .then(([flagsData, studentsData]) => {
        setFlags(Array.isArray(flagsData) ? flagsData : flagsData?.flags || []);
        if (studentsData) {
          setStudents(Array.isArray(studentsData) ? studentsData : studentsData?.students || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isStaff]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  async function createFlag(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/flags", {
        studentId: selectedStudent?._id,
        flagType: type,
        description: desc,
      });
      toast.success("Flag raised");
      setDesc("");
      setSelectedStudent(null);
      setStudentSearch("");
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit flag");
    } finally {
      setBusy(false);
    }
  }

  async function resolve(id: string) {
    if (!window.confirm("Are you sure you want to resolve this flag?")) return;
    try {
      await api.put(`/flags/${id}/resolve`);
      toast.success("Flag resolved");
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve flag");
    }
  }

  // Student search logic (matches Name, Hostel UID, or Registration Number)
  const searchMatches = students
    .filter((s) => {
      if (studentSearch.length < 2 || selectedStudent) return false;
      const term = studentSearch.toLowerCase();
      return (
        (s.fullName && s.fullName.toLowerCase().includes(term)) ||
        (s.hostelUid && s.hostelUid.toLowerCase().includes(term)) ||
        (s.registrationNumber && s.registrationNumber.toLowerCase().includes(term))
      );
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Flag reports</h1>

      {isStaff && (
        <Card className="p-6">
          <h2 className="font-semibold">Raise a flag</h2>
          <form
            onSubmit={createFlag}
            className="mt-4 grid gap-4 md:grid-cols-2"
          >
            <div>
              <Label>Student</Label>
              <Input
                placeholder="Search by name, Reg No, or UID…"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setSelectedStudent(null);
                }}
              />
              {searchMatches.length > 0 && (
                <div className="mt-2 max-h-48 overflow-auto rounded-md border bg-popover text-popover-foreground">
                  {searchMatches.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setSelectedStudent(s);
                        setStudentSearch(`${s.fullName} (${s.hostelUid})`);
                      }}
                    >
                      {s.fullName}{" "}
                      <span className="text-xs text-muted-foreground font-mono">
                        · {s.hostelUid}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button disabled={busy || !selectedStudent} type="submit">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Submit flag
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading flags…
                </TableCell>
              </TableRow>
            )}
            {!loading && flags.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No flags.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              flags.map((f: any) => (
                <TableRow key={f._id}>
                  <TableCell>
                    {f.student?.fullName}{" "}
                    <span className="text-xs text-muted-foreground font-mono">
                      ({f.student?.hostelUid})
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{f.flagType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                    {f.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        f.status === "resolved" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isStaff && f.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolve(f._id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
export default FlagsPage;
