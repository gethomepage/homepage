import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

// --- hoisted mocks ---

const { mockSend, getServiceWidget, logger } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: { error: vi.fn(), debug: vi.fn() },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("@aws-sdk/client-cost-explorer", () => ({
  CostExplorerClient: vi.fn().mockImplementation(() => ({ send: mockSend })),
  GetCostAndUsageCommand: vi.fn().mockImplementation((params) => params),
}));

// Import after mocks are registered
import awsCostExplorerProxyHandler from "./proxy";

// ---

const MOCK_WIDGET = {
  type: "awscostexplorer",
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  region: "us-east-1",
};

const MOCK_AWS_RESPONSE = {
  ResultsByTime: [
    {
      Total: {
        UnblendedCost: {
          Amount: "142.50",
          Unit: "USD",
        },
      },
    },
  ],
};

function makeReq() {
  return { query: { group: "Cloud", service: "AWS Costs", index: "0" } };
}

describe("widgets/awscostexplorer/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns amount and unit on success", async () => {
    getServiceWidget.mockResolvedValue(MOCK_WIDGET);
    mockSend.mockResolvedValue(MOCK_AWS_RESPONSE);

    const req = makeReq();
    const res = createMockRes();

    await awsCostExplorerProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ amount: "142.50", unit: "USD" });
  });

  it("returns 400 when accessKeyId is missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "awscostexplorer", secretAccessKey: "secret" });

    const req = makeReq();
    const res = createMockRes();

    await awsCostExplorerProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/credentials/i);
  });

  it("returns 400 when widget is not found", async () => {
    getServiceWidget.mockResolvedValue(null);

    const req = makeReq();
    const res = createMockRes();

    await awsCostExplorerProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid proxy service type");
  });

  it("returns 400 when secretAccessKey is missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "awscostexplorer", accessKeyId: "AKIAIOSFODNN7EXAMPLE" });

    const req = makeReq();
    const res = createMockRes();

    await awsCostExplorerProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/credentials/i);
  });

  it("returns 500 when the AWS SDK throws", async () => {
    getServiceWidget.mockResolvedValue(MOCK_WIDGET);
    mockSend.mockRejectedValue(new Error("AccessDeniedException"));

    const req = makeReq();
    const res = createMockRes();

    await awsCostExplorerProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("AccessDeniedException");
  });
});
