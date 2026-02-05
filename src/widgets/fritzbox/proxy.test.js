import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, xml2json, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  xml2json: vi.fn((xml) => {
    const xmlString = Buffer.isBuffer(xml) ? xml.toString() : xml;
    if (xmlString === "GetStatusInfo") {
      return JSON.stringify({
        elements: [
          {
            elements: [
              {
                elements: [
                  {
                    elements: [
                      { name: "NewConnectionStatus", elements: [{ text: "Connected" }] },
                      { name: "NewUptime", elements: [{ text: "42" }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    }
    return JSON.stringify({ elements: [] });
  }),
  logger: { debug: vi.fn() },
}));

vi.mock("xml-js", () => ({
  xml2json,
}));
vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

import fritzboxProxyHandler from "./proxy";

describe("widgets/fritzbox/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries the configured fields and returns derived data", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://fritz.box",
      fields: ["connectionStatus", "uptime"],
    });

    httpProxy.mockResolvedValueOnce([200, "text/xml", Buffer.from("GetStatusInfo")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await fritzboxProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        connectionStatus: "Connected",
        uptime: "42",
      }),
    );
  });
});
