import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  login as loginAction,
  register as registerAction,
  googleLogin as googleLoginAction,
  logout as logoutAction,
  getMe,
  clearError,
} from "@/store/authSlice";
import type { User } from "@/types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(loginAction({ email, password }));
      if (result.meta.requestStatus === "fulfilled") {
        const payload = result.payload as { user: User };
        return { success: true, user: payload.user };
      }
      return { success: false, user: null };
    },
    [dispatch]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
    }) => {
      const result = await dispatch(registerAction(data));
      if (result.meta.requestStatus === "fulfilled") {
        const payload = result.payload as { user: User };
        return { success: true, user: payload.user, role: data.role };
      }
      return { success: false, user: null, role: data.role };
    },
    [dispatch]
  );

  const googleLogin = useCallback(
    async (token: string) => {
      const result = await dispatch(googleLoginAction(token));
      if (result.meta.requestStatus === "fulfilled") {
        const payload = result.payload as { user: User };
        return { success: true, user: payload.user };
      }
      return { success: false, user: null };
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const loadUser = useCallback(() => {
    dispatch(getMe());
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const isAuthenticated = !!user;
  const isClient = user?.role === "CLIENT";
  const isProvider = user?.role === "PROVIDER";
  const isAdmin = user?.role === "ADMIN";

  return {
    user: user as User | null,
    isAuthenticated,
    isClient,
    isProvider,
    isAdmin,
    isLoading,
    error,
    login,
    register,
    googleLogin,
    logout,
    loadUser,
    resetError,
  };
}
