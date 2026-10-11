import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getLocalNetworkAddresses,
  getPrimaryLanIp,
  getNetworkInfo,
} from "../src/utils/network.js";

describe("Network Utilities", () => {
  test("getLocalNetworkAddresses returns an array of non-internal IPv4 interfaces", () => {
    const addresses = getLocalNetworkAddresses();
    assert.ok(Array.isArray(addresses), "Should return an array");

    for (const item of addresses) {
      assert.ok(item.interface, "Each item must have an interface name");
      assert.ok(item.address, "Each item must have an IP address");
      assert.notEqual(item.address, "127.0.0.1", "Should not include loopback addresses");
      assert.match(
        item.address,
        /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
        "Must be a valid IPv4 address"
      );
    }
  });

  test("getPrimaryLanIp returns a valid IPv4 string or fallback 127.0.0.1", () => {
    const ip = getPrimaryLanIp();
    assert.equal(typeof ip, "string");
    assert.match(
      ip,
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
      "Must be a valid IPv4 string"
    );
  });

  test("getNetworkInfo returns complete network diagnostic object", () => {
    const serverPort = 5000;
    const clientPort = 5173;
    const info = getNetworkInfo(serverPort, clientPort);

    assert.ok(info.hostname, "Hostname should be defined");
    assert.equal(typeof info.primaryIp, "string");
    assert.equal(info.serverPort, serverPort);
    assert.equal(info.clientPort, clientPort);
    assert.equal(info.serverUrl, `http://${info.primaryIp}:${serverPort}`);
    assert.equal(info.clientUrl, `http://${info.primaryIp}:${clientPort}`);
    assert.ok(Array.isArray(info.availableInterfaces));
  });
});
