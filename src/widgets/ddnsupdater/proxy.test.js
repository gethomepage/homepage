import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/config/service-helpers", () => ({ 
  default: getServiceWidget, 
}));

import ddnsupdaterProxyHandler from "./proxy";

describe("widgets/ddnsupdater/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses domain data from the HTML response", async () => {
    getServiceWidget.mockResolvedValue({ 
      type: "ddnsupdater", 
      url: "http://example.test", 
      domain: "nvim.duckdns.org", 
    });

    const html = `
      <html>
        <body>
          <table>
            <tbody>
              <tr>
                <td>nvim.duckdns.org</td>
                <td>@</td>
                <td>DuckDNS</td>
                <td>ipv4</td>
                <td>Success, 12h34m56s ago</td>
                <td>42.84.13.12</td>
                <td>99.8.77.6, 4.5.3.7, and 1 more</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    httpProxy.mockResolvedValueOnce([200, "text/html", html]);

    const req = {
      method: "GET",
      query: {
        group: "g",
        service: "svc",
        index: "0",
      },
    };

    const res = createMockRes();

    await ddnsupdaterProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);

    expect(res.statusCode).toBe(200);

    expect(res.body).toEqual(
      {
        domain: "nvim.duckdns.org",
        owner: "@",
        provider: "DuckDNS",
        ipVersion: "ipv4",
        status: "Success",
        timeSinceLastUpdate: "12h34m56s",
        currentIP: "42.84.13.12",
        previousIP: "99.8.77.6",
      },
    );
  });

  it("parses multiple domains", async () => {
    getServiceWidget.mockResolvedValue({ 
      type: "ddnsupdater", 
      url: "http://example.test", 
      domain: "gnu.duckdns.org", 
    });

    const html = `
      <table>
        <tbody>
          <tr>
            <td>gnu.duckdns.org</td>
            <td>@</td>
            <td>DuckDNS</td>
            <td>ipv4</td>
            <td>Success, 1h0m0s ago</td>
            <td>1.2.3.4</td>
            <td>1.2.3.3</td>
          </tr>
          <tr>
            <td>second.example.com</td>
            <td>@</td>
            <td>Cloudflare</td>
            <td>ipv4</td>
            <td>Success, 2h30m0s ago</td>
            <td>5.6.7.8</td>
            <td>5.6.7.7</td>
          </tr>
        </tbody>
      </table>
    `;

    httpProxy.mockResolvedValueOnce([200, "text/html", html]);

    const req = {
      method: "GET",
      query: {
        group: "g",
        service: "svc",
        index: "0",
      },
    };

    const res = createMockRes();

    await ddnsupdaterProxyHandler(req, res);

    expect(res.body).toMatchObject({
      domain: "gnu.duckdns.org",
      currentIP: "1.2.3.4",
      timeSinceLastUpdate: "1h0m0s",
    });
  });

  it("returns an empty array when there are no domains. Unexpected error.", async () => {
    getServiceWidget.mockResolvedValue({ 
      type: "ddnsupdater", 
      url: "http://example.test", 
      domain: "gnu.duckdns.org", 
    });

    const html = `
      <table>
        <tbody>
        </tbody>
      </table>
    `;

    httpProxy.mockResolvedValueOnce([200, "text/html", html]);

    const req = {
      method: "GET",
      query: {
        group: "g",
        service: "svc",
        index: "0",
      },
    };

    const res = createMockRes();

    await ddnsupdaterProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
  });
});

