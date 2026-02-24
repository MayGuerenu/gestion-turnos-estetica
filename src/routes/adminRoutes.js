import { Router } from "express";
import * as adminController from "../controllers/adminController.js";

const router = Router();

// Panel admin 
router.get("/dashboard", adminController.dashboard);

// Días bloqueados 
router.get("/blocked-days", adminController.listBlockedDays);
router.post("/blocked-days", adminController.createBlockedDay);
router.delete("/blocked-days/:id", adminController.deleteBlockedDay);

// Reportes básicos
router.get("/reports/summary", adminController.reportSummary);
router.get("/reports/services", adminController.reportServices);

export default router;