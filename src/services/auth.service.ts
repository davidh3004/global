import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase/client';

/**
 * Inicia sesión con email y contraseña
 */
export async function login(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Cierra la sesión del usuario actual
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Obtiene el usuario actual
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Observa cambios en el estado de autenticación
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}
