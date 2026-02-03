import { describe, expect, it } from "vitest";

import { buildResponse } from "./proxy";

describe("backrest proxy buildResponse", () => {
  it("aggregates plan metrics and latest status counts", () => {
    const plans = [
      {
        backupsSuccessLast30days: 3,
        backupsFailed30days: 1,
        bytesAddedLast30days: 1000,
        recentBackups: { status: ["STATUS_SUCCESS"] },
      },
      {
        backupsSuccessLast30days: 2,
        backupsFailed30days: 0,
        bytesAddedLast30days: 500,
        recentBackups: { status: ["STATUS_ERROR"] },
      },
      {
        backupsSuccessLast30days: "not-a-number",
        backupsFailed30days: 4,
        bytesAddedLast30days: 250,
        recentBackups: { status: [] },
      },
    ];

    expect(buildResponse(plans)).toEqual({
      numPlans: 3,
      numSuccess30Days: 5,
      numFailure30Days: 5,
      numSuccessLatest: 1,
      numFailureLatest: 1,
      bytesAdded30Days: 1750,
    });
  });
});
