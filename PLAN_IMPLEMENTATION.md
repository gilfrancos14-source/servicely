# Plan d'implémentation - Service de réservation (React + Node.js + PostgreSQL)

## Architecture globale

```
reservation-app/
├── client/                 # Frontend React + Vite + TS
│   ├── src/
│   │   ├── components/     # shadcn/ui + composants custom
│   │   ├── pages/          # Pages par rôle/feature
│   │   ├── hooks/          # Custom hooks (auth, booking, socket)
│   │   ├── store/          # Redux Toolkit slices
│   │   ├── services/       # API client (Axios + interceptors)
│   │   ├── utils/          # Helpers, validation Zod
│   │   └── types/          # Types TS partagés
│   └── package.json
├── server/                 # Backend Express + TS
│   ├── src/
│   │   ├── config/         # Env, DB, Passport, PayPal, Email
│   │   ├── controllers/    # Logique par ressource
│   │   ├── middlewares/    # Auth, RBAC, validation, error handling
│   │   ├── routes/         # Endpoints REST
│   │   ├── services/       # Business logic (booking, payment, email, socket)
│   │   ├── utils/          # Helpers, constants
│   │   └── types/          # Types TS + Prisma types
│   ├── prisma/
│   │   └── schema.prisma   # Modèles DB
│   └── package.json
├── shared/                 # Types/constants partagés (optionnel)
├── docker-compose.yml      # Dev local (PostgreSQL + Redis)
└── README.md
```

---

## Phase 1 : Fondation & Setup (Semaine 1)

- [ ] Init client (Vite + React + TS) + server (Express + TS)
- [ ] ESLint + Prettier + Husky (pre-commit)
- [ ] Prisma init + schéma complet (voir modèles)
- [ ] Docker Compose (PostgreSQL + Redis)

### Modèles Prisma (schema.prisma)

```prisma
enum Role { CLIENT PROVIDER ADMIN }
enum BookingStatus { PENDING CONFIRMED CANCELLED COMPLETED REFUNDED }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  googleId      String?   @unique
  firstName     String
  lastName      String
  phone         String?
  avatar        String?
  role          Role      @default(CLIENT)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  provider      Provider?
  bookings      Booking[] @relation("ClientBookings")
  reviews       Review[]
  notifications Notification[]
  timeSlots     TimeSlot[] @relation("ProviderTimeSlots")
}

model Provider {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio         String?
  address     String?
  latitude    Float?
  longitude   Float?
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  services    Service[]
  timeSlots   TimeSlot[]
  earnings    Earning[]
}

model Service {
  id          String   @id @default(cuid())
  providerId  String
  provider    Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  name        String
  description String
  price       Decimal  @db.Decimal(10, 2)
  duration    Int      // minutes
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  bookings    Booking[]
  timeSlots   TimeSlot[]
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  icon      String?
  services  Service[]
}

model TimeSlot {
  id          String   @id @default(cuid())
  providerId  String
  provider    Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  startTime   DateTime
  endTime     DateTime
  isBooked    Boolean  @default(false)
  booking     Booking? @relation(fields: [bookingId], references: [id])
  bookingId   String?  @unique
  createdAt   DateTime @default(now())
  
  @@index([providerId, startTime])
  @@index([serviceId, startTime])
}

model Booking {
  id            String       @id @default(cuid())
  clientId      String
  client        User         @relation("ClientBookings", fields: [clientId], references: [id])
  providerId    String
  provider      Provider     @relation(fields: [providerId], references: [id], onDelete: Cascade)
  serviceId     String
  service       Service      @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  timeSlotId    String       @unique
  timeSlot      TimeSlot     @relation(fields: [timeSlotId], references: [id], onDelete: Cascade)
  status        BookingStatus @default(PENDING)
  totalPrice    Decimal      @db.Decimal(10, 2)
  paymentStatus PaymentStatus @default(PENDING)
  paypalOrderId String?
  notes         String?
  cancelledAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  review        Review?
  payment       Payment?
}

model Payment {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("EUR")
  paypalOrderId String @unique
  paypalCaptureId String?
  status      PaymentStatus @default(PENDING)
  rawResponse Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Review {
  id        String   @id @default(cuid())
  bookingId String   @unique
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  clientId  String
  client    User     @relation(fields: [clientId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Earning {
  id        String   @id @default(cuid())
  providerId String
  provider  Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  bookingId String   @unique
  amount    Decimal  @db.Decimal(10, 2)
  platformFee Decimal @db.Decimal(10, 2)
  netAmount Decimal  @db.Decimal(10, 2)
  status    String   @default("PENDING") // PENDING, AVAILABLE, PAID_OUT
  createdAt DateTime @default(now())
  paidAt    DateTime?
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // BOOKING_CREATED, BOOKING_CONFIRMED, PAYMENT_RECEIVED, REVIEW_RECEIVED, etc.
  title     String
  message   String
  data      Json?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  @@index([userId, isRead])
}
```

---

## Phase 2 : Backend Core - Auth & Users (Semaine 2)

- [ ] Config env (Zod), DB (Prisma singleton), middlewares (error, validate, auth, RBAC)
- [ ] Auth JWT + Google OAuth (Passport)
- [ ] Endpoints: register, login, googleCallback, refresh, logout, me, verify-email
- [ ] Users CRUD + avatar upload

---

## Phase 3 : Backend - Services, Categories, TimeSlots (Semaine 3)

- [ ] Categories CRUD (admin) + public list
- [ ] Services CRUD (provider) + public search/filtres
- [ ] TimeSlots bulk create (récurrence) + planning provider

---

## Phase 4 : Backend - Booking & Payment (Semaine 4-5)

### Flow Booking
```
Client → GET /services/:id/available-slots → POST /bookings → PayPal approve → POST /paypal/capture → CONFIRMED
```

- [ ] Endpoints booking (créer, lister, annuler, compléter)
- [ ] PayPal SDK: createOrder, captureOrder, refund, webhook
- [ ] Transactions Prisma + row-lock sur TimeSlot
- [ ] Idempotence PayPal (paypalOrderId unique)

---

## Phase 5 : Backend - Reviews, Notifications, Earnings (Semaine 5-6)

- [ ] Reviews (post-booking, maj rating provider)
- [ ] Notifications: Email (Nodemailer) + In-App + Real-time (Socket.io)
- [ ] BullMQ + Redis pour queue email
- [ ] Earnings provider (15% fee plateforme)

---

## Phase 6 : Backend - Admin Dashboard (Semaine 6)

- [ ] Stats globales, users, bookings, providers, earnings, categories
- [ ] RBAC strict ADMIN uniquement

---

## Phase 7 : Frontend - Setup & Core (Semaine 7)

- [ ] Vite + Tailwind + shadcn/ui init
- [ ] TanStack Query (server state) + Redux Toolkit (client state: auth, UI)
- [ ] Axios interceptors (auth, refresh, errors)
- [ ] Routing + guards (RequireAuth, RequireRole)
- [ ] Layout: Header, Sidebar, Footer, Theme provider

---

## Phase 8 : Frontend - Auth & Onboarding (Semaine 8)

- [ ] Pages: Login, Register, Google callback, Verify email, Forgot/Reset password
- [ ] Onboarding Provider (stepper: profil, bio, adresse, services, créneaux)

---

## Phase 9 : Frontend - Client Features (Semaine 9-10)

- [ ] Home, Services list (filtres), Service detail + calendrier dispo
- [ ] Booking flow + PayPal SDK (@paypal/react-paypal-js)
- [ ] Espace client: mes réservations, profil, notifications

---

## Phase 10 : Frontend - Provider Dashboard (Semaine 10-11)

- [ ] Dashboard stats + planning (FullCalendar/custom)
- [ ] Gestion bookings (confirmer, annuler, terminer)
- [ ] CRUD services + revenues graphique (Recharts)

---

## Phase 11 : Frontend - Admin Dashboard (Semaine 11)

- [ ] KPIs, DataTables (tanstack-table): users, bookings, providers, earnings, categories

---

## Phase 12 : Real-time & Polish (Semaine 12)

- [ ] Socket.io: auth handshake, rooms par user, events booking/payment/review/slot
- [ ] Client hook useSocket → maj cache TanStack Query + Redux notifications
- [ ] Email templates responsive + test Ethereal/SendGrid
- [ ] A11y, SEO, PWA manifest

---

## Phase 13 : Tests, CI/CD & Deploy (Semaine 13)

### Tests
- [ ] Backend: Vitest + Supertest (unit + integration, 80%+ coverage services critiques)
- [ ] Frontend: Vitest + RTL (composants critiques, hooks)
- [ ] E2E: Playwright (flows complets client/provider/admin)

### CI/CD GitHub Actions
- [ ] Lint + typecheck + tests + build Docker

### Deploy Render
- [ ] PostgreSQL Managed
- [ ] Backend Web Service (build: prisma migrate deploy)
- [ ] Frontend Static Site (SPA redirect)
- [ ] Redis (BullMQ + Socket.io)

### Monitoring
- [ ] Sentry (client + server)
- [ ] Logtail/Better Stack
- [ ] Uptime monitoring

---

## Checklist "Clean & Bug-Free"

| Aspect | Actions |
|--------|---------|
| Type Safety | TS strict, types partagés, Zod partout |
| Error Handling | Error boundaries, try/catch, codes HTTP unifiés |
| Validation | Zod schemas partagés client/server |
| Security | Helmet, CORS strict, rate-limit, sanitization, CSP |
| Concurrency | Prisma transactions, row locks, idempotency keys |
| Observability | Structured logging (pino), request IDs, métriques |

---

## Ordre d'exécution recommandé

```
Sem 1-2  : Phase 1-2 (Fondation + Auth)        → Base solide
Sem 3-4  : Phase 3-4 (Services + Booking Core) → Cœur métier
Sem 5-6  : Phase 5-6 (Reviews + Admin)         → Complétude backend
Sem 7-8  : Phase 7-8 (Frontend Setup + Auth)   → Base frontend
Sem 9-11 : Phase 9-11 (Features par rôle)      → UI complète
Sem 12   : Phase 12 (Real-time + Polish)       → Qualité
Sem 13   : Phase 13 (Tests + Deploy)           → Production
```

---

## Questions ouvertes

1. **Monorepo** (Turborepo) vs dossiers séparés ?
2. **Images** : Cloudinary (gratuit 25GB) ou local + nginx ?
3. **Géolocalisation** : Google Maps API (payant) ou Nominatim (gratuit, rate-limited) ?
4. **Chat temps réel** client/provider par booking ? (Socket.io rooms)
5. **Budget Render** : Instances gratuites (limitées) ou paid ($7+/mois/service) ?