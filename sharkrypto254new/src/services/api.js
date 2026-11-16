
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || `Request failed (${response.status})`
    );
  }

  return result;
}

export const postsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return request(`/posts${query ? `?${query}` : ""}`);
  },

  get: (slug) => request(`/posts/${encodeURIComponent(slug)}`),
};

export const categoriesApi = {
  list: () => request("/categories"),

  get: (slug) => request(`/categories/${encodeURIComponent(slug)}`),
};

export const settingsApi = {
  get: () => request('/settings')
};


export default request;
