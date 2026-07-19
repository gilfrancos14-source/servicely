import { Router } from "express";
import * as reviewController from "@/controllers/review";

const router = Router();

router.get("/services/:serviceId/reviews", reviewController.getServiceReviews);

export default router;
