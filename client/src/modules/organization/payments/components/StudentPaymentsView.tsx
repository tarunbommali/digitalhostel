import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { formatCurrency } from "@/core/utils/format";
import { Breadcrumbs } from "@/core/components/ui/Breadcrumbs";

export function StudentPaymentsView() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>("/payments")
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Payment History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track recorded fee settlements, SBI Collect receipts, and transaction status
          </p>
        </div>
        <Breadcrumbs />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>SBI Collect Ref ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading payments…
                </TableCell>
              </TableRow>
            )}
            {!loading && payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No payment records found.
                </TableCell>
              </TableRow>
            )}
            {payments.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="font-mono">{p.referenceId || "—"}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  {formatCurrency(p.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{p.paymentMethod || "SBI Collect"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.remarks || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default StudentPaymentsView;
