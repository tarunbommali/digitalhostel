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

interface AdminPaymentsTableProps {
  loading: boolean;
  payments: any[];
}

export function AdminPaymentsTable({
  loading,
  payments,
}: AdminPaymentsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b p-4 font-medium">Recent Payments ({payments.length})</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Hostel UID</TableHead>
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
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Loading payments…
              </TableCell>
            </TableRow>
          )}
          {!loading && payments.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No payments recorded yet.
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            payments.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell>
                  {new Date(p.paymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">{p.student?.fullName}</TableCell>
                <TableCell className="font-mono text-xs">
                  {p.student?.hostelUid}
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
  );
}
