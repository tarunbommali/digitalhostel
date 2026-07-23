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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">My Payment History</h1>
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
                  className="text-center py-8 text-muted-foreground font-medium"
                >
                  Loading payment history…
                </TableCell>
              </TableRow>
            )}
            {!loading && payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground text-sm font-medium"
                >
                  No payment records found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              payments.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell>
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {p.referenceId || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      🏛️ SBI Collect
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.remarks ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
