import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const client = await prisma.user.upsert({
    where: { email: "client@test.com" },
    update: {},
    create: {
      email: "client@test.com",
      passwordHash: password,
      firstName: "Jean",
      lastName: "Client",
      role: "CLIENT",
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      passwordHash: password,
      firstName: "Admin",
      lastName: "Super",
      role: "ADMIN",
      isVerified: true,
    },
  });

  const providersData = [
    { email: "marie@test.com", firstName: "Marie", lastName: "Pro", title: "Experte Ménage", bio: "Professionnelle avec 10 ans d'expérience en nettoyage.", address: "Paris", rating: 4.8, reviewCount: 42, level: 3 },
    { email: "lucas@test.com", firstName: "Lucas", lastName: "Dupont", title: "Jardinier Paysagiste", bio: "Passionné par les espaces verts depuis 15 ans.", address: "Lyon", rating: 3.2, reviewCount: 18, level: 2 },
    { email: "sophie@test.com", firstName: "Sophie", lastName: "Martin", title: "Électricienne Confirmée", bio: "Artisan électricienne, interventions rapides et propres.", address: "Paris", rating: 4.9, reviewCount: 67, level: 4 },
    { email: "ahmed@test.com", firstName: "Ahmed", lastName: "Benali", title: "Plombier Expert", bio: "Dépannage plomberie et chauffage, 12 ans d'expérience.", address: "Marseille", rating: 2.5, reviewCount: 8, level: 1 },
  ];

  const providers: any[] = [];

  for (const p of providersData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: password,
        firstName: p.firstName,
        lastName: p.lastName,
        role: "PROVIDER",
        isVerified: true,
      },
    });

    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        title: p.title,
        bio: p.bio,
        level: p.level,
        address: p.address,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isActive: true,
      },
    });

    providers.push(provider);
  }

  const categories = [
    { name: "Ménage", slug: "menage", icon: "cleaning_services" },
    { name: "Jardinage", slug: "jardinage", icon: "yard" },
    { name: "Électricien", slug: "electricien", icon: "electric_bolt" },
    { name: "Plombier", slug: "plombier", icon: "plumbing" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const cats = await prisma.category.findMany();

  const menageCat = cats.find((c) => c.slug === "menage")!;
  const jardinCat = cats.find((c) => c.slug === "jardinage")!;
  const elecCat = cats.find((c) => c.slug === "electricien")!;
  const plomCat = cats.find((c) => c.slug === "plombier")!;

  const serviceDefs = [
    { provider: 0, cat: menageCat, items: [
      { name: "Nettoyage complet appartement", description: "Nettoyage en profondeur de votre appartement : sols, vitres, poussières, cuisine et salle de bain.", price: 25, duration: 120, unit: "h" },
      { name: "Nettoyage de vitres", description: "Vitres et baies vitrées impeccables, sans trace.", price: 35, duration: 60, unit: "h" },
      { name: "Ménage résidentiel hebdomadaire", description: "Entretien régulier de votre domicile, passage chaque semaine.", price: 22, duration: 90, unit: "h" },
    ]},
    { provider: 1, cat: jardinCat, items: [
      { name: "Tonte de pelouse", description: "Tonte de pelouse et finition bordures.", price: 30, duration: 60, unit: "h" },
      { name: "Taille de haies et arbustes", description: "Taille précise de vos haies et arbustes d'ornement.", price: 35, duration: 90, unit: "h" },
      { name: "Entretien jardin complet", description: "Désherbage, tonte, taille et nettoyage du jardin.", price: 40, duration: 120, unit: "h" },
    ]},
    { provider: 2, cat: elecCat, items: [
      { name: "Réparation électrique", description: "Diagnostic et réparation de vos installations électriques.", price: 45, duration: 60, unit: "h" },
      { name: "Installation luminaires", description: "Pose de luminaires, appliques et spots.", price: 40, duration: 60, unit: "h" },
      { name: "Mise aux normes tableau électrique", description: "Mise en conformité de votre tableau électrique.", price: 60, duration: 120, unit: "h" },
    ]},
    { provider: 3, cat: plomCat, items: [
      { name: "Dépannage plomberie urgent", description: "Intervention rapide pour fuite, bouchon ou panne.", price: 50, duration: 60, unit: "h" },
      { name: "Installation robinetterie", description: "Pose de robinets, mitigeurs et receveurs.", price: 45, duration: 90, unit: "h" },
      { name: "Débouchage canalisations", description: "Débouchage mécanique ou chimique de vos canalisations.", price: 55, duration: 60, unit: "h" },
    ]},
  ];

  for (const def of serviceDefs) {
    for (const svc of def.items) {
      const existing = await prisma.service.findFirst({ where: { name: svc.name, providerId: providers[def.provider].id } });
      if (!existing) {
        await prisma.service.create({
          data: {
            ...svc,
            categoryId: def.cat.id,
            providerId: providers[def.provider].id,
            isActive: true,
          },
        });
      }
    }
  }

  const allServices = await prisma.service.findMany({ include: { provider: true } });
  const now = new Date();

  function offsetDays(days: number) {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function makeSlot(base: Date, hours: number, minutes: number, duration: number) {
    const start = new Date(base);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);
    return { start, end };
  }

  let totalSlots = 0;
  const bookedSlotIds: string[] = [];

  for (const svc of allServices) {
    for (const dayOffset of [1, 3, 6]) {
      for (const [h, m] of [[9, 0], [14, 0]]) {
        const { start, end } = makeSlot(offsetDays(dayOffset), h, m, svc.duration);
        const ts = await prisma.timeSlot.create({
          data: {
            providerId: svc.providerId,
            serviceId: svc.id,
            startTime: start,
            endTime: end,
            isBooked: true,
          },
        });
        bookedSlotIds.push(ts.id);
        totalSlots++;
      }
    }
  }

  const marieProvider = providers[0];
  const sophieProvider = providers[2];
  const marieService = allServices.find((s) => s.providerId === marieProvider.id && s.name === "Nettoyage complet appartement")!;
  const sophieService = allServices.find((s) => s.providerId === sophieProvider.id && s.name === "Réparation électrique")!;

  async function makeBooking(
    service: typeof marieService,
    provider: typeof marieProvider,
    dayOffset: number,
    hours: number,
    minutes: number,
    status: "COMPLETED" | "CONFIRMED",
    paymentStatus: "PAID" | "PENDING",
    notes?: string
  ) {
    const { start, end } = makeSlot(offsetDays(dayOffset), hours, minutes, service.duration);
    const ts = await prisma.timeSlot.create({
      data: {
        providerId: provider.id,
        serviceId: service.id,
        startTime: start,
        endTime: end,
        isBooked: true,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        providerId: provider.id,
        serviceId: service.id,
        timeSlotId: ts.id,
        totalPrice: service.price,
        status,
        paymentStatus,
        notes,
      },
    });

    await prisma.timeSlot.update({
      where: { id: ts.id },
      data: { bookingId: booking.id },
    });

    return booking;
  }

  const sophieUser = await prisma.user.findUnique({ where: { email: "sophie@test.com" } })!;

  const pastBooking = await makeBooking(marieService, marieProvider, -7, 9, 0, "COMPLETED", "PAID", "Ménage complet avant la visite des beaux-parents. Très content du service !");

  await prisma.payment.create({
    data: {
      bookingId: pastBooking.id,
      amount: pastBooking.totalPrice,
      currency: "EUR",
      paypalOrderId: `PAST-${Date.now()}`,
      paypalCaptureId: `CAPTURE-${Date.now()}`,
      status: "PAID",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: pastBooking.id,
      clientId: client.id,
      rating: 5,
      comment: "Service exceptionnel ! Marie est très professionnelle et ponctuelle. Mon appartement n'a jamais été aussi propre. Je recommande vivement !",
    },
  });

  const platformFee = Number(pastBooking.totalPrice) * 0.05;
  await prisma.earning.create({
    data: {
      providerId: marieProvider.id,
      bookingId: pastBooking.id,
      amount: pastBooking.totalPrice,
      platformFee,
      netAmount: Number(pastBooking.totalPrice) - platformFee,
      status: "AVAILABLE",
      paidAt: new Date(),
    },
  });

  const futureBooking = await makeBooking(sophieService, sophieProvider, 3, 10, 0, "CONFIRMED", "PENDING", "Prise RDV pour réparation prise électrique salon.");

  await prisma.notification.create({
    data: {
      userId: sophieProvider.userId,
      type: "BOOKING_CONFIRMED",
      title: "Nouvelle réservation confirmée",
      message: `Votre rendez-vous avec ${client.firstName} ${client.lastName} pour ${sophieService.name} est confirmé.`,
      data: { bookingId: futureBooking.id },
    },
  });

  await prisma.notification.create({
    data: {
      userId: client.id,
      type: "BOOKING_CONFIRMED",
      title: "Réservation confirmée",
      message: `Votre rendez-vous avec ${sophieUser!.firstName} pour ${sophieService.name} est confirmé.`,
      data: { bookingId: futureBooking.id },
    },
  });

  console.log("✅ Seed completed");
  console.log(`   Client   → client@test.com / password123`);
  console.log(`   Marie    → marie@test.com / password123 (4.8⭐ - Ménage)`);
  console.log(`   Lucas    → lucas@test.com / password123 (3.2⭐ - Jardinage)`);
  console.log(`   Sophie   → sophie@test.com / password123 (4.9⭐ - Électricien)`);
  console.log(`   Ahmed    → ahmed@test.com / password123 (2.5⭐ - Plombier)`);
  console.log(`   Admin    → admin@test.com / password123`);
  console.log(`   📅 ${totalSlots} créneaux réservés (indisponibles dans le calendrier)`);
  console.log(`   📋 1 réservation passée (complétée, payée, notée)`);
  console.log(`   📋 1 réservation future (confirmée, notification envoyée)`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
