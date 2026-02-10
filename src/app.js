import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Health check (para Render / Vercel / profe)
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    project: "gestion-turnos-estetica"
  });
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/appointments", appointmentsRoutes);

export default app;