import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
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
  await prisma.$connect();
  console.log("✅ Database connected");

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
