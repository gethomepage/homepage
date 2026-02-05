import crypto from "crypto";
import { describe, expect, it, vi } from "vitest";

import { createEncryptionToken, decrypt, encrypt, sha256, uniqueRid, validateRid } from "./tools";

describe("widgets/jdownloader/tools", () => {
  it("sha256 returns a 32-byte buffer", () => {
    expect(sha256("hello")).toBeInstanceOf(Buffer);
    expect(sha256("hello")).toHaveLength(32);
  });

  it("uniqueRid returns an integer", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.123);
    expect(uniqueRid()).toBeTypeOf("number");
    expect(Number.isInteger(uniqueRid())).toBe(true);
    Math.random.mockRestore();
  });

  it("validateRid throws when mismatched", () => {
    expect(() => validateRid({ rid: 1 }, 2)).toThrow(/RequestID mismatch/i);
    expect(validateRid({ rid: 5 }, 5)).toEqual({ rid: 5 });
  });

  it("encrypt/decrypt roundtrip with a 32-byte ivKey", () => {
    const ivKey = crypto.randomBytes(32);
    const plaintext = "secret";
    const encrypted = encrypt(plaintext, ivKey);
    const decrypted = decrypt(encrypted, ivKey);
    expect(decrypted).toBe(plaintext);
  });

  it("createEncryptionToken merges buffers and hashes", () => {
    const oldToken = Buffer.from("aa", "hex");
    const updateToken = "bb";
    const token = createEncryptionToken(oldToken, updateToken);
    expect(token).toBeInstanceOf(Buffer);
    expect(token).toHaveLength(32);
  });
});
