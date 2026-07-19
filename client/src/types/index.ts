export type Role = "CLIENT" | "PROVIDER" | "ADMIN";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isVerified: boolean;
  twoFactorEnabled?: boolean;
  notificationSettings?: Record<string, boolean>;
  loyaltyPoints?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  userId: string;
  user: User;
  title?: string;
  bio?: string;
  level?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  paypalEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  providerId: string;
  provider: Provider;
  categoryId: string;
  category: Category;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string;
  unit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface TimeSlot {
  id: string;
  providerId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  client: User;
  providerId: string;
  provider: Provider;
  serviceId: string;
  service: Service;
  timeSlotId: string;
  timeSlot: TimeSlot;
  status: BookingStatus;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paypalOrderId?: string;
  notes?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  client: User;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}