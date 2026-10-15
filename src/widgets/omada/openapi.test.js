import cache from "memory-cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
}));

vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/logger", () => ({ default: () => ({ error: vi.fn(), debug: vi.fn() }) }));

import omadaProxyHandler from "./proxy";

const widget = {
  url: "https://omada.example/",
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  site: "Home",
};
const stats = { connectedAp: 1, activeUser: 58, alerts: 0, connectedGateways: 1, connectedSwitches: 4 };
const overview = { connectedApNum: 1, totalClientNum: 58, connectedGatewayNum: 1, connectedSwitchNum: 4 };
const success = (result) => [200, "application/json", Buffer.from(JSON.stringify({ errorCode: 0, result }))];
const failure = (errorCode, status = 200) => [
  status,
  "application/json",
  Buffer.from(
    JSON.stringify({
      errorCode,
      msg: "private-upstream-details",
      result: null,
    }),
  ),
];

describe("widgets/omada Open API authentication", () => {
  let state;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    vi.clearAllMocks();
    cache.clear();
    state = {
      authCalls: 0,
      overviewFailures: [],
      tokenResponse: null,
      overview: { ...overview },
      pageTwo: false,
      missingSite: false,
    };
    getServiceWidget.mockResolvedValue({ ...widget });
    httpProxy.mockImplementation(async (address, options = {}) => {
      const url = new URL(address);
      if (url.pathname === "/api/info") return success({ omadacId: "cid", controllerVer: "6.3.0.108" });
      if (url.pathname === "/openapi/authorize/token") {
        state.authCalls += 1;
        return (
          state.tokenResponse ||
          success({ accessToken: `AT-${state.authCalls}`, expiresIn: 7200, refreshToken: "private-refresh-token" })
        );
      }
      expect(options.headers.Authorization).toBe(`AccessToken=AT-${state.authCalls}`);
      expect(options.body).toBeUndefined();
      if (url.pathname.endsWith("/sites")) {
        const firstPage = url.searchParams.get("page") === "1";
        return success({
          totalRows: state.pageTwo ? 101 : 1,
          data:
            state.missingSite || (state.pageTwo && firstPage)
              ? [{ name: "Other site", siteId: "other-site" }]
              : [{ name: "Home", siteId: "site" }],
        });
      }
      if (url.pathname.endsWith("/dashboard/overview-diagram")) {
        return state.overviewFailures.shift() || success(state.overview);
      }
      if (url.pathname.endsWith("/logs/alerts")) {
        expect(url.searchParams.get("filters.timeStart")).toBe("0");
        expect(url.searchParams.get("filters.timeEnd")).toBe(String(Date.now()));
        expect(url.searchParams.get("filters.resolved")).toBe("false");
        expect(url.searchParams.get("pageSize")).toBe("10");
        return success({ totalRows: 0, alertLogStat: { totalLogNum: 29, resolvedLogNum: 29, unResolvedLogNum: 0 } });
      }
      throw new Error(`Unexpected request: ${url.pathname}`);
    });
  });

  afterEach(() => {
    cache.clear();
    vi.useRealTimers();
  });

  async function poll() {
    const res = createMockRes();
    await omadaProxyHandler({ query: { group: "Network", service: "Omada", index: "0" } }, res);
    return res;
  }

  it("uses client credentials and maps the documented Omada 6.3 statistics", async () => {
    const res = await poll();
    expect(JSON.parse(res.body)).toEqual(stats);
    expect(httpProxy).toHaveBeenCalledWith(
      "https://omada.example/openapi/authorize/token?grant_type=client_credentials",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ omadacId: "cid", client_id: widget.clientId, client_secret: widget.clientSecret }),
      },
    );
    expect(httpProxy.mock.calls.some(([url]) => url.includes("/api/v2/login"))).toBe(false);
    expect(
      httpProxy.mock.calls.some(([url]) => url.includes("/openapi/v1/cid/sites/site/dashboard/overview-diagram")),
    ).toBe(true);
    expect(httpProxy).toHaveBeenCalledTimes(5);
  });

  it("shares authentication and a five-second statistics cache between concurrent polls", async () => {
    const responses = await Promise.all(Array.from({ length: 10 }, poll));
    responses.forEach((res) => expect(JSON.parse(res.body)).toEqual(stats));
    await poll();
    expect(httpProxy).toHaveBeenCalledTimes(5);
    await vi.advanceTimersByTimeAsync(5001);
    await poll();
    expect(httpProxy).toHaveBeenCalledTimes(7);
    expect(state.authCalls).toBe(1);
  });

  it("renews the access token before the controller's two-hour expiration", async () => {
    await poll();
    await vi.advanceTimersByTimeAsync(7140001);
    expect(JSON.parse((await poll()).body)).toEqual(stats);
    expect(state.authCalls).toBe(2);
  });

  it.each([-44112, -44113])("re-authenticates once for token error %s", async (errorCode) => {
    state.overviewFailures.push(failure(errorCode));
    expect(JSON.parse((await poll()).body)).toEqual(stats);
    expect(state.authCalls).toBe(2);
  });

  it("re-authenticates once for HTTP 401 without an Omada error code", async () => {
    state.overviewFailures.push([401, "application/json", Buffer.from("{}")]);
    expect(JSON.parse((await poll()).body)).toEqual(stats);
    expect(state.authCalls).toBe(2);
  });

  it("limits token retries and permits recovery on a later poll", async () => {
    state.overviewFailures.push(failure(-44113), failure(-44113));
    const res = await poll();
    expect(res.statusCode).toBe(502);
    expect(res.body.error.message).toContain("-44113");
    expect(state.authCalls).toBe(2);
    expect(JSON.parse((await poll()).body)).toEqual(stats);
  });

  it("returns permission errors without repeatedly authenticating or serving stale statistics", async () => {
    await poll();
    await vi.advanceTimersByTimeAsync(5001);
    state.overviewFailures.push(failure(-1505, 403));
    const res = await poll();
    expect(res.statusCode).toBe(403);
    expect(res.body.error.message).toContain("-1505");
    expect(state.authCalls).toBe(1);
  });

  it("does not return credentials, access tokens, refresh tokens or upstream bodies on authentication failure", async () => {
    state.tokenResponse = [
      200,
      "application/json",
      Buffer.from(
        JSON.stringify({
          errorCode: -44106,
          msg: widget.clientSecret,
          result: { accessToken: "private-access-token", refreshToken: "private-refresh-token" },
        }),
      ),
    ];
    const res = await poll();
    expect(res.statusCode).toBe(502);
    expect(res.body.error.message).toContain("-44106");
    expect(JSON.stringify(res.body)).not.toMatch(/test-client-secret|private-access-token|private-refresh-token/);
  });

  it.each([
    [200, "text/html", Buffer.from("<!doctype html>private-upstream-details")],
    [200, "application/json", Buffer.from("null")],
    success({ accessToken: "token-without-expiry" }),
  ])("returns a structured error for malformed token responses %#", async (...response) => {
    state.tokenResponse = response;
    const res = await poll();
    expect(res.statusCode).toBe(502);
    expect(res.body.error.message).toMatch(/Omada Open API/);
    expect(JSON.stringify(res.body)).not.toMatch(/private-upstream-details|token-without-expiry/);
  });

  it("does not reuse a token after credential rotation", async () => {
    await poll();
    getServiceWidget.mockResolvedValue({ ...widget, clientSecret: "rotated-secret" });
    expect(JSON.parse((await poll()).body)).toEqual(stats);
    expect(state.authCalls).toBe(2);
  });

  it("does not reuse statistics for another controller", async () => {
    await poll();
    getServiceWidget.mockResolvedValue({ ...widget, url: "https://other.example" });
    await poll();
    expect(state.authCalls).toBe(2);
    expect(httpProxy.mock.calls.some(([url]) => url.startsWith("https://other.example/openapi/authorize/token"))).toBe(
      true,
    );
  });

  it("accepts an explicit controller ID without calling /api/info", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, omadacId: "explicit-id" });
    expect(JSON.parse((await poll()).body)).toEqual(stats);
    expect(httpProxy.mock.calls.some(([url]) => url.endsWith("/api/info"))).toBe(false);
    expect(JSON.parse(httpProxy.mock.calls[0][1].body).omadacId).toBe("explicit-id");
  });

  it("selects the configured site by name across paginated results", async () => {
    state.pageTwo = true;
    expect(JSON.parse((await poll()).body)).toEqual(stats);
    expect(
      httpProxy.mock.calls
        .filter(([url]) => url.includes("/sites?page="))
        .map(([url]) => new URL(url).searchParams.get("page")),
    ).toEqual(["1", "2"]);
  });

  it("reports a missing site instead of querying a different site", async () => {
    state.missingSite = true;
    const res = await poll();
    expect(res.body.error.message).toMatch(/site was not found/);
    expect(httpProxy).toHaveBeenCalledTimes(3);
  });

  it("does not silently display zero when an upstream metric is missing", async () => {
    delete state.overview.connectedApNum;
    expect((await poll()).body.error.message).toMatch(/invalid AP count/);
  });

  it.each(["clientId", "clientSecret", "site"])(
    "rejects a missing %s without attempting account login",
    async (key) => {
      getServiceWidget.mockResolvedValue({ ...widget, [key]: "", username: "u", password: "p" });
      const res = await poll();
      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/requires/);
      expect(httpProxy).not.toHaveBeenCalled();
    },
  );
});
