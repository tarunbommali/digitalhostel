import { useState } from "react";
import Papa from "papaparse";
import { api } from "@/core/lib/api";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function BulkCsvPublish({
  onPublishSuccess,
}: {
  onPublishSuccess: () => void;
}) {
  const [rows, setRows] = useState<
    Array<{ month: number; year: number; amount: number; description?: string }>
  >([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => {
        const errs: string[] = [];
        const parsed: typeof rows = [];
        (res.data as any[]).forEach((r, i) => {
          const month = Number(r.month),
            year = Number(r.year),
            amount = Number(r.amount);
          if (!month || month < 1 || month > 12) {
            errs.push(`Row ${i + 2}: invalid month`);
            return;
          }
          if (!year || year < 2000) {
            errs.push(`Row ${i + 2}: invalid year`);
            return;
          }
          if (!amount || amount <= 0) {
            errs.push(`Row ${i + 2}: invalid amount`);
            return;
          }
          parsed.push({
            month,
            year,
            amount,
            description: r.description ? String(r.description) : undefined,
          });
        });
        setErrors(errs);
        setRows(parsed);
      },
    });
  }

  async function handleBulkPublish() {
    setBusy(true);
    try {
      const r: any = await api.post("/bills/bulk-publish", { rows });
      const total = r.results.reduce((s: number, x: any) => s + x.generated, 0);
      toast.success(
        `Generated ${total} bills across ${r.results.length} periods`,
      );
      setRows([]);
      onPublishSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed bulk publish");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 space-y-3">
      <div>
        <h2 className="font-semibold">Publish bills from CSV</h2>
        <p className="text-sm text-muted-foreground">
          Columns: <code>month, year, amount, description</code>. One row per
          period; each row generates one bill per active student.
        </p>
      </div>
      <div>
        <input
          id="bill-csv"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button asChild variant="outline">
          <label htmlFor="bill-csv" className="cursor-pointer">
            Choose CSV
          </label>
        </Button>
      </div>
      {errors.length > 0 && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <ul className="list-disc pl-5">
            {errors.slice(0, 10).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm">{rows.length} period(s) ready.</div>
          <Button disabled={busy} onClick={handleBulkPublish}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish{" "}
            {rows.length}
          </Button>
        </div>
      )}
    </Card>
  );
}
