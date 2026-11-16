
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem("sharkrypto_admin_token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : options.body
        ? { "Content-Type": "application/json" }
        : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        `Request failed (${response.status})`
    );
  }

  return result;
}

export const authApi = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/auth/me"),
};

export const postsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return request(`/posts${query ? `?${query}` : ""}`);
  },

  get: (id) =>
    request(`/posts/${encodeURIComponent(id)}`),

  create: (data) =>
    request("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/posts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/posts/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

export const categoriesApi = {
  list: () => request("/categories"),

  create: (data) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/categories/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

export const mediaApi = {
  upload: (file) => {
    const formData = new FormData();

    // This field name must match upload.array("files") in media.js.
    formData.append("files", file);

    return request("/media", {
      method: "POST",
      body: formData,
    });
  },
};

export const settingsApi = {
  get: () => request('/settings'),

  update: (data) =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};


export default request;
