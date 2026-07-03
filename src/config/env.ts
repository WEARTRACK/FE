const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const enableTestAccessToken = process.env.EXPO_PUBLIC_ENABLE_TEST_ACCESS_TOKEN === "true";
const testAccessToken = process.env.EXPO_PUBLIC_TEST_ACCESS_TOKEN?.trim() || null;
const testMemberId = Number(process.env.EXPO_PUBLIC_TEST_MEMBER_ID);
const testClosetId = Number(process.env.EXPO_PUBLIC_TEST_CLOSET_ID);

if (!apiBaseUrl) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
}

export const env = {
  apiBaseUrl,
  enableTestAccessToken,
  testAccessToken,
  testMemberId: Number.isInteger(testMemberId) && testMemberId > 0 ? testMemberId : null,
  testClosetId: Number.isInteger(testClosetId) && testClosetId > 0 ? testClosetId : null,
};
