/**
 * ClipBridge Frontend API Client
 */

const API_BASE = "/api";

async function request(url, options = {}) {
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Network and LAN discovery
  getNetworkInfo: () => request("/network/info"),

  // Items and real-time feed
  getRecentItems: (limit = 50) => request(`/items/recent?limit=${limit}`),
  
  shareText: ({ text, deviceName, deviceId, accessKey }) => {
    const headers = {};
    if (accessKey) headers["x-access-key"] = accessKey;
    return request("/items/text", {
      method: "POST",
      headers,
      body: JSON.stringify({ text, deviceName, deviceId }),
    });
  },

  uploadFiles: (formData, accessKey) => {
    const headers = {};
    if (accessKey) headers["x-access-key"] = accessKey;
    return request("/items/upload", {
      method: "POST",
      headers,
      body: formData,
    });
  },

  deleteItem: (id, accessKey) => {
    const headers = {};
    if (accessKey) headers["x-access-key"] = accessKey;
    return request(`/items/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // Permission-gated historical access
  verifyAccessKey: (key) =>
    request("/history/verify", {
      method: "POST",
      body: JSON.stringify({ key }),
    }),

  getHistory: ({ page = 1, limit = 20, type = "all", search = "", accessKey }) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      type,
    });
    if (search) params.append("search", search);

    return request(`/history?${params.toString()}`, {
      headers: { "x-access-key": accessKey },
    });
  },

  getHistoryStats: (accessKey) =>
    request("/history/stats", {
      headers: { "x-access-key": accessKey },
    }),

  // Server Owner / Key Manager
  getKeys: (adminKey) =>
    request("/keys", {
      headers: { "x-access-key": adminKey },
    }),

  createKey: (keyData, adminKey) =>
    request("/keys", {
      method: "POST",
      headers: { "x-access-key": adminKey },
      body: JSON.stringify(keyData),
    }),

  toggleKey: (id, isActive, adminKey) =>
    request(`/keys/${id}`, {
      method: "PATCH",
      headers: { "x-access-key": adminKey },
      body: JSON.stringify({ isActive }),
    }),

  deleteKey: (id, adminKey) =>
    request(`/keys/${id}`, {
      method: "DELETE",
      headers: { "x-access-key": adminKey },
    }),
};
