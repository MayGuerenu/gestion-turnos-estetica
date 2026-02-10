export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    project: "gestion-turnos-estetica",
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET
  });
}
