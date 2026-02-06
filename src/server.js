import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clientsRoutes from "./routes/clientsRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, project: "gestion-turnos-estetica" });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/appointments", appointmentsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
