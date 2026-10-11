import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { detectFileType, UPLOAD_DIRECTORY } from "../src/middleware/upload.js";

describe("Upload Middleware & File Detection", () => {
  test("UPLOAD_DIRECTORY should be a resolved string path", () => {
    assert.equal(typeof UPLOAD_DIRECTORY, "string");
    assert.ok(UPLOAD_DIRECTORY.length > 0);
  });

  test("detectFileType correctly categorizes MIME types", () => {
    // Images
    assert.equal(detectFileType("image/png"), "image");
    assert.equal(detectFileType("image/jpeg"), "image");
    assert.equal(detectFileType("image/gif"), "image");
    assert.equal(detectFileType("image/webp"), "image");

    // Videos
    assert.equal(detectFileType("video/mp4"), "video");
    assert.equal(detectFileType("video/webm"), "video");
    assert.equal(detectFileType("video/quicktime"), "video");

    // Audio
    assert.equal(detectFileType("audio/mpeg"), "audio");
    assert.equal(detectFileType("audio/ogg"), "audio");
    assert.equal(detectFileType("audio/wav"), "audio");

    // Documents
    assert.equal(detectFileType("application/pdf"), "document");
    assert.equal(detectFileType("application/msword"), "document");
    assert.equal(detectFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"), "document");
    assert.equal(detectFileType("text/plain"), "document");
    assert.equal(detectFileType("application/json"), "document");
    assert.equal(detectFileType("text/csv"), "document");
    assert.equal(detectFileType("application/zip"), "document");
    assert.equal(detectFileType("application/x-tar"), "document");

    // Fallbacks
    assert.equal(detectFileType(""), "other");
    assert.equal(detectFileType(null), "other");
    assert.equal(detectFileType(undefined), "other");
    assert.equal(detectFileType("application/octet-stream"), "other");
  });
});
