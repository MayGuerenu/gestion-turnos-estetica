import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { supabase } from "../config/supabaseClient.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function register({ email, password }) {
  const parsed = schema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Datos inválidos" };
  }

  const { data: existing } = await supabase
    .from("users_app")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { ok: false, status: 409, message: "Email ya registrado" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users_app")
    .insert({ email, password_hash: passwordHash })
    .select()
    .single();

  if (error) {
    return { ok: false, status: 500, message: error.message };
  }

  return { ok: true, status: 201, user: { id: data.id, email: data.email } };
}

export async function login({ email, password }) {
  const parsed = schema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Datos inválidos" };
  }

  const { data: user } = await supabase
    .from("users_app")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return { ok: false, status: 401, message: "Credenciales inválidas" };
  }

  const okPass = await bcrypt.compare(password, user.password_hash);
  if (!okPass) {
    return { ok: false, status: 401, message: "Credenciales inválidas" };
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return { ok: true, status: 200, token, user: { id: user.id, email: user.email } };
}
