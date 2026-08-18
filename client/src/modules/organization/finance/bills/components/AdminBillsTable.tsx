import { useState } from "react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
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
import { MONTHS } from "./PublishBillForm";
import { formatCurrency } from "@/core/utils/format";
import {
  CheckCircle2,
  ShieldAlert,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
} from "lucide-react";

interface AdminBillsTableProps {
  loading: boolean;
  bills: any[];
  onVerifyBatch?: (month: number, year: number, genderTarget?: string) => Promise<void>;
  onEditBatch?: (batch: any) => void;
}

export function AdminBillsTable({
  loading,
  bills,
  onVerifyBatch,
  onEditBatch,
}: AdminBillsTableProps) {
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1);
  const currentYearStr = String(now.getFullYear());

  // Filter States - Default to Current Month & Year
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [search, setSearch] = useState("");
  const [verifyingKey, setVerifyingKey] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  // Group bills into Batches by Period + GenderTarget
  const batchesMap = new Map<string, any>();

  bills.forEach((b) => {
    const key = `${b.billMonth}-${b.billYear}-${b.genderTarget || "all"}`;
    if (!batchesMap.has(key)) {
      batchesMap.set(key, {
        key,
        month: b.billMonth,
        year: b.billYear,
        genderTarget: b.genderTarget || "all",
        amount: b.amount,
        description: b.description,
        postedBy: b.generatedBy?.fullName || "Administration",
        postedRole: b.generatedBy?.role || "moderator",
        verifiedBy: b.verifiedBy?.fullName || (b.isVerified !== false ? "Hostel Officer (Admin)" : null),
        isVerified: b.isVerified !== false,
        totalBills: 0,
        billsList: [],
      });
    }

    const batch = batchesMap.get(key);
    batch.totalBills += 1;
    batch.billsList.push(b);
    if (b.isVerified === false) {
      batch.isVerified = false;
      batch.verifiedBy = null;
    }
  });

  const allBatches = Array.from(batchesMap.values());

  const filteredBatches = allBatches.filter((batch) => {
    // Month Filter
    if (selectedMonth !== "all" && String(batch.month) !== selectedMonth) {
      return false;
    }
    // Year Filter
    if (selectedYear !== "all" && String(batch.year) !== selectedYear) {
      return false;
    }
    // Text Search
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      const monthName = (MONTHS[batch.month - 1] || "").toLowerCase();
      const period = `${monthName} ${batch.year}`;
      const posted = (batch.postedBy || "").toLowerCase();
      const verified = (batch.verifiedBy || "").toLowerCase();
      const target = (batch.genderTarget || "").toLowerCase();
      return (
        period.includes(term) ||
        posted.includes(term) ||
        verified.includes(term) ||
        target.includes(term)
      );
    }
    return true;
  });

  const totalBatches = filteredBatches.length;
  const totalPages = Math.max(1, Math.ceil(totalBatches / limit));
  const startIndex = (page - 1) * limit;
  const paginatedBatches = filteredBatches.slice(startIndex, startIndex + limit);

  return (
    <Card className="overflow-hidden space-y-0">
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card">
        <div>
          <h2 className="font-semibold text-base">Billing History</h2>
          <p className="text-xs text-muted-foreground">
            {totalBatches} batch(es) listed ({selectedMonth === "all" ? "All Periods" : `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={selectedMonth}
              onValueChange={(val) => {
                setSelectedMonth(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {m} {String(i + 1) === currentMonthStr ? "(Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter Dropdown */}
          <Select
            value={selectedYear}
            onValueChange={(val) => {
              setSelectedYear(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[110px] h-9 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search period, posted by..."
              className="pl-9 h-9 text-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Target Hostel</TableHead>
            <TableHead>Bills Generated</TableHead>
            <TableHead>Amount / Student</TableHead>
            <TableHead>Posted By</TableHead>
            <TableHead>Verified By (OIH)</TableHead>
            <TableHead className="text-right">Action / Badge</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Loading bill batches history…
              </TableCell>
            </TableRow>
          )}
          {!loading && paginatedBatches.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                No published bill batches match the selected filter.
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            paginatedBatches.map((batch) => {
              return (
                <TableRow key={batch.key}>
                  <TableCell className="font-semibold text-sm">
                    {MONTHS[batch.month - 1]} {batch.year}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {batch.genderTarget === "all"
                        ? "All Hostels"
                        : `${batch.genderTarget} Hostel`}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {batch.totalBills} Bills
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {formatCurrency(batch.amount)}
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {batch.postedBy}
                  </TableCell>
                  <TableCell>
                    {batch.isVerified ? (
                      <div>
                        <p className="font-medium text-xs text-emerald-700 leading-tight">
                          {batch.verifiedBy || "Hostel Officer (Admin)"}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Verified & Released
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 italic font-medium">
                        Pending Verification
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {batch.isVerified ? (
                      <Badge variant="default" className="gap-1 bg-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Verified & Published
                      </Badge>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <Badge
                          variant="secondary"
                          className="gap-1 text-amber-600 border-amber-400 bg-amber-500/10 hidden lg:inline-flex"
                        >
                          <ShieldAlert className="h-3 w-3" /> Pending Admin Approval
                        </Badge>
                        {onEditBatch && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5 shrink-0"
                            onClick={() => onEditBatch(batch)}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Modify
                          </Button>
                        )}
                        {onVerifyBatch && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                            disabled={verifyingKey === batch.key}
                            onClick={async () => {
                              setVerifyingKey(batch.key);
                              try {
                                await onVerifyBatch(
                                  batch.month,
                                  batch.year,
                                  batch.genderTarget,
                                );
                              } finally {
                                setVerifyingKey(null);
                              }
                            }}
                          >
                            {verifyingKey === batch.key ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Verify & Release
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t bg-muted/10 text-xs text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {totalBatches === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(startIndex + limit, totalBatches)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{totalBatches}</span> bill batches
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
          </Button>
          <span className="px-2 font-medium text-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
