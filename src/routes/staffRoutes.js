import { Router } from "express";
import { supabase } from "../config/supabaseClient.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// lista para el select del front
router.get("/", authMiddleware, async (_req, res) => {
  const { data, error } = await supabase
    .from("staff")
    .select("id,name,active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

export default router;