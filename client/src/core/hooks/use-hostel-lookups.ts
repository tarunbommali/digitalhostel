import { useState, useEffect, useCallback } from "react";
import { api } from "@/core/lib/api";

export function useHostelLookups() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [depts, years, blks] = await Promise.all([
        api.get<any[]>("/lookups/departments"),
        api.get<any[]>("/lookups/academic-years"),
        api.get<any[]>("/lookups/blocks"),
      ]);
      setDepartments(depts || []);
      setAcademicYears(years || []);
      setBlocks(blks || []);
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
    departments,
    academicYears,
    blocks,
    loading,
    refetch: fetchAll,
  };
}
