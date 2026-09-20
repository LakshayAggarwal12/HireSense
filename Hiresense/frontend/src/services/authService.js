import api, { TOKEN_KEY } from "./api";

export async function register({ email, password, full_name }) {
  const { data } = await api.post("/api/auth/register", { email, password, full_name });
  return data; // { access_token, token_type, user }
}

export async function login({ email, password }) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
