
/**
 * Centralized environment configuration
 */
export const env = {
  NEXT_PUBLIC_ENABLE_API_MOCKING:
    process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true",

  NEXT_PUBLIC_APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME || "WhatsApp CRM",

  NODE_ENV: process.env.NODE_ENV || "development",
};
