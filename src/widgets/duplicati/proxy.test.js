import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getServiceWidget, httpProxy } = vi.hoisted(() => ({
  getServiceWidget: vi.fn(),
  httpProxy: vi.fn(),
}));

vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("widgets/widgets", () => ({
  default: {
    duplicati: { api: "{url}/api/v1/{endpoint}" },
  },
}));

import duplicatiProxyHandler, { buildSummary, login } from "./proxy";

describe("widgets/duplicati/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when widget config is missing", async () => {
    getServiceWidget.mockResolvedValue(null);

    const res = createMockRes();
    await duplicatiProxyHandler({ query: { group: "g", service: "s" } }, res);

    expect(res.statusCode).toBe(400);
  });

  it("logs in and aggregates duplicati data", async () => {
    getServiceWidget.mockResolvedValue({ type: "duplicati", url: "http://dup", password: "secret" });
    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ AccessToken: "token" }))])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify([
            {
              Backup: {
                ID: "1",
                Name: "Job One",
                Metadata: {
                  TargetFilesSize: "1024",
                  LastBackupFinished: "20260712T100000Z",
                  LastErrorDate: "20260712T090000Z",
                },
              },
              Schedule: { Time: "2026-07-13T11:00:00Z" },
            },
          ]),
        ),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ ActiveTask: null }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify([]))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ BackupID: null }))]);

    const res = createMockRes();
    await duplicatiProxyHandler({ query: { group: "g", service: "s" } }, res);

    expect(httpProxy).toHaveBeenCalledTimes(5);
    expect(httpProxy.mock.calls[0][0].toString()).toContain("/api/v1/auth/login");
    expect(httpProxy.mock.calls[1][0].toString()).toContain("/api/v1/backups");
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toBe(1);
    expect(res.body.stored).toBe(1024);
    expect(res.body.lastBackup).toBe("2026-07-12T10:00:00.000Z");
  });

  it("returns 500 when login fails", async () => {
    getServiceWidget.mockResolvedValue({ type: "duplicati", url: "http://dup", password: "secret" });
    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("{}")]);

    const res = createMockRes();
    await duplicatiProxyHandler({ query: { group: "g", service: "s" } }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toContain("Duplicati");
  });

  it("returns 500 when widget credentials are incomplete", async () => {
    getServiceWidget.mockResolvedValue({ type: "duplicati", url: "http://dup" });

    const res = createMockRes();
    await duplicatiProxyHandler({ query: { group: "g", service: "s" } }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Duplicati widget is missing required url and password");
  });

  it("fails login when the token is missing from the response", async () => {
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("{}")]);

    await expect(login({ type: "duplicati", url: "http://dup", password: 121284 })).rejects.toThrow("access token");

    expect(httpProxy.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        body: JSON.stringify({ Password: "121284", RememberMe: true }),
      }),
    );
  });

  it("summarizes backups, active tasks, and notifications", () => {
    const summary = buildSummary(
      [
        {
          Backup: {
            ID: "1",
            Name: "Running job",
            Metadata: { LastBackupFinished: "20260712T100000Z", TargetFilesSize: "1" },
          },
          Schedule: { Time: "2026-07-13T11:00:00Z" },
        },
        {
          Backup: {
            ID: "2",
            Name: "Warning job",
            Metadata: { LastBackupFinished: "20260712T100000Z", TargetFilesSize: "2" },
          },
          Schedule: { Time: "2026-07-13T12:00:00Z" },
        },
        {
          Backup: {
            ID: "3",
            Name: "Errored job",
            Metadata: {
              LastBackupFinished: "20260712T100000Z",
              LastErrorDate: "20260712T120000Z",
              LastErrorMessage: "Backend failed",
              TargetFilesSize: "3",
            },
          },
          Schedule: { Time: "2026-07-13T13:00:00Z" },
        },
        {
          Backup: { ID: "4", Name: "Idle job", Metadata: { TargetFilesSize: "4" } },
          Schedule: { Time: "2026-07-13T14:00:00Z" },
        },
      ],
      [
        { BackupID: "2", Type: "Warning" },
        { BackupID: "3", Type: "Error" },
      ],
      { ActiveTask: { Item1: 7 } },
      { BackupID: "1" },
    );

    expect(summary.jobs).toBe(4);
    expect(summary.stored).toBe(10);
    expect(summary.lastBackup).toBe("2026-07-12T10:00:00.000Z");
    expect(summary.nextRun).toBe("2026-07-13T11:00:00.000Z");
    expect(summary.running).toBe(1);
    expect(summary.warnings).toBe(1);
    expect(summary.errors).toBe(1);
  });

  it("handles empty and incomplete summary inputs", () => {
    const summary = buildSummary(
      [
        {
          Backup: {
            ID: "1",
            Name: "Errored job",
            Metadata: { LastBackupFinished: "20260712T100000Z", TargetFilesSize: "3" },
          },
          Schedule: { Time: "2026-07-13T13:00:00Z" },
        },
        {
          Backup: { ID: "2", Name: "No history", Metadata: {} },
          Schedule: {},
        },
      ],
      [
        {
          BackupID: "1",
          Type: "Error",
          Timestamp: "2026-07-12T12:00:00Z",
          Title: "Backend failed",
          Message: "Backend failed\nstack trace",
        },
        { Type: "Warning", Timestamp: "2026-07-12T12:00:00Z" },
      ],
      { ActiveTask: null },
      {},
    );

    expect(summary).toEqual({
      jobs: 2,
      stored: 3,
      lastBackup: "2026-07-12T10:00:00.000Z",
      nextRun: "2026-07-13T13:00:00.000Z",
      running: 0,
      warnings: 0,
      errors: 1,
    });

    expect(buildSummary([], [], { ActiveTask: null }, {})).toEqual({
      jobs: 0,
      stored: 0,
      lastBackup: null,
      nextRun: null,
      running: 0,
      warnings: 0,
      errors: 0,
    });
  });
});
