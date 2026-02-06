import { z } from "zod";
import { supabase } from "../config/supabaseClient.js";

const createSchema = z.object({
  client_id: z.string().uuid(),
  service: z.enum(["Uñas", "Cejas", "Pestañas"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_min: z.number().int().positive(),
  price: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable()
});

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function hasOverlap(userId, date, startTime, durationMin, excludeId = null) {
  const start = toMinutes(startTime);
  const end = start + durationMin;

  const { data, error } = await supabase
    .from("appointments")
    .select("id,time,duration_min,status")
    .eq("user_id", userId)
    .eq("date", date)
    .in("status", ["pendiente", "confirmado"]);

  if (error) throw new Error(error.message);

  return data.some(a => {
    if (excludeId && a.id === excludeId) return false;
    const aStart = toMinutes(a.time.slice(0,5));
    const aEnd = aStart + a.duration_min;
    return start < aEnd && end > aStart; // solapamiento real
  });
}

export async function listAppointments(userId, query) {
  const q = supabase.from("appointments").select("*, clients(name,phone)").eq("user_id", userId);

  if (query.date) q.eq("date", query.date);
  if (query.status) q.eq("status", query.status);

  const { data, error } = await q.order("date", { ascending: true }).order("time", { ascending: true });

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 200, data };
}

export async function getAppointment(userId, id) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  if (!data) return { ok: false, status: 404, message: "Turno no encontrado" };
  return { ok: true, status: 200, data };
}

export async function createAppointment(userId, payload) {
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, status: 400, message: "Datos inválidos" };

  try {
    const overlap = await hasOverlap(
      userId,
      parsed.data.date,
      parsed.data.time,
      parsed.data.duration_min
    );
    if (overlap) return { ok: false, status: 409, message: "Horario ocupado" };
  } catch (e) {
    return { ok: false, status: 500, message: e.message };
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      user_id: userId,
      client_id: parsed.data.client_id,
      service: parsed.data.service,
      date: parsed.data.date,
      time: parsed.data.time,
      duration_min: parsed.data.duration_min,
      price: parsed.data.price ?? 0,
      status: "pendiente",
      notes: parsed.data.notes ?? null
    })
    .select()
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 201, data };
}

export async function updateAppointment(userId, id, payload) {
  const parsed = createSchema.partial().safeParse(payload);
  if (!parsed.success) return { ok: false, status: 400, message: "Datos inválidos" };

  // Traemos el turno actual para calcular overlap con valores finales
  const { data: current, error: e1 } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (e1) return { ok: false, status: 500, message: e1.message };
  if (!current) return { ok: false, status: 404, message: "Turno no encontrado" };

  const finalDate = parsed.data.date ?? current.date;
  const finalTime = parsed.data.time ?? current.time.slice(0,5);
  const finalDuration = parsed.data.duration_min ?? current.duration_min;

  try {
    const overlap = await hasOverlap(userId, finalDate, finalTime, finalDuration, id);
    if (overlap) return { ok: false, status: 409, message: "Horario ocupado" };
  } catch (e) {
    return { ok: false, status: 500, message: e.message };
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({
      client_id: parsed.data.client_id ?? current.client_id,
      service: parsed.data.service ?? current.service,
      date: finalDate,
      time: finalTime,
      duration_min: finalDuration,
      price: parsed.data.price ?? current.price,
      notes: parsed.data.notes ?? current.notes
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 200, data };
}

export async function cancelAppointment(userId, id) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelado" })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  if (!data) return { ok: false, status: 404, message: "Turno no encontrado" };
  return { ok: true, status: 200, data };
}
