import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as appointmentsController from "../controllers/appointmentsController.js";

const router = Router();
router.use(authMiddleware);

router.get("/", appointmentsController.list);
router.get("/:id", appointmentsController.getById);
router.post("/", appointmentsController.create);
router.put("/:id", appointmentsController.update);
router.delete("/:id", appointmentsController.cancel); // cancelamos, no borramos

export default router;