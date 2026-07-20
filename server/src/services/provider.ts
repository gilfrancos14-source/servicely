import { prisma } from "@/config/db";
import type { Prisma } from "@prisma/client";

export function findProviderByUserId(userId: string) {
  return prisma.provider.findUnique({
    where: { userId },
    include: { user: true },
  });
}

export async function createProviderForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable");
  return prisma.provider.create({
    data: {
      userId,
      title: `Expert ${user.firstName}`,
      level: 1,
    },
    include: { user: true },
  });
}

export function findProviderBookings(
  providerId: string,
  options: { status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"; page: number; limit: number }
) {
  const where: Prisma.BookingWhereInput = { providerId };
  if (options.status) {
    where.status = options.status;
  }

  const skip = (options.page - 1) * options.limit;

  return Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        service: { select: { id: true, name: true, duration: true, imageUrl: true, price: true, unit: true } },
        timeSlot: { select: { id: true, startTime: true, endTime: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: options.limit,
    }),
    prisma.booking.count({ where }),
  ]);
}

export function updateBookingStatus(bookingId: string, providerId: string, status: "CONFIRMED" | "CANCELLED") {
  return prisma.booking.updateMany({
    where: { id: bookingId, providerId },
    data: {
      status,
      ...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
    },
  });
}

export function getProviderStats(providerId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Promise.all([
    prisma.booking.count({ where: { providerId, status: "PENDING" } }),
    prisma.booking.count({ where: { providerId, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { providerId, status: "COMPLETED" } }),
    prisma.booking.aggregate({
      where: { providerId, status: "COMPLETED", createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.count({ where: { providerId, createdAt: { gte: startOfDay } } }),
    prisma.provider.findUnique({ where: { id: providerId }, select: { rating: true, reviewCount: true } }),
  ]).then(([pending, confirmed, completed, monthlyRevenue, _todayBookings, provider]) => ({
    bookingsCount: pending + confirmed + completed,
    monthlyRevenue: Number(monthlyRevenue._sum.totalPrice ?? 0),
    averageRating: provider?.rating ?? 0,
    reviewCount: provider?.reviewCount ?? 0,
    revenueChange: 0,
  }));
}

export function updateProviderProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  phone?: string;
  address?: string;
  notificationSettings?: Record<string, boolean>;
  twoFactorEnabled?: boolean;
}) {
  const { phone, notificationSettings, twoFactorEnabled, firstName, lastName, ...providerData } = data;
  return prisma.$transaction(async (tx) => {
    if (phone !== undefined || notificationSettings !== undefined || twoFactorEnabled !== undefined || firstName !== undefined || lastName !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(phone !== undefined && { phone }),
          ...(notificationSettings !== undefined && { notificationSettings }),
          ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
        },
      });
    }
    const provider = await tx.provider.update({
      where: { userId },
      data: providerData,
      include: { user: true },
    });
    return provider;
  });
}

export function updatePaypalEmail(userId: string, email: string) {
  return prisma.provider.update({
    where: { userId },
    data: { paypalEmail: email },
  });
}

export function findProviderServices(providerId: string) {
  return prisma.service.findMany({
    where: { providerId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function createService(providerId: string, data: {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  unit?: string;
}) {
  return prisma.service.create({
    data: { ...data, providerId, isActive: true },
    include: { category: true },
  });
}

export function updateService(serviceId: string, providerId: string, data: {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  unit?: string;
  isActive?: boolean;
}) {
  return prisma.service.updateMany({
    where: { id: serviceId, providerId },
    data,
  });
}

export function findProviderEarnings(
  providerId: string,
  options: { page: number; limit: number }
) {
  const skip = (options.page - 1) * options.limit;
  return Promise.all([
    prisma.earning.findMany({
      where: { providerId },
      include: { booking: { include: { service: { select: { name: true } }, client: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: options.limit,
    }),
    prisma.earning.count({ where: { providerId } }),
  ]);
}

export function getDailyEarnings(providerId: string, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  return prisma.booking.findMany({
    where: {
      providerId,
      status: "COMPLETED",
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
    orderBy: { createdAt: "asc" },
  }).then((bookings) => {
    const daily: { date: string; amount: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0] ?? "";
      const dayBookings = bookings.filter(
        (b) => (b.createdAt.toISOString().split("T")[0] ?? "") === key
      );
      daily.push({
        date: key,
        amount: dayBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0),
      });
    }
    return daily;
  });
}

export function getWeeklyHours(providerId: string) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return prisma.booking.findMany({
    where: {
      providerId,
      status: "COMPLETED",
      timeSlot: { startTime: { gte: monday } },
    },
    include: { timeSlot: true, service: true },
  }).then((bookings) => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    return days.map((label, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dayBookings = bookings.filter((b) => {
        const bd = new Date(b.timeSlot.startTime);
        return bd.getDate() === d.getDate() && bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      const hours = dayBookings.reduce((sum, b) => sum + b.service.duration, 0) / 60;
      const isToday = i === ((now.getDay() + 6) % 7);
      return {
        day: label,
        hours: Math.round(hours * 10) / 10,
        isToday,
      };
    });
  });
}
