import * as clientsService from "../services/clientsService.js";

export async function list(req, res) {
  const result = await clientsService.listClients(req.user.id);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function create(req, res) {
  const result = await clientsService.createClient(req.user.id, req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.status(201).json(result.data);
}

export async function update(req, res) {
  const result = await clientsService.updateClient(req.user.id, req.params.id, req.body);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json(result.data);
}

export async function remove(req, res) {
  const result = await clientsService.deleteClient(req.user.id, req.params.id);
  if (!result.ok) return res.status(result.status).json({ message: result.message });
  res.json({ ok: true });
}
