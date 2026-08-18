import { api } from "@/core/lib/api";
import {
  DepartmentItem,
  AcademicYearItem,
  HostelBlockItem,
  HostelGender,
  ToggleYearResult,
} from "../types";

export const lookupService = {
  // Departments
  addDepartment(name: string): Promise<DepartmentItem> {
    return api.post<DepartmentItem>("/lookups/departments", { name });
  },

  deleteDepartment(id: string): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/lookups/departments/${id}`);
  },

  // Academic Years
  addAcademicYear(name: string): Promise<AcademicYearItem> {
    return api.post<AcademicYearItem>("/lookups/academic-years", { name });
  },

  deleteAcademicYear(id: string): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/lookups/academic-years/${id}`);
  },

  toggleAcademicYearCompletion(id: string): Promise<ToggleYearResult> {
    return api.patch<ToggleYearResult>(
      `/lookups/academic-years/${id}/toggle-completed`,
      {}
    );
  },

  // Hostel Blocks
  addBlock(
    name: string,
    code?: string,
    gender?: HostelGender
  ): Promise<HostelBlockItem> {
    return api.post<HostelBlockItem>("/lookups/blocks", { name, code, gender });
  },

  deleteBlock(id: string): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/lookups/blocks/${id}`);
  },

  updateBlock(
    id: string,
    name: string,
    code?: string,
    gender?: HostelGender
  ): Promise<{ ok: boolean; block: HostelBlockItem }> {
    return api.put<{ ok: boolean; block: HostelBlockItem }>(
      `/lookups/blocks/${id}`,
      { name, code, gender }
    );
  },
};
