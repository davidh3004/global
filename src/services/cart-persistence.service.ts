/**
 * Cart Persistence Service
 * Handles localStorage and Firestore operations for cart data
 */

import { doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/client';
import type { CartItem } from '../types/cart';

const CART_STORAGE_KEY = 'shopping_cart';

/**
 * LocalStorage operations
 */
export const cartLocalStorage = {
  get(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return [];
    }
  },

  set(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  },
};

/**
 * Firestore operations
 */
export const cartFirestore = {
  async get(userId: string): Promise<CartItem[]> {
    try {
      const cartDoc = await getDoc(doc(db, 'carts', userId));
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error('Error reading cart from Firestore:', error);
      throw error;
    }
  },

  async set(userId: string, items: CartItem[]): Promise<void> {
    try {
      await setDoc(doc(db, 'carts', userId), {
        items,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
      throw error;
    }
  },

  async delete(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'carts', userId));
    } catch (error) {
      console.error('Error deleting cart from Firestore:', error);
      throw error;
    }
  },
};

/**
 * Merge cart items (used when syncing localStorage to Firestore)
 * If an item exists in both, sum the quantities
 */
export function mergeCartItems(
  localItems: CartItem[],
  firestoreItems: CartItem[]
): CartItem[] {
  const merged = new Map<string, CartItem>();

  // Add Firestore items first
  firestoreItems.forEach((item) => {
    merged.set(item.id, { ...item });
  });

  // Merge or add localStorage items
  localItems.forEach((item) => {
    const existing = merged.get(item.id);
    if (existing) {
      // Item exists in both - sum quantities
      merged.set(item.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      // New item from localStorage
      merged.set(item.id, { ...item });
    }
  });

  return Array.from(merged.values());
}

/**
 * Sync cart from localStorage to Firestore (on login)
 */
export async function syncLocalToFirestore(userId: string): Promise<CartItem[]> {
  try {
    const localItems = cartLocalStorage.get();
    
    if (localItems.length === 0) {
      // No local items, just return Firestore items
      return await cartFirestore.get(userId);
    }

    const firestoreItems = await cartFirestore.get(userId);
    const mergedItems = mergeCartItems(localItems, firestoreItems);

    // Save merged items to Firestore
    await cartFirestore.set(userId, mergedItems);

    // Clear localStorage
    cartLocalStorage.clear();

    return mergedItems;
  } catch (error) {
    console.error('Error syncing cart to Firestore:', error);
    throw error;
  }
}

/**
 * Sync cart from Firestore to localStorage (on logout)
 */
export async function syncFirestoreToLocal(userId: string): Promise<CartItem[]> {
  try {
    const firestoreItems = await cartFirestore.get(userId);

    // Save to localStorage
    cartLocalStorage.set(firestoreItems);

    // Delete from Firestore
    await cartFirestore.delete(userId);

    return firestoreItems;
  } catch (error) {
    console.error('Error syncing cart to localStorage:', error);
    throw error;
  }
}
