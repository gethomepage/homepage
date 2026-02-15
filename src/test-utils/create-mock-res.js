import { vi } from "vitest";

export default function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
  };

  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = vi.fn((body) => {
    res.body = body;
    return res;
  });

  res.send = vi.fn((body) => {
    res.body = body;
    return res;
  });

  res.end = vi.fn((body) => {
    res.body = body;
    return res;
  });

  res.setHeader = vi.fn((key, value) => {
    res.headers[key] = value;
    return res;
  });

  return res;
}
