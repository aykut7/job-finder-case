import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

import { loginRequest, registerRequest } from "../../api/authApi";
import type { LoginResponse } from "../../types";

const SESSION_KEY = "jobapp_session";

type AuthState = {
  session: LoginResponse | null;
  loading: boolean;
  restoring: boolean;
  error: string | null;
};

const initialState: AuthState = {
  session: null,
  loading: false,
  restoring: true,
  error: null,
};

const normalizeSession = (session: LoginResponse) => ({
  ...session,
  accessToken: session.accessToken ?? session.token ?? "",
  tokenType: session.tokenType ?? "Bearer",
});

const saveSession = async (session: LoginResponse) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(normalizeSession(session)));
};

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }) => {
    const session = await loginRequest(data);
    const normalizedSession = normalizeSession(session);
    await saveSession(normalizedSession);

    return normalizedSession;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: { email: string; password: string }) => {
    const session = await registerRequest(data);
    const normalizedSession = normalizeSession(session);
    await saveSession(normalizedSession);

    return normalizedSession;
  }
);

export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  const storedSession = await SecureStore.getItemAsync(SESSION_KEY);

  return storedSession
    ? normalizeSession(JSON.parse(storedSession) as LoginResponse)
    : null;
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.session = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
      })
      .addCase(login.rejected, state => {
        state.loading = false;
        state.error = "Unable to sign in";
      })

      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
      })
      .addCase(register.rejected, state => {
        state.loading = false;
        state.error = "Unable to register";
      })

      .addCase(restoreSession.pending, state => {
        state.restoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoring = false;
        state.session = action.payload;
      })
      .addCase(restoreSession.rejected, state => {
        state.restoring = false;
        state.session = null;
      })

      .addCase(logoutUser.fulfilled, state => {
        state.session = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
