import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

function encodeLine(line) {
  const buf = Buffer.alloc(2 + line.length);
  buf.writeUInt16BE(line.length, 0);
  buf.write(line, 2, "ascii");
  return buf;
}

const { getServiceWidget, logger } = vi.hoisted(() => ({
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn(), error: vi.fn() },
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("node:net", () => {
  class FakeSocket {
    constructor() {
      this._handlers = new Map();
    }
    setTimeout() {}
    connect() {
      queueMicrotask(() => this._emit("connect"));
    }
    on(event, cb) {
      const set = this._handlers.get(event) ?? new Set();
      set.add(cb);
      this._handlers.set(event, set);
    }
    write() {
      const response = Buffer.concat([
        encodeLine("STATUS : ONLINE"),
        encodeLine("LOADPCT : 10.0"),
        encodeLine("BCHARGE : 99.0"),
        encodeLine("TIMELEFT : 12.3"),
        encodeLine("END APC"),
        Buffer.from([0x00, 0x00]),
      ]);
      queueMicrotask(() => this._emit("data", response));
    }
    end() {}
    destroy() {}
    _emit(event, payload) {
      const set = this._handlers.get(event);
      if (!set) return;
      set.forEach((cb) => cb(payload));
    }
  }

  return {
    default: {
      Socket: FakeSocket,
    },
  };
});

import apcupsProxyHandler from "./proxy";

describe("widgets/apcups/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses the APCUPSD status response into JSON", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://127.0.0.1:3551" });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await apcupsProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "ONLINE",
      load: "10.0",
      bcharge: "99.0",
      timeleft: "12.3",
    });
  });
});
