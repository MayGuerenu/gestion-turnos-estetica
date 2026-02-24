// IMPORTS — TODOS ARRIBA
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import { adminOnly } from "./middlewares/adminOnly.js";
import authRoutes from "./routes/authRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";




dotenv.config();

// dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APP
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// Static files (UNA sola vez)
app.use(express.static(path.join(__dirname, "..", "public")));

// login
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// DASHBOARD
app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

// HEALTH
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    project: "gestion-turnos-estetica"
  });
});


// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/admin", authMiddleware, adminOnly, adminRoutes);
export default app;