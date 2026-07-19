import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { prisma } from "./config/db";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth";
import providerRoutes from "./routes/provider";
import uploadRoutes from "./routes/upload";
import notificationRoutes from "./routes/notification";
import categoryRoutes from "./routes/category";
import serviceRoutes from "./routes/service";
import bookingRoutes from "./routes/booking";
import timeSlotRoutes from "./routes/timeSlot";
import reviewRoutes from "./routes/review";
import paymentRoutes from "./routes/payment";

const app = express();

["uploads/avatars", "uploads/services"].forEach((dir) => {
  const fullPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { code: "RATE_LIMIT", message: "Trop de requêtes, réessayez plus tard" } },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: "RATE_LIMIT", message: "Trop de tentatives, réessayez plus tard" } },
});

// Parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Logging
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      error: { code: "DB_ERROR", message: "Database connection failed" },
    });
  }
});

// Routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);

app.use("/api/time-slots", timeSlotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", reviewRoutes);
app.use("/api", paymentRoutes);

// Catch-all for unknown API routes (404 JSON)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Endpoint non trouvé" } });
  } else {
    next();
  }
});

// Production: serve client build + SPA fallback
if (env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));
  app.use((_req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function main() {
  try {
    console.log("📦 Running database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: path.join(__dirname, "..") });
    console.log("✅ Migrations applied");
  } catch {
    console.warn("⚠️ Migration failed, continuing anyway...");
  }

  await prisma.$connect();
  console.log("✅ Database connected");

  // Seed default data if empty
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    console.log("🌱 Seeding database...");
    const pw = await bcrypt.hash("password123", 12);

    // Users
    await prisma.user.create({ data: { email: "client@test.com", passwordHash: pw, firstName: "Jean", lastName: "Client", role: "CLIENT", isVerified: true } });
    await prisma.user.create({ data: { email: "admin@test.com", passwordHash: pw, firstName: "Admin", lastName: "Super", role: "ADMIN", isVerified: true } });

    const marie = await prisma.user.create({ data: { email: "marie@test.com", passwordHash: pw, firstName: "Marie", lastName: "Pro", role: "PROVIDER", isVerified: true } });
    const lucas = await prisma.user.create({ data: { email: "lucas@test.com", passwordHash: pw, firstName: "Lucas", lastName: "Dupont", role: "PROVIDER", isVerified: true } });
    const sophie = await prisma.user.create({ data: { email: "sophie@test.com", passwordHash: pw, firstName: "Sophie", lastName: "Martin", role: "PROVIDER", isVerified: true } });
    const ahmed = await prisma.user.create({ data: { email: "ahmed@test.com", passwordHash: pw, firstName: "Ahmed", lastName: "Benali", role: "PROVIDER", isVerified: true } });

    const pMarie = await prisma.provider.create({ data: { userId: marie.id, title: "Experte Ménage", bio: "Professionnelle avec 10 ans d'expérience en nettoyage.", address: "Paris", rating: 4.8, reviewCount: 42, level: 3 } });
    const pLucas = await prisma.provider.create({ data: { userId: lucas.id, title: "Jardinier Paysagiste", bio: "Passionné par les espaces verts depuis 15 ans.", address: "Lyon", rating: 3.2, reviewCount: 18, level: 2 } });
    const pSophie = await prisma.provider.create({ data: { userId: sophie.id, title: "Électricienne Confirmée", bio: "Artisan électricienne, interventions rapides.", address: "Paris", rating: 4.9, reviewCount: 67, level: 4 } });
    const pAhmed = await prisma.provider.create({ data: { userId: ahmed.id, title: "Plombier Expert", bio: "Dépannage plomberie et chauffage, 12 ans d'expérience.", address: "Marseille", rating: 2.5, reviewCount: 8, level: 1 } });

    // Categories
    const cMenage = await prisma.category.create({ data: { name: "Ménage", slug: "menage", icon: "cleaning_services" } });
    const cJardin = await prisma.category.create({ data: { name: "Jardinage", slug: "jardinage", icon: "yard" } });
    const cElec = await prisma.category.create({ data: { name: "Électricien", slug: "electricien", icon: "electric_bolt" } });
    const cPlom = await prisma.category.create({ data: { name: "Plombier", slug: "plombier", icon: "plumbing" } });

    // Services
    await prisma.service.create({ data: { providerId: pMarie.id, categoryId: cMenage.id, name: "Nettoyage complet appartement", description: "Nettoyage en profondeur de votre appartement : sols, vitres, poussières, cuisine et salle de bain.", price: 25, duration: 120, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pMarie.id, categoryId: cMenage.id, name: "Nettoyage de vitres", description: "Vitres et baies vitrées impeccables, sans trace.", price: 35, duration: 60, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pLucas.id, categoryId: cJardin.id, name: "Tonte de pelouse", description: "Tonte de pelouse et finition bordures.", price: 30, duration: 60, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pLucas.id, categoryId: cJardin.id, name: "Taille de haies et arbustes", description: "Taille précise de vos haies et arbustes d'ornement.", price: 35, duration: 90, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pSophie.id, categoryId: cElec.id, name: "Réparation électrique", description: "Diagnostic et réparation de vos installations électriques.", price: 45, duration: 60, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pSophie.id, categoryId: cElec.id, name: "Installation luminaires", description: "Pose de luminaires, appliques et spots.", price: 40, duration: 60, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pAhmed.id, categoryId: cPlom.id, name: "Dépannage plomberie urgent", description: "Intervention rapide pour fuite, bouchon ou panne.", price: 50, duration: 60, unit: "h", isActive: true } });
    await prisma.service.create({ data: { providerId: pAhmed.id, categoryId: cPlom.id, name: "Installation robinetterie", description: "Pose de robinets, mitigeurs et receveurs.", price: 45, duration: 90, unit: "h", isActive: true } });

    console.log("✅ Database seeded");
    console.log("   client@test.com / password123  (CLIENT)");
    console.log("   marie@test.com  / password123  (PROVIDER - 4.8⭐)");
    console.log("   lucas@test.com  / password123  (PROVIDER - 3.2⭐)");
    console.log("   sophie@test.com / password123  (PROVIDER - 4.9⭐)");
    console.log("   ahmed@test.com  / password123  (PROVIDER - 2.5⭐)");
    console.log("   admin@test.com  / password123  (ADMIN)");
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📝 Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

export default app;
