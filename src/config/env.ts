const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
}

export const env = {
  apiBaseUrl,
};
