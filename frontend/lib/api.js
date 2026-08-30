const TOKEN_KEY = "visionai_token";
const USER_KEY = "visionai_user";

export function saveSession(token, user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function request(path, { method = "GET", body, auth = true, form = false } = {}) {
  const headers = {};
  if (!form) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),

  login: (email, password, role) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    if (role) form.append("role", role);
    return request("/auth/login", { method: "POST", body: form, auth: false, form: true });
  },

  me: () => request("/users/me"),

  startSession: (testType = "acuity") => request("/vision-tests/sessions", { method: "POST", body: { test_type: testType } }),
  getSession: (id) => request(`/vision-tests/sessions/${id}`),
  updateReliability: (id, payload) =>
    request(`/vision-tests/sessions/${id}/reliability`, {
      method: "POST",
      body: payload,
    }),
  submitResult: (id, payload) =>
    request(`/vision-tests/sessions/${id}/results`, { method: "POST", body: payload }),
  completeSession: (id, symptoms) => request(`/vision-tests/sessions/${id}/complete`, { method: "POST", body: { symptoms } }),

  myConsultations: () => request("/consultations/mine"),
  consultationQueue: () => request("/consultations/queue"),
  consultationDetail: (id) => request(`/consultations/${id}/detail`),
  claimConsultation: (id) => request(`/consultations/${id}/claim`, { method: "POST" }),
  reviewConsultation: (id, payload) =>
    request(`/consultations/${id}/review`, { method: "POST", body: payload }),
};
