import * as authService from "../services/authService.js";

export async function register(req, res) {
  const result = await authService.register(req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.status(201).json(result.user);
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json({ token: result.token, user: result.user });
}

export async function logout(_req, res) {
  // JWT stateless: logout en el cliente (borrar token)
  res.json({ ok: true });
}
