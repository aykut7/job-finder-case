import { api } from "./client";
import type { LoginResponse, UpdateUserData, User } from "../types";

type LoginData = {
  email: string;
  password: string;
};

export const loginRequest = async (data: LoginData) => {
  const response = await api.post<LoginResponse>("/login", data);
  return response.data;
};

export const registerRequest = async (data: LoginData) => {
  const response = await api.post<LoginResponse>("/register", data);
  return response.data;
};

export const getCurrentUserRequest = async (
  token?: string,
  tokenType = "Bearer"
) => {
  const response = await api.get<User>("/user", {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });

  return response.data;
};

export const updateCurrentUserRequest = async (
  data: UpdateUserData,
  token?: string,
  tokenType = "Bearer"
) => {
  const response = await api.put<User>("/user", data, {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });

  return response.data;
};
