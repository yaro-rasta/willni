/**
 * Auth utility for willni — nan0web platform
 *
 * Centralized token management and API calls.
 * All Vue components delegate to this module.
 */
import { ref, readonly } from "vue";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3333";

// ─── Reactive State ─────────────────────────────────────────────────
const isAuthenticated = ref(false);
const currentUser = ref(null);
const accessToken = ref("");
const refreshToken = ref("");

// ─── Token Storage ──────────────────────────────────────────────────
const STORAGE_KEY = "willni_auth";

function persist() {
  const payload = {
    accessToken: accessToken.value,
    refreshToken: refreshToken.value,
    user: currentUser.value,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const data = JSON.parse(raw);
    if (data.accessToken && data.user) {
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken || "";
      currentUser.value = data.user;
      isAuthenticated.value = true;
      return true;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return false;
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  // Also remove legacy key
  localStorage.removeItem("superintellect_auth");
  accessToken.value = "";
  refreshToken.value = "";
  currentUser.value = null;
  isAuthenticated.value = false;
}

// ─── API Helpers ────────────────────────────────────────────────────

async function api(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };

  if (accessToken.value) {
    headers["Authorization"] = `Bearer ${accessToken.value}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, opts);
  } catch (networkErr) {
    const err = new Error(
      "Server is not responding. Check that the API server is running.",
    );
    err.status = 0;
    err.data = { error: "network" };
    throw err;
  }

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    const err = new Error(json.message || json.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

// ─── Auth Actions ───────────────────────────────────────────────────

/**
 * Step 1: Register a new user
 * POST /auth/signup
 */
async function signup({ username, email, password }) {
  return api("POST", "/auth/signup", { username, email, password });
}

/**
 * Step 2: Confirm registration with verification code
 * PUT /auth/signup/:username
 */
async function confirmSignup(username, code) {
  return api("PUT", `/auth/signup/${encodeURIComponent(username)}`, { code });
}

/**
 * Sign in and store tokens
 * POST /auth/signin/:username
 */
async function signin(username, password) {
  const data = await api(
    "POST",
    `/auth/signin/${encodeURIComponent(username)}`,
    { password },
  );

  accessToken.value = data.accessToken || data.access || "";
  refreshToken.value = data.refreshToken || data.refresh || "";

  // Fetch user data
  await fetchUser(username);
  persist();

  return data;
}

/**
 * Fetch user data with Bearer token
 * GET /auth/signin/:username
 */
async function fetchUser(username) {
  const data = await api("GET", `/auth/signin/${encodeURIComponent(username)}`);
  currentUser.value = data.user || data;
  isAuthenticated.value = true;
  return data;
}

/**
 * Refresh expired tokens
 * PUT /auth/refresh/:token
 */
async function refresh() {
  if (!refreshToken.value) {
    clearStorage();
    return false;
  }

  try {
    const data = await api(
      "PUT",
      `/auth/refresh/${encodeURIComponent(refreshToken.value)}`,
    );
    accessToken.value = data.accessToken || data.access || "";
    refreshToken.value =
      data.refreshToken || data.refresh || refreshToken.value;
    persist();
    return true;
  } catch {
    clearStorage();
    return false;
  }
}

/**
 * Sign out
 * DELETE /auth/signin/:username
 */
async function signout() {
  const username = currentUser.value?.username;
  if (username) {
    try {
      await api("DELETE", `/auth/signin/${encodeURIComponent(username)}`);
    } catch {
      // Ignore — clear local state anyway
    }
  }
  clearStorage();
}

/**
 * Forgot password — request reset
 * POST /auth/forgot/:username
 */
async function forgotPassword(username) {
  return api("POST", `/auth/forgot/${encodeURIComponent(username)}`);
}

/**
 * Forgot password — reset with code
 * PUT /auth/forgot/:username
 */
async function resetPassword(username, { code, password }) {
  return api("PUT", `/auth/forgot/${encodeURIComponent(username)}`, {
    code,
    password,
  });
}

/**
 * Initialize auth state from localStorage.
 * Tries to verify token, falls back to refresh.
 */
async function init() {
  if (!loadFromStorage()) return false;

  const username = currentUser.value?.username;
  if (!username) {
    clearStorage();
    return false;
  }

  try {
    await fetchUser(username);
    persist();
    return true;
  } catch (err) {
    if (err.status === 401) {
      return refresh();
    }
    clearStorage();
    return false;
  }
}

// ─── Export ──────────────────────────────────────────────────────────
export const auth = {
  // Reactive state (readonly for consumers)
  isAuthenticated: readonly(isAuthenticated),
  currentUser: readonly(currentUser),

  // Actions
  init,
  signup,
  confirmSignup,
  signin,
  fetchUser,
  refresh,
  signout,
  forgotPassword,
  resetPassword,
  clearStorage,
};
