import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as clientsController from "../controllers/clientsController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", clientsController.list);
router.post("/", clientsController.create);
router.put("/:id", clientsController.update);
router.delete("/:id", clientsController.remove);

export default router;
