import { useEffect, useState } from "react";
import { api } from "@/core/lib/api";
import { Card } from "@/core/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { MONTHS } from "./PublishBillForm";

export function StudentBillsView() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>("/bills")
      .then(setBills)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My bills</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading bills…
                </TableCell>
              </TableRow>
            )}
            {!loading && bills.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No bills yet.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              bills.map((b: any) => (
                <TableRow key={b._id}>
                  <TableCell>
                    {MONTHS[b.billMonth - 1]} {b.billYear}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {b.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    ₹{Number(b.amount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    ₹{Number(b.paidAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    ₹{Number(b.remainingAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge s={b.status} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
