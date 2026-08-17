// Extract Hostel UID from QR Code text or raw UID
export function extractHostelUid(scannedText: string): string | null {
  if (!scannedText) return null;
  const trimmed = scannedText.trim();

  // If encoded Digital ID QR Pass (starts with JNTUGV-PASS::)
  if (trimmed.startsWith("JNTUGV-PASS::")) {
    try {
      const base64Data = trimmed.replace("JNTUGV-PASS::", "");
      const decodedJson = atob(base64Data);
      const parsed = JSON.parse(decodedJson);
      if (parsed && parsed.hUid) return String(parsed.hUid);
    } catch (e) {
      console.error("Failed to parse QR payload:", e);
    }
  }

  // If raw 6-digit Hostel UID
  if (/^\d{6}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
