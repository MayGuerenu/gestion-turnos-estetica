import * as appointmentsService from "../services/appointmentsService.js";

export async function list(req, res) {
  const result = await appointmentsService.listAppointments(req.user.id, req.query);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function getById(req, res) {
  const result = await appointmentsService.getAppointment(req.user.id, req.params.id);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function create(req, res) {
  const result = await appointmentsService.createAppointment(req.user.id, req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.status(201).json(result.data);
}

export async function update(req, res) {
  const result = await appointmentsService.updateAppointment(req.user.id, req.params.id, req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function cancel(req, res) {
  const result = await appointmentsService.cancelAppointment(req.user.id, req.params.id);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}
