export interface AuthUser {
  id: string;
  email: string;
  role: "CLIENT" | "PROVIDER" | "ADMIN";
}
