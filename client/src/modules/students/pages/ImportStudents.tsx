import { useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import { useAuth } from "@/core/context/auth-context";

type Row = {
  email: string;
  fullName: string;
  registrationNumber: string;
  programType: "UG" | "PG";
  departmentName: string;
  academicYearLabel: string;
};

const REQUIRED = [
  "email",
  "full_name",
  "registration_number",
  "program_type",
  "department_name",
  "academic_year",
] as const;
const SAMPLE = `email,full_name,registration_number,program_type,department_name,academic_year
jane@example.com,Jane Doe,22B01A0501,UG,Computer Science,2024-2025
`;

export function ImportStudents() {
  const { role } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  if (role !== "admin" && role !== "moderator") return <div className="p-6 text-sm">Access denied.</div>;

  function handleFile(file: File) {
    setResult(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => {
        const errs: string[] = [];
        const fields = (res.meta.fields ?? []).map((f) => f.toLowerCase());
        const missing = REQUIRED.filter((c) => !fields.includes(c));
        if (missing.length) {
          setErrors([`Missing columns: ${missing.join(", ")}`]);
          setRows([]);
          return;
        }
        const parsed: Row[] = [];
        (res.data as any[]).forEach((r, i) => {
          const email = String(r.email ?? "").trim();
          const fullName = String(r.full_name ?? "").trim();
          const reg = String(r.registration_number ?? "").trim();
          const pt = String(r.program_type ?? "")
            .trim()
            .toUpperCase();
          const dept = String(r.department_name ?? "").trim();
          const yr = String(r.academic_year ?? "").trim();
          if (!email || !fullName || !reg || !dept || !yr) {
            errs.push(`Row ${i + 2}: missing required field`);
            return;
          }
          if (pt !== "UG" && pt !== "PG") {
            errs.push(`Row ${i + 2}: program_type must be UG or PG`);
            return;
          }
          parsed.push({
            email,
            fullName,
            registrationNumber: reg,
            programType: pt as "UG" | "PG",
            departmentName: dept,
            academicYearLabel: yr,
          });
        });
        setErrors(errs);
        setRows(parsed);
      },
    });
  }

  async function handleImport() {
    setBusy(true);
    try {
      const r: any = await api.post("/students/bulk", { rows });
      setResult(r);
      toast.success(`${r.succeeded}/${r.total} students created`);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/students">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Bulk import students</h1>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-semibold">CSV format</h2>
          <p className="text-sm text-muted-foreground">
            Required columns:{" "}
            <code>
              email, full_name, registration_number, program_type,
              department_name, academic_year
            </code>
            . Department names and academic year labels must match existing
            records. Temporary password is <code>Hostel@&lt;UID&gt;</code>.
          </p>
          <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
            {SAMPLE}
          </pre>
        </div>

        <div>
          <input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button asChild variant="outline">
            <label htmlFor="csv" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> Choose CSV
            </label>
          </Button>
        </div>

        {errors.length > 0 && (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <div className="font-medium mb-1">{errors.length} issue(s):</div>
            <ul className="list-disc pl-5 space-y-0.5">
              {errors.slice(0, 20).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {rows.length} valid rows ready to import.
              </div>
              <Button disabled={busy} onClick={handleImport}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Import {rows.length}
              </Button>
            </div>
            <div className="max-h-80 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 100).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{r.fullName}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{r.registrationNumber}</TableCell>
                      <TableCell>{r.programType}</TableCell>
                      <TableCell>{r.departmentName}</TableCell>
                      <TableCell>{r.academicYearLabel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {result && (
          <div className="rounded border p-3 text-sm space-y-2">
            <div className="font-medium">
              Result: {result.succeeded}/{result.total} succeeded
            </div>
            {result.results.filter((r: any) => !r.ok).length > 0 && (
              <div>
                <div className="text-destructive font-medium">Failures:</div>
                <ul className="list-disc pl-5">
                  {result.results
                    .filter((r: any) => !r.ok)
                    .slice(0, 50)
                    .map((r: any) => (
                      <li key={r.row}>
                        Row {r.row}: {r.error}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
export default ImportStudents;
