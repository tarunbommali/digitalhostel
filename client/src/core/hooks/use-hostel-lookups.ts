import { useState, useEffect, useCallback } from "react";
import { api } from "@/core/lib/api";

function extractArray(val: any, fallbackKey?: string): any[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") {
    if (Array.isArray(val.data)) return val.data;
    if (fallbackKey && Array.isArray(val[fallbackKey])) return val[fallbackKey];
    if (Array.isArray(val.departments)) return val.departments;
    if (Array.isArray(val.academicYears)) return val.academicYears;
    if (Array.isArray(val.blocks)) return val.blocks;
  }
  return [];
}

export function useHostelLookups() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [depts, years, blks] = await Promise.all([
        api.get<any>("/lookups/departments").catch(() => []),
        api.get<any>("/lookups/academic-years").catch(() => []),
        api.get<any>("/lookups/blocks").catch(() => []),
      ]);
      setDepartments(extractArray(depts, "departments"));
      setAcademicYears(extractArray(years, "academicYears"));
      setBlocks(extractArray(blks, "blocks"));
    } catch (err) {
      console.error("Failed to fetch hostel lookups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    departments: Array.isArray(departments) ? departments : [],
    academicYears: Array.isArray(academicYears) ? academicYears : [],
    blocks: Array.isArray(blocks) ? blocks : [],
    loading,
    refetch: fetchAll,
  };
}

export default useHostelLookups;
