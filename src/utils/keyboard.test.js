import { describe, expect, it } from "vitest";
import { parseKeyboardShortcut, matchesKeyboardShortcut } from "./keyboard";

describe("utils/keyboard", () => {
  describe("parseKeyboardShortcut", () => {
    it("parses default ctrl+k shortcut", () => {
      const result = parseKeyboardShortcut("ctrl+k");
      expect(result.key).toBe("k");
      expect(result.modifiers.ctrl).toBe(true);
      expect(result.modifiers.meta).toBe(false);
      expect(result.modifiers.alt).toBe(false);
      expect(result.modifiers.shift).toBe(false);
    });

    it("defaults to ctrl+k when no shortcut provided", () => {
      const result = parseKeyboardShortcut();
      expect(result.key).toBe("k");
      expect(result.modifiers.ctrl).toBe(true);
    });

    it("parses alt/option modifier", () => {
      const result1 = parseKeyboardShortcut("alt+k");
      expect(result1.key).toBe("k");
      expect(result1.modifiers.alt).toBe(true);
      expect(result1.modifiers.ctrl).toBe(false);

      const result2 = parseKeyboardShortcut("option+k");
      expect(result2.key).toBe("k");
      expect(result2.modifiers.alt).toBe(true);
    });

    it("parses meta/cmd modifier", () => {
      const result1 = parseKeyboardShortcut("meta+p");
      expect(result1.key).toBe("p");
      expect(result1.modifiers.meta).toBe(true);

      const result2 = parseKeyboardShortcut("cmd+p");
      expect(result2.key).toBe("p");
      expect(result2.modifiers.meta).toBe(true);
    });

    it("parses multiple modifiers", () => {
      const result = parseKeyboardShortcut("ctrl+shift+p");
      expect(result.key).toBe("p");
      expect(result.modifiers.ctrl).toBe(true);
      expect(result.modifiers.shift).toBe(true);
      expect(result.modifiers.alt).toBe(false);
      expect(result.modifiers.meta).toBe(false);
    });

    it("handles case insensitivity", () => {
      const result = parseKeyboardShortcut("CTRL+SHIFT+K");
      expect(result.key).toBe("k");
      expect(result.modifiers.ctrl).toBe(true);
      expect(result.modifiers.shift).toBe(true);
    });

    it("parses single key without modifiers", () => {
      const result = parseKeyboardShortcut("k");
      expect(result.key).toBe("k");
      expect(result.modifiers.ctrl).toBe(false);
      expect(result.modifiers.meta).toBe(false);
      expect(result.modifiers.alt).toBe(false);
      expect(result.modifiers.shift).toBe(false);
    });
  });

  describe("matchesKeyboardShortcut", () => {
    it("matches ctrl+k with ctrlKey pressed", () => {
      const config = parseKeyboardShortcut("ctrl+k");
      const event = { key: "k", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(true);
    });

    it("matches meta+k with metaKey pressed", () => {
      const config = parseKeyboardShortcut("meta+k");
      const event = { key: "k", ctrlKey: false, metaKey: true, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(true);
    });

    it("matches alt+k with altKey pressed", () => {
      const config = parseKeyboardShortcut("alt+k");
      const event = { key: "k", ctrlKey: false, metaKey: false, altKey: true, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(true);
    });

    it("matches multiple modifiers", () => {
      const config = parseKeyboardShortcut("ctrl+shift+k");
      const event = { key: "k", ctrlKey: true, metaKey: false, altKey: false, shiftKey: true };
      expect(matchesKeyboardShortcut(event, config)).toBe(true);
    });

    it("does not match when key is different", () => {
      const config = parseKeyboardShortcut("ctrl+k");
      const event = { key: "p", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(false);
    });

    it("does not match when modifier is missing", () => {
      const config = parseKeyboardShortcut("ctrl+shift+k");
      const event = { key: "k", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(false);
    });

    it("does not match when extra modifier is pressed", () => {
      const config = parseKeyboardShortcut("ctrl+k");
      const event = { key: "k", ctrlKey: true, metaKey: false, altKey: true, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(false);
    });

    it("handles case insensitive key matching", () => {
      const config = parseKeyboardShortcut("ctrl+k");
      const event = { key: "K", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(event, config)).toBe(true);
    });

    it("defaults to ctrl or meta when no modifiers specified", () => {
      const config = parseKeyboardShortcut("k");
      
      const ctrlEvent = { key: "k", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(ctrlEvent, config)).toBe(true);
      
      const metaEvent = { key: "k", ctrlKey: false, metaKey: true, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(metaEvent, config)).toBe(true);
      
      const noModEvent = { key: "k", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(noModEvent, config)).toBe(false);
    });

    it("allows ctrl or meta interchangeably when ctrl specified", () => {
      const config = parseKeyboardShortcut("ctrl+k");
      
      const metaEvent = { key: "k", ctrlKey: false, metaKey: true, altKey: false, shiftKey: false };
      expect(matchesKeyboardShortcut(metaEvent, config)).toBe(true);
    });
  });
});
