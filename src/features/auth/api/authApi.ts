import { apiRequest, apiRequestOrNull } from "../../../shared/api/apiClient";
import type { AuthCredentials, AuthUserDto } from "../../../shared/types";
import type { AuthResponse } from "../types";
import { getAuthMessages } from "../utils/authValidation";

export async function login(credentials: AuthCredentials): Promise<AuthUserDto> {
  const messages = getAuthMessages();
  const data = await apiRequest<AuthResponse>("/api/login", {
    method: "POST",
    body: credentials,
    fallbackErrorMessage: messages.loginNetworkError,
    handleUnauthorized: false,
  });

  return data.user;
}

export async function register(credentials: AuthCredentials): Promise<AuthUserDto> {
  const messages = getAuthMessages();
  const data = await apiRequest<AuthResponse>("/api/register", {
    method: "POST",
    body: credentials,
    fallbackErrorMessage: messages.signupNetworkError,
    handleUnauthorized: false,
  });

  return data.user;
}

export async function getCurrentUser(): Promise<AuthUserDto | null> {
  const messages = getAuthMessages();
  const data = await apiRequestOrNull<AuthResponse>("/api/me", {
    fallbackErrorMessage: messages.sessionRestoreFailed,
  });

  return data?.user ?? null;
}

export async function logout(): Promise<void> {
  const messages = getAuthMessages();
  await apiRequest("/api/logout", {
    method: "POST",
    fallbackErrorMessage: messages.serverError,
    handleUnauthorized: false,
  });
}
