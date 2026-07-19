import { prisma } from "@/config/db";

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
