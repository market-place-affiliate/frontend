import bcrypt from 'bcryptjs';
import { User } from '@/types';
import { getAuthToken, api } from './api';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function getStoredUser(): User | null {
  // Deprecated: Use api.getCurrentUser() instead
  return null;
}

export function storeUser(user: User): void {
  // Deprecated: User data is fetched from API
}

export function removeUser(): void {
  // Deprecated: Auth token is managed by clearAuth()
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export async function getCurrentUser(): Promise<string | null> {
  try {
    const response = await api.getCurrentUser();
    if (response.success && response.data) {
      return response.data.email || response.data.username || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCurrentUser(email: string): void {
  // Deprecated: User data is managed by API
}

export function clearCurrentUser(): void {
  // Deprecated: Use clearAuth() from api.ts
}
