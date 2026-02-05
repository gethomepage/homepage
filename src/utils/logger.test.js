import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { state, winston, checkAndCopyConfig, getSettings } = vi.hoisted(() => {
  const state = {
    created: [],
    lastCreateLoggerArgs: null,
  };

  function ConsoleTransport(opts) {
    this.opts = opts;
  }
  function FileTransport(opts) {
    this.opts = opts;
  }

  const createLogger = vi.fn((args) => {
    state.lastCreateLoggerArgs = args;

    const base = {
      child: vi.fn(() => base),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    state.created.push(base);
    return base;
  });

  const winston = {
    transports: { Console: ConsoleTransport, File: FileTransport },
    format: {
      combine: (...parts) => ({ parts }),
      errors: () => ({}),
      timestamp: () => ({}),
      colorize: () => ({}),
      printf: (fn) => fn,
    },
    createLogger,
  };

  return {
    state,
    winston,
    checkAndCopyConfig: vi.fn(),
    getSettings: vi.fn(() => ({ logpath: "/tmp" })),
  };
});

vi.mock("winston", () => ({ default: winston, ...winston }));

vi.mock("utils/config/config", () => ({
  default: checkAndCopyConfig,
  CONF_DIR: "/conf",
  getSettings,
}));

describe("utils/logger", () => {
  const originalEnv = process.env;
  const originalConsole = { ...console };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore patched console methods if init() ran.
    Object.assign(console, originalConsole);
  });

  it("initializes winston on first createLogger() and caches per label", async () => {
    vi.resetModules();
    process.env.LOG_TARGETS = "stdout";

    const createLogger = (await import("./logger")).default;

    const a1 = createLogger("a");
    const a2 = createLogger("a");
    const b = createLogger("b");

    expect(checkAndCopyConfig).toHaveBeenCalledWith("settings.yaml");
    expect(winston.createLogger).toHaveBeenCalled();
    expect(a1).toBe(a2);
    expect(b).toBeDefined();
  });

  it("selects stdout/file/both transports based on LOG_TARGETS", async () => {
    vi.resetModules();
    process.env.LOG_TARGETS = "file";

    const createLogger = (await import("./logger")).default;
    createLogger("x");

    const transports = state.lastCreateLoggerArgs.transports;
    expect(transports).toHaveLength(1);
    expect(transports[0].opts.filename).toBe("/tmp/logs/homepage.log");
  });

  it("defaults to both transports for unknown LOG_TARGETS and patches console methods", async () => {
    vi.resetModules();
    process.env.LOG_TARGETS = "wat";

    const createLogger = (await import("./logger")).default;
    const instance = createLogger("x");

    const transports = state.lastCreateLoggerArgs.transports;
    expect(transports).toHaveLength(2);

    console.log("hello");
    expect(instance.info).toHaveBeenCalledWith("hello");
  });

  it("uses CONF_DIR as the default logpath when settings.logpath is not set", async () => {
    vi.resetModules();
    process.env.LOG_TARGETS = "file";
    getSettings.mockReturnValueOnce({});

    const createLogger = (await import("./logger")).default;
    createLogger("x");

    const transports = state.lastCreateLoggerArgs.transports;
    expect(transports[0].opts.filename).toBe("/conf/logs/homepage.log");
  });

  it("formats messages and stacks through the printf formatter", async () => {
    vi.resetModules();
    process.env.LOG_TARGETS = "stdout";
    process.env.LOG_LEVEL = "debug";

    const createLogger = (await import("./logger")).default;
    createLogger("x");

    expect(state.lastCreateLoggerArgs.level).toBe("debug");

    const [consoleTransport] = state.lastCreateLoggerArgs.transports;
    const parts = consoleTransport.opts.format.parts;
    const formatter = parts.find((p) => typeof p === "function");
    const splat = parts.find((p) => p && typeof p.transform === "function");

    const msg = formatter({
      timestamp: "t",
      level: "info",
      label: "x",
      message: "hello",
    });
    expect(msg).toBe("[t] info: <x> hello");

    const labelStackMsg = formatter({
      timestamp: "t",
      level: "error",
      label: "x",
      stack: "STACK",
      message: "ignored",
    });
    expect(labelStackMsg).toBe("[t] error: <x> STACK");

    const stackMsg = formatter({
      timestamp: "t",
      level: "error",
      stack: "STACK",
      message: "ignored",
    });
    expect(stackMsg).toBe("[t] error: STACK");

    const plainMsg = formatter({
      timestamp: "t",
      level: "info",
      message: "hello",
    });
    expect(plainMsg).toBe("[t] info: hello");

    const out = splat.transform(
      {
        message: "Hello %s",
        [Symbol.for("splat")]: ["World"],
      },
      {},
    );
    expect(out.message).toBe("Hello World");
  });
});
