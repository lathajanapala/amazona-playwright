// filepath: /Users/pushpalatha/Desktop/amzoncloneproject/amazona-playwright/utils/auth.ts
import { APIRequestContext } from '@playwright/test';
import { api } from './testData';

export type AuthResult = {
  token?: string;
  userId?: string;
  user?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  credentials: { name: string; email: string; password: string };
};

export function createUniqueUserPayload() {
  const unique = Math.random().toString(36).slice(2, 10);
  return {
    name: `User ${unique}`,
    email: `user_${unique}@example.com`,
    password: 'Password123'
  };
}

export function extractToken(data: any): string | undefined { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!data) return undefined;
  return data.token || data.accessToken || data.jwt || data.id_token || data.authToken;
}

export function extractUser(data: any): any { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!data) return undefined;
  if (data.user) return data.user;
  if (data.data && data.data.user) return data.data.user;
  return data;
}

export function extractId(obj: any): string | undefined { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!obj) return undefined;
  return obj._id || obj.id || obj.userId || obj.uuid;
}

export async function signup(request: APIRequestContext, payload: { name: string; email: string; password: string }) {
  const res = await request.post(`${api.baseUrl}${api.endpoints.signup}`, { data: payload });
  const json = await safeJson(res);
  const user = extractUser(json);
  return { res, json, user, userId: extractId(user) };
}

export async function login(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${api.baseUrl}${api.endpoints.login}`, { data: { email, password } });
  const json = await safeJson(res);
  const token = extractToken(json);
  const user = extractUser(json);
  return { res, json, token, user, userId: extractId(user) };
}

export async function signupAndLogin(request: APIRequestContext): Promise<AuthResult> {
  const credentials = createUniqueUserPayload();
  const su = await signup(request, credentials);
  // Attempt login regardless of what signup returned
  const li = await login(request, credentials.email, credentials.password);
  return {
    token: li.token,
    userId: li.userId || su.userId,
    user: li.user || su.user,
    credentials
  };
}

export function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

async function safeJson(res: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}
