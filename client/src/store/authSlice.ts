import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import type { User } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { error?: { message?: string } } } };
  return err.response?.data?.error?.message || fallback;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

function loadAuthInfo(): { id: string; role: string } | null {
  try {
    const raw = localStorage.getItem("authInfo");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to parse authInfo from localStorage:", e);
    localStorage.removeItem("authInfo");
    return null;
  }
}

function buildUserFromAuthInfo(info: { id: string; role: string }): User {
  return { id: info.id, role: info.role as User["role"], email: "", firstName: "", lastName: "", isVerified: false, createdAt: "", updatedAt: "" };
}

const authInfo = loadAuthInfo();

const initialState: AuthState = {
  user: authInfo ? buildUserFromAuthInfo(authInfo) : null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Erreur de connexion"));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; firstName: string; lastName: string; role?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Erreur d'inscription"));
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/google", { token });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Erreur Google auth"));
    }
  }
);

export const getMe = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/auth/me");
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error, "Erreur lors du chargement du profil"));
  }
});

function persistAuthInfo(user: { id: string; role: string }) {
  localStorage.setItem("authInfo", JSON.stringify({ id: user.id, role: user.role }));
}

function clearAuthStorage() {
  localStorage.removeItem("authInfo");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      clearAuthStorage();
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        persistAuthInfo(action.payload.user);
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        persistAuthInfo(action.payload.user);
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        persistAuthInfo(action.payload.user);
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        persistAuthInfo(action.payload);
      })
      .addCase(getMe.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload as string;
        clearAuthStorage();
      });
  },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
