import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role?: string | null;
  userId: string;
}

const token = localStorage.getItem("token");

const initialState: AuthState = {
  isAuthenticated: !!token,
  token: token || null,
  role: localStorage.getItem("rol"),
  userId: ""
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ token: string; rol?: string; userId: string }>) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.role = action.payload.rol;
      state.userId = action.payload.userId;
      localStorage.setItem("token", action.payload.token);
      if (action.payload.rol) {
        state.role = action.payload.rol;
      }
    },

    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.userId = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
