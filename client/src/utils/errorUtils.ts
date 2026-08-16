/**
 * Safely extracts a user-friendly error message from an unknown error object or API response exception.
 */
export function getErrorMessage(err: unknown, fallbackMessage: string = "An unexpected error occurred"): string {
  if (!err) return fallbackMessage;

  if (typeof err === "string") return err;

  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, any>;
    if (typeof obj.message === "string" && obj.message) {
      return obj.message;
    }
    if (typeof obj.error === "string" && obj.error) {
      return obj.error;
    }
  }

  return fallbackMessage;
}

export default getErrorMessage;
