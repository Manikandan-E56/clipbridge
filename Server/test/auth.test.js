import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { extractKeyFromRequest } from "../src/middleware/auth.js";

describe("Auth Middleware & Key Extraction", () => {
  test("extractKeyFromRequest extracts key from x-access-key header", () => {
    const req = {
      headers: {
        "x-access-key": "CB-TESTKEY123",
      },
    };
    const key = extractKeyFromRequest(req);
    assert.equal(key, "CB-TESTKEY123");
  });

  test("extractKeyFromRequest extracts key from Authorization Bearer header", () => {
    const req = {
      headers: {
        authorization: "Bearer CB-BEARER456",
      },
    };
    const key = extractKeyFromRequest(req);
    assert.equal(key, "CB-BEARER456");
  });

  test("extractKeyFromRequest extracts key from query parameters", () => {
    const req = {
      headers: {},
      query: {
        accessKey: "CB-QUERY789",
      },
    };
    const key = extractKeyFromRequest(req);
    assert.equal(key, "CB-QUERY789");
  });

  test("extractKeyFromRequest returns null when no key is provided", () => {
    const req = {
      headers: {},
      query: {},
    };
    const key = extractKeyFromRequest(req);
    assert.equal(key, null);
  });
});
