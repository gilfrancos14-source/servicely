import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  notificationsOpen: boolean;
}

const initialState: UiState = {
  theme: (localStorage.getItem("theme") as "light" | "dark" | "system") || "light",
  sidebarOpen: true,
  notificationsOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark" | "system">) {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleNotifications(state) {
      state.notificationsOpen = !state.notificationsOpen;
    },
  },
});

export const { setTheme, toggleSidebar, toggleNotifications } = uiSlice.actions;
export default uiSlice.reducer;