import { Router } from "express";
import * as serviceController from "@/controllers/service";

const router = Router();

router.get("/", serviceController.listServices);
router.get("/:id", serviceController.getService);

export default router;
