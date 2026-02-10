const API_BASE = "";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (_netErr) {
    throw new Error("No se pudo conectar con el servidor (error de red).");
  }

  // Intentar leer JSON; si no, leer texto (HTML/empty/etc)
  const rawText = await res.text();
  let data = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { message: rawText }; // por si vino HTML o texto
  }

  if (!res.ok) {
    const detail = data?.message || data?.error || rawText || res.statusText;
    throw new Error(`Error ${res.status}: ${detail}`);
  }

  return data;
}