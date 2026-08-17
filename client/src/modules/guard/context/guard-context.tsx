import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { api } from "@/core/lib/api";
import { toast } from "sonner";
import { LogbookEntry, VerifiedStudentScan } from "../types/guard.types";

interface GuardContextValue {
  logbook: LogbookEntry[];
  loadingLogbook: boolean;
  scannedData: VerifiedStudentScan | null;
  loadingScan: boolean;
  recordingMovement: boolean;
  verifyCode: (code: string) => Promise<void>;
  recordMovement: (type: "out" | "in", purpose?: string, remarks?: string) => Promise<boolean>;
  clearScannedData: () => void;
  fetchLogbook: () => Promise<void>;
}

const GuardContext = createContext<GuardContextValue | null>(null);

export const GuardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [loadingLogbook, setLoadingLogbook] = useState(true);
  const [scannedData, setScannedData] = useState<VerifiedStudentScan | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [recordingMovement, setRecordingMovement] = useState(false);

  const fetchLogbook = useCallback(async () => {
    setLoadingLogbook(true);
    try {
      const data = await api.get<LogbookEntry[]>("/outings/logbook");
      setLogbook(data || []);
    } catch (err: any) {
      console.error("Failed to load gate logbook:", err);
    } finally {
      setLoadingLogbook(false);
    }
  }, []);

  useEffect(() => {
    fetchLogbook();
  }, [fetchLogbook]);

  const verifyCode = useCallback(async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setLoadingScan(true);
    setScannedData(null);

    try {
      const res: any = await api.post("/outings/verify-scan", { code: codeToVerify.trim() });
      if (res.ok) {
        setScannedData(res);
        toast.success(`Student Verified: ${res.student.fullName}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to verify student Digital ID");
    } finally {
      setLoadingScan(false);
    }
  }, []);

  const recordMovement = useCallback(
    async (type: "out" | "in", purpose?: string, remarks?: string): Promise<boolean> => {
      if (!scannedData || !scannedData.student) return false;
      setRecordingMovement(true);

      try {
        await api.post("/outings/record", {
          studentId: scannedData.student._id,
          type,
          purpose: purpose?.trim() || undefined,
          remarks: remarks?.trim() || undefined,
        });

        toast.success(
          `Successfully logged ${type.toUpperCase()} entry for ${scannedData.student.fullName}`
        );
        setScannedData(null);
        await fetchLogbook();
        return true;
      } catch (err: any) {
        toast.error(err.message || "Failed to record gate movement");
        return false;
      } finally {
        setRecordingMovement(false);
      }
    },
    [scannedData, fetchLogbook]
  );

  const clearScannedData = useCallback(() => {
    setScannedData(null);
  }, []);

  const value = useMemo(
    () => ({
      logbook,
      loadingLogbook,
      scannedData,
      loadingScan,
      recordingMovement,
      verifyCode,
      recordMovement,
      clearScannedData,
      fetchLogbook,
    }),
    [
      logbook,
      loadingLogbook,
      scannedData,
      loadingScan,
      recordingMovement,
      verifyCode,
      recordMovement,
      clearScannedData,
      fetchLogbook,
    ]
  );

  return <GuardContext.Provider value={value}>{children}</GuardContext.Provider>;
};

export const useGuard = () => {
  const context = useContext(GuardContext);
  if (!context) {
    throw new Error("useGuard must be used within a GuardProvider");
  }
  return context;
};

export default GuardContext;
