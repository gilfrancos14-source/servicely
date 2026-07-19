import type { Request, Response, NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/config/db";

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      location,
      minRating,
      sort,
      page: pageStr,
      limit: limitStr,
    } = req.query as Record<string, string | undefined>;

    const page = Math.max(1, Number(pageStr) || 1);
    const limit = Math.min(50, Math.max(1, Number(limitStr) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) {
      const ids = categoryId.split(",").filter(Boolean);
      if (ids.length === 1) {
        where.categoryId = ids[0];
      } else if (ids.length > 1) {
        where.categoryId = { in: ids };
      }
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (minRating) {
      where.provider = { rating: { gte: Number(minRating) } };
    }
    if (location) {
      where.provider = {
        ...(where.provider as Record<string, unknown>),
        address: { contains: location, mode: "insensitive" },
      };
    }

    let orderBy: Prisma.ServiceOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { provider: { rating: "desc" } };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: true,
          provider: {
            include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: services,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        },
      },
    });
    if (!service || !service.isActive) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Service introuvable" } });
      return;
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}
