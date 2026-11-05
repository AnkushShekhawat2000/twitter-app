const BASE_URL = process.env.REACT_APP_BASE_URL;

export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    const error = new Error("Please login to perform this action.");
    error.status = 401;
    throw error;
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", "Bearer " + token);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const error = new Error("Session expired. Please login again.");
    error.status = 401;
    throw error;
  }

  return response;
}
