import * as adminService from "../services/adminService.js";

export async function dashboard(req, res) {
  const result = await adminService.dashboard(req.user.id);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function listBlockedDays(req, res) {
  const result = await adminService.listBlockedDays();
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function createBlockedDay(req, res) {
  const result = await adminService.createBlockedDay(req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.status(201).json(result.data);
}

export async function deleteBlockedDay(req, res) {
  const result = await adminService.deleteBlockedDay(req.params.id);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json({ ok: true });
}

export async function reportSummary(req, res) {
  const result = await adminService.reportSummary(req.query);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function reportServices(req, res) {
  const result = await adminService.reportServices(req.query);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}