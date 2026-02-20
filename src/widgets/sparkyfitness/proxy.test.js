import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetServiceWidget = vi.fn();
const mockHttpProxy = vi.fn();
const mockValidateWidgetData = vi.fn();

vi.mock("utils/config/service-helpers", () => ({ default: mockGetServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy: mockHttpProxy }));
vi.mock("utils/proxy/validate-widget-data", () => ({ default: mockValidateWidgetData }));
vi.mock("widgets/widgets", () => ({
  default: {
    sparkyfitness: {
      api: "{url}/{endpoint}",
      mappings: {
        stats: { endpoint: "api/dashboard/stats" },
      },
    },
  },
}));

// Import after mocks are set up
const { default: sparkyfitnessProxyHandler } = await import("./proxy");

function makeReq(overrides = {}) {
  return {
    query: {
      group: "Fitness",
      service: "Sparky Fitness",
      endpoint: "api/dashboard/stats",
      index: 0,
      ...overrides,
    },
    method: "GET",
  };
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    end: vi.fn(),
  };
  return res;
}

describe("sparkyfitness proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateWidgetData.mockReturnValue(true);
  });

  it("returns 400 if group or service is missing", async () => {
    const req = makeReq({ group: undefined });
    const res = makeRes();
    await sparkyfitnessProxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 403 if widget type has no api", async () => {
    mockGetServiceWidget.mockResolvedValue({ type: "unknown_type" });
    const req = makeReq();
    const res = makeRes();
    await sparkyfitnessProxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("constructs the correct URL and passes x-api-key header", async () => {
    const widgetConfig = {
      type: "sparkyfitness",
      url: "http://localhost:3010",
      key: "test-api-key-123",
    };
    mockGetServiceWidget.mockResolvedValue(widgetConfig);
    mockHttpProxy.mockResolvedValue([200, "application/json", { eaten: 1500 }]);

    const req = makeReq({ endpoint: "api/dashboard/stats" });
    const res = makeRes();

    await sparkyfitnessProxyHandler(req, res);

    const [calledUrl, calledParams] = mockHttpProxy.mock.calls[0];
    expect(calledUrl.toString()).toContain("http://localhost:3010/api/dashboard/stats");
    expect(calledParams.headers["x-api-key"]).toBe("test-api-key-123");
  });

  it("returns response data on success", async () => {
    const widgetConfig = {
      type: "sparkyfitness",
      url: "http://localhost:3010",
      key: "test-api-key-123",
    };
    const responseData = { eaten: 1500, burned: 300, remaining: 700, steps: 8000 };
    mockGetServiceWidget.mockResolvedValue(widgetConfig);
    mockHttpProxy.mockResolvedValue([200, "application/json", responseData]);

    const req = makeReq({ endpoint: "api/dashboard/stats" });
    const res = makeRes();

    await sparkyfitnessProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(responseData);
  });

  it("returns error details on upstream HTTP error", async () => {
    const widgetConfig = {
      type: "sparkyfitness",
      url: "http://localhost:3010",
      key: "test-api-key-123",
    };
    mockGetServiceWidget.mockResolvedValue(widgetConfig);
    mockHttpProxy.mockResolvedValue([401, "application/json", { message: "Unauthorized" }]);

    const req = makeReq({ endpoint: "api/dashboard/stats" });
    const res = makeRes();

    await sparkyfitnessProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: "HTTP Error" }) }),
    );
  });

  it("returns 500 if validateWidgetData fails", async () => {
    const widgetConfig = {
      type: "sparkyfitness",
      url: "http://localhost:3010",
      key: "test-api-key-123",
    };
    mockGetServiceWidget.mockResolvedValue(widgetConfig);
    mockHttpProxy.mockResolvedValue([200, "application/json", { unexpected: "data" }]);
    mockValidateWidgetData.mockReturnValue(false);

    const req = makeReq({ endpoint: "api/dashboard/stats" });
    const res = makeRes();

    await sparkyfitnessProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
