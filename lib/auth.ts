import bcrypt from 'bcryptjs';
import { User } from '@/types';

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
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function storeUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('currentUserEmail') !== null;
}

export function getCurrentUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentUserEmail');
}

export function setCurrentUser(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUserEmail', email);
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUserEmail');
}
