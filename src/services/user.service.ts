/**
 * User Service - Handles public user management
 * DRY: Extends auth.service.ts and reuses FirestoreService pattern
 */

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase/client';
import { usersService } from './firestore.service';
import type { PublicUser } from '../firebase/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Register a new public user
 * Creates Firebase Auth account and Firestore user document
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  firstName?: string,
  lastName?: string
): Promise<{ user: User; publicUser: PublicUser }> {
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, { displayName });

  // Send email verification (optional but recommended)
  await sendEmailVerification(user);

  // Create Firestore user document
  const publicUserData: Omit<PublicUser, 'id'> = {
    uid: user.uid,
    email: user.email!,
    displayName,
    firstName,
    lastName,
    role: 'customer',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const userId = await usersService.create(publicUserData);
  const publicUser = { id: userId, ...publicUserData };

  return { user, publicUser };
}

/**
 * Get public user by Firebase Auth UID
 */
export async function getPublicUserByUid(uid: string): Promise<PublicUser | null> {
  const users = await usersService.getWhere('uid', '==', uid);
  return users.length > 0 ? users[0] : null;
}

/**
 * Update public user profile
 * DRY: Reuses usersService.update()
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<PublicUser>
): Promise<void> {
  await usersService.update(userId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Get all users (admin only)
 * DRY: Reuses usersService.getAll()
 */
export async function getAllUsers(): Promise<PublicUser[]> {
  return usersService.getAllOrdered('createdAt', 'desc');
}

/**
 * Deactivate user account (soft delete)
 */
export async function deactivateUser(userId: string): Promise<void> {
  await usersService.update(userId, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Activate user account
 */
export async function activateUser(userId: string): Promise<void> {
  await usersService.update(userId, {
    isActive: true,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete user permanently (admin only)
 * DRY: Reuses usersService.delete()
 */
export async function deleteUser(userId: string): Promise<void> {
  await usersService.delete(userId);
}
