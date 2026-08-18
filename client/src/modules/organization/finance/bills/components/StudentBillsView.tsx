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
import { PageHeader } from "@/core/components/ui/PageHeader";

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
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        eyebrow="Finance"
        title="My Monthly Invoices"
        description="View generated hostel invoices, mess dues, and payment settlement status"
        breadcrumbs={[
          { label: "Hostel", to: "dashboard" },
          { label: "Monthly Invoices" },
        ]}
      />

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
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading bills…
                </TableCell>
              </TableRow>
            )}
            {!loading && bills.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No bills found.
                </TableCell>
              </TableRow>
            )}
            {bills.map((b) => {
              const rem = (b.totalAmount || 0) - (b.paidAmount || 0);
              return (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">
                    {MONTHS[(b.month || 1) - 1]} {b.year}
                  </TableCell>
                  <TableCell>{b.description || "—"}</TableCell>
                  <TableCell>₹{(b.totalAmount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">
                    ₹{(b.paidAmount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={rem > 0 ? "font-semibold text-destructive" : ""}
                  >
                    ₹{rem.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge s={b.status || "unpaid"} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default StudentBillsView;
