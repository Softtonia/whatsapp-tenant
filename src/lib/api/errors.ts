export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const anyErr = error as Record<string, any>;
    if (typeof anyErr.message === "string" && anyErr.message) {
      return anyErr.message;
    }
    if (anyErr.response?.data?.message) {
      return String(anyErr.response.data.message);
    }
    if (anyErr.data?.message) {
      return String(anyErr.data.message);
    }
  }

  return fallback;
}

