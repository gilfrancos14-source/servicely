import { Router } from "express";
import * as categoryController from "@/controllers/category";

const router = Router();

router.get("/", categoryController.listCategories);

export default router;
