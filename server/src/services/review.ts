import { prisma } from "@/config/db";

export function getServiceReviews(serviceId: string) {
  return prisma.review.findMany({
    where: { booking: { serviceId } },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
