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
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ...
app.use(express.static(path.join(__dirname, "..", "public")));

// Home → servir el login 
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Dashboard 
app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, ping: true, ts: Date.now() });
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/appointments", appointmentsRoutes);

export default app;