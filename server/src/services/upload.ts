import { prisma } from "@/config/db";

export function updateUserAvatar(userId: string, url: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
  });
}

export function updateServiceImage(serviceId: string, providerId: string, url: string) {
  return prisma.service.updateMany({
    where: { id: serviceId, providerId },
    data: { imageUrl: url },
  });
}
