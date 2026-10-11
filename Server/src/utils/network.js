import os from "node:os";

/**
 * Returns available local IPv4 network addresses (Wi-Fi / Ethernet).
 */
export function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const [name, netInterface] of Object.entries(interfaces)) {
    if (!netInterface) continue;

    for (const net of netInterface) {
      // Look for IPv4 addresses that are not loopback (127.0.0.1)
      if (net.family === "IPv4" && !net.internal) {
        addresses.push({
          interface: name,
          address: net.address,
          netmask: net.netmask,
        });
      }
    }
  }

  return addresses;
}

/**
 * Picks the primary local LAN IP address, preferring Wi-Fi or Ethernet.
 */
export function getPrimaryLanIp() {
  const addresses = getLocalNetworkAddresses();
  if (addresses.length === 0) {
    return "127.0.0.1";
  }

  // Prefer Wi-Fi or WLAN if named, otherwise take the first non-internal IPv4
  const wifiOrEthernet = addresses.find((a) =>
    /wi-fi|wlan|eth|en0|ethernet/i.test(a.interface)
  );

  return wifiOrEthernet ? wifiOrEthernet.address : addresses[0].address;
}

/**
 * Helper to build network diagnostics and connection URLs.
 */
export function getNetworkInfo(serverPort = 5000, clientPort = 5173) {
  const primaryIp = getPrimaryLanIp();
  const allAddresses = getLocalNetworkAddresses();

  return {
    hostname: os.hostname(),
    primaryIp,
    serverPort: Number(serverPort),
    clientPort: Number(clientPort),
    serverUrl: `http://${primaryIp}:${serverPort}`,
    clientUrl: `http://${primaryIp}:${clientPort}`,
    availableInterfaces: allAddresses,
  };
}
