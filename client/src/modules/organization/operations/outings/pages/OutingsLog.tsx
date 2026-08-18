import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { useParams } from "react-router-dom";
import { useDebounce } from "@/core/hooks/useDebounce";
import { API_ENDPOINTS } from "@/utils/constants";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageHeader } from "@/core/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Clock, Search, Loader2, ShieldCheck, UserCheck, CalendarDays, Filter, RefreshCw } from "lucide-react";

export function OutingsLogPage() {
  const { role } = useAuth();
  const { organization } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : "";
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterType, setFilterType] = useState<"all" | "out" | "in">("all");

  const isStudent = role === "student";

  const fetchLogs = () => {
    setLoading(true);
    const endpoint = isStudent
      ? `${API_ENDPOINTS.OUTINGS}/my-status`
      : `${API_ENDPOINTS.OUTINGS}/logbook`;
    api
      .get<any>(endpoint)
      .then((res) => {
        if (isStudent) {
          setLogs(res.history || []);
        } else {
          setLogs(res || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [role]);

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "all" && log.type !== filterType) return false;

    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase();

    const stuName = log.student?.fullName?.toLowerCase() || "";
    const regNo = log.student?.registrationNumber?.toLowerCase() || "";
    const uid = log.student?.hostelUid?.toLowerCase() || "";
    const purpose = log.purpose?.toLowerCase() || "";
    const guardName = log.guard?.fullName?.toLowerCase() || "";

    return (
      stuName.includes(q) ||
      regNo.includes(q) ||
      uid.includes(q) ||
      purpose.includes(q) ||
      guardName.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Operations"
        title="Gate Outing Logbook"
        description={
          isStudent
            ? "View your personal gate entry and exit history"
            : "Comprehensive gate entry & exit logbook for Admin, Wardens, and Security Guards"
        }
        breadcrumbs={[
          { label: organization?.name || "Hostel", to: `${basePath}/dashboard` },
          { label: "Outings Log" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </Button>
        }
      />

      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isStudent && (
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Student Name, Reg No, Hostel UID, or Purpose…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-md border p-1 bg-muted/40">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === "all" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("out")}
                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === "out" ? "bg-amber-500/20 text-amber-700 font-semibold" : "text-muted-foreground"
                  }`}
              >
                OUT
              </button>
              <button
                onClick={() => setFilterType("in")}
                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === "in" ? "bg-emerald-500/20 text-emerald-700 font-semibold" : "text-muted-foreground"
                  }`}
              >
                IN
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                {!isStudent && <TableHead>Student Name & Reg No</TableHead>}
                <TableHead>Movement Type</TableHead>
                <TableHead>Purpose / Pass Reason</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={isStudent ? 4 : 5} className="text-center py-8 text-muted-foreground text-sm">
                    Loading outing logbook records…
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isStudent ? 4 : 5} className="text-center py-8 text-muted-foreground text-sm">
                    No outing log records found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="text-xs font-mono">
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    {!isStudent && (
                      <TableCell>
                        <div className="font-medium text-xs">
                          {log.student?.fullName || "Student"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {log.student?.registrationNumber || log.student?.hostelUid}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={log.type === "out" ? "destructive" : "default"}
                        className={
                          log.type === "out"
                            ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-300 font-semibold"
                            : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300 font-semibold"
                        }
                      >
                        {log.type === "out" ? "OUT (Gate Exit)" : "IN (Gate Entry)"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {log.purpose || log.remarks || "General Gate Movement"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {log.guard?.fullName || "Security Guard"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default OutingsLogPage;
