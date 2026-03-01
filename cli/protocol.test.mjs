/**
 * Unit tests for cli/protocol.mjs — Registration & Moderation Protocol
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RegisterProtocol,
  DEFAULT_PROTOCOL,
  shouldAutoLogin,
  needsConfirmation,
  needsModeration,
  registrationStatusKey,
} from "./protocol.mjs";

describe("cli/protocol.mjs", () => {
  describe("DEFAULT_PROTOCOL", () => {
    it("defaults to auto register, no moderation", () => {
      assert.equal(DEFAULT_PROTOCOL.register, "auto");
      assert.equal(DEFAULT_PROTOCOL.moderate, false);
      assert.equal(DEFAULT_PROTOCOL.transport, undefined);
    });
  });

  describe("shouldAutoLogin", () => {
    it("true for auto + no moderation", () => {
      assert.ok(shouldAutoLogin({ register: "auto", moderate: false }));
    });

    it("false for auto + moderation", () => {
      assert.ok(!shouldAutoLogin({ register: "auto", moderate: true }));
    });

    it("false for confirm + no moderation", () => {
      assert.ok(!shouldAutoLogin({ register: "confirm", moderate: false }));
    });

    it("false for confirm + moderation", () => {
      assert.ok(!shouldAutoLogin({ register: "confirm", moderate: true }));
    });
  });

  describe("needsConfirmation", () => {
    it("true for confirm protocol", () => {
      assert.ok(needsConfirmation({ register: "confirm" }));
    });

    it("false for auto protocol", () => {
      assert.ok(!needsConfirmation({ register: "auto" }));
    });
  });

  describe("needsModeration", () => {
    it("true when moderate = true", () => {
      assert.ok(needsModeration({ moderate: true }));
    });

    it("false when moderate = false", () => {
      assert.ok(!needsModeration({ moderate: false }));
    });
  });

  describe("registrationStatusKey", () => {
    it("Active for auto + no moderation", () => {
      assert.equal(
        registrationStatusKey({ register: "auto", moderate: false }),
        "Active",
      );
    });

    it("Awaiting confirmation for confirm", () => {
      assert.equal(
        registrationStatusKey({ register: "confirm", moderate: false }),
        "Awaiting confirmation",
      );
    });

    it("Awaiting admin approval for moderation", () => {
      assert.equal(
        registrationStatusKey({ register: "auto", moderate: true }),
        "Awaiting admin approval",
      );
    });

    it("Both for confirm + moderation", () => {
      assert.equal(
        registrationStatusKey({ register: "confirm", moderate: true }),
        "Awaiting confirmation and admin approval",
      );
    });
  });

  describe("RegisterProtocol enum", () => {
    it("has AUTO and CONFIRM", () => {
      assert.equal(RegisterProtocol.AUTO, "auto");
      assert.equal(RegisterProtocol.CONFIRM, "confirm");
    });
  });
});
