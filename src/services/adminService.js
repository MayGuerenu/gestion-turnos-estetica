import { supabase } from "../config/supabaseClient.js";
import { z } from "zod";

const blockedSchema = z.object({
  date: z.string().min(8), // YYYY-MM-DD
  reason: z.string().min(2).optional().nullable()
});

function parseRange({ from, to }) {
  // defaults “suaves”: si no mandan query, devuelve último mes
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const pad2 = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  return { from: iso(fromDate), to: iso(toDate) };
}

export async function dashboard(_adminUserId) {
  // resumen simple: total usuarios, clientes, turnos y próximos 5 turnos
  const [{ count: usersCount, error: usersErr }, { count: clientsCount, error: clientsErr }, { count: apptsCount, error: apptsErr }] =
    await Promise.all([
      supabase.from("users_app").select("id", { count: "exact", head: true }),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("appointments").select("id", { count: "exact", head: true })
    ]);

  if (usersErr || clientsErr || apptsErr) {
    return { ok: false, status: 500, message: (usersErr || clientsErr || apptsErr).message };
  }

  const { data: nextAppointments, error: nextErr } = await supabase
    .from("appointments")
    .select("id, service, date, time, status, price, user_id, client_id, created_at")
    .neq("status", "cancelado")
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(5);

  if (nextErr) return { ok: false, status: 500, message: nextErr.message };

  return {
    ok: true,
    status: 200,
    data: {
      usersCount: usersCount ?? 0,
      clientsCount: clientsCount ?? 0,
      appointmentsCount: apptsCount ?? 0,
      nextAppointments: nextAppointments ?? []
    }
  };
}

export async function listBlockedDays() {
  const { data, error } = await supabase
    .from("blocked_days")
    .select("*")
    .order("date", { ascending: true });

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 200, data };
}

export async function createBlockedDay(payload) {
  const parsed = blockedSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, status: 400, message: "Datos inválidos" };

  const { date, reason } = parsed.data;

  // evita duplicado por fecha (si agregás unique en DB, mejor)
  const { data: exists } = await supabase
    .from("blocked_days")
    .select("id")
    .eq("date", date)
    .maybeSingle();

  if (exists) return { ok: false, status: 409, message: "Ese día ya está bloqueado" };

  const { data, error } = await supabase
    .from("blocked_days")
    .insert({ date, reason: reason ?? null })
    .select()
    .single();

  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 201, data };
}

export async function deleteBlockedDay(id) {
  const { error } = await supabase.from("blocked_days").delete().eq("id", id);
  if (error) return { ok: false, status: 500, message: error.message };
  return { ok: true, status: 200 };
}

export async function reportSummary(query) {
  const { from, to } = parseRange(query);

  const { data, error } = await supabase
    .from("appointments")
    .select("status, date")
    .gte("date", from)
    .lte("date", to);

  if (error) return { ok: false, status: 500, message: error.message };

  const counts = { pendiente: 0, confirmado: 0, cancelado: 0, total: 0 };
  for (const a of data ?? []) {
    counts.total++;
    if (counts[a.status] !== undefined) counts[a.status]++;
  }

  return {
    ok: true,
    status: 200,
    data: { range: { from, to }, ...counts }
  };
}

export async function reportServices(query) {
  const { from, to } = parseRange(query);

  const { data, error } = await supabase
    .from("appointments")
    .select("service, date")
    .gte("date", from)
    .lte("date", to)
    .neq("status", "cancelado");

  if (error) return { ok: false, status: 500, message: error.message };

  const map = {};
  for (const a of data ?? []) {
    map[a.service] = (map[a.service] || 0) + 1;
  }

  const result = Object.entries(map)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  return { ok: true, status: 200, data: { range: { from, to }, items: result } };
}