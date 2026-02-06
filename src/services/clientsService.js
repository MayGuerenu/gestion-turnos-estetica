import { z } from "zod";
import { supabase } from "../config/supabaseClient.js";

const clientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export async function listClients(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 200, data };
}

export async function createClient(userId, payload) {
  const parsed = clientSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, status: 400, message: "Datos inválidos" };

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      notes: parsed.data.notes ?? null
    })
    .select()
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 201, data };
}

export async function updateClient(userId, clientId, payload) {
  const parsed = clientSchema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false, status: 400, message: "Datos inválidos" };

  // Solo puede tocar registros propios
  const { data, error } = await supabase
    .from("clients")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      notes: parsed.data.notes
    })
    .eq("id", clientId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  if (!data) return { ok: false, status: 404, message: "Cliente no encontrado" };

  return { ok: true, status: 200, data };
}

export async function deleteClient(userId, clientId) {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", userId);

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 200 };
}
