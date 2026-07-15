import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const getMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
  },
}));

describe("getMemberProfile", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests and returns only documented member profile fields", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "웨어",
          email: "wear@example.com",
          providerEmail: "provider@example.com",
        },
      },
    });

    const { getMemberProfile } = await import("./getMemberProfile");

    await expect(getMemberProfile()).resolves.toEqual({
      memberId: 1,
      nickname: "웨어",
      email: "wear@example.com",
    });
    expect(getMock).toHaveBeenCalledOnce();
    expect(getMock).toHaveBeenCalledWith("/api/members/me");
  });

  it("rejects undocumented providerEmail and string memberId fields", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: "1",
          nickname: "웨어",
          providerEmail: "provider@example.com",
        },
      },
    });

    const { getMemberProfile } = await import("./getMemberProfile");

    await expect(getMemberProfile()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: null,
    });
  });

  it("rejects a null email because the documented field is a string", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "웨어",
          email: null,
        },
      },
    });

    const { getMemberProfile } = await import("./getMemberProfile");

    await expect(getMemberProfile()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: null,
    });
  });

  it("throws the documented API error envelope", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "MEMBER_500",
        message: "failed",
        result: null,
      },
    });

    const { getMemberProfile } = await import("./getMemberProfile");

    await expect(getMemberProfile()).rejects.toMatchObject({
      code: "MEMBER_500",
      message: "failed",
      status: 200,
    });
  });

  it("propagates an undeployed endpoint error without using local profile data", async () => {
    getMock.mockRejectedValueOnce(
      new ApiError({
        code: "COMMON_405",
        message: "unsupported method",
        status: 405,
      }),
    );

    const { getMemberProfile } = await import("./getMemberProfile");

    await expect(getMemberProfile()).rejects.toMatchObject({
      code: "COMMON_405",
      status: 405,
    });
  });

  it("rejects an error envelope that omits the documented result field", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "MEMBER_500",
        message: "failed",
      },
    });

    const { getMemberProfile } = await import("./getMemberProfile");

    await expect(getMemberProfile()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: null,
    });
  });
});
