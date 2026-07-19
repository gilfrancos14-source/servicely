import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db";

export async function getServiceReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceId = req.params.serviceId as string;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Service introuvable" } });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { booking: { serviceId } },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
}
