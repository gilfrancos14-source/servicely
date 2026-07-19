import type { Prisma } from "@prisma/client";
import { prisma } from "@/config/db";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/utils/constants";

export function listServices(query: Record<string, string | undefined>) {
  const {
    search, categoryId, minPrice, maxPrice, location, minRating, sort,
    page: pageStr, limit: limitStr,
  } = query;

  const page = Math.max(1, Number(pageStr) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limitStr) || DEFAULT_PAGE_SIZE));
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
  if (minRating && location) {
    where.provider = { is: { rating: { gte: Number(minRating) }, address: { contains: location, mode: "insensitive" } } };
  } else if (minRating) {
    where.provider = { is: { rating: { gte: Number(minRating) } } };
  } else if (location) {
    where.provider = { is: { address: { contains: location, mode: "insensitive" } } };
  }

  let orderBy: Prisma.ServiceOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { provider: { rating: "desc" } };

  return Promise.all([
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
}

export function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      },
    },
  });
}
