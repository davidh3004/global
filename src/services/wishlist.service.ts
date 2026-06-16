/**
 * Wishlist Service - Manages user wishlist operations
 * DRY: Reuses FirestoreService pattern
 */

import { wishlistService, productsService } from './firestore.service';
import type { WishlistItem } from '../firebase/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Add product to wishlist
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<void> {
  // Check if already in wishlist
  const existingItems = await wishlistService.getWhere('userId', '==', userId);
  const exists = existingItems.some(item => item.productId === productId);

  if (exists) {
    return; // Already in wishlist
  }

  // Get product details for denormalization
  const product = await productsService.getById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const wishlistItem: Omit<WishlistItem, 'id'> = {
    userId,
    productId,
    productName: product.name,
    productPrice: product.price || 0,
    productImageUrl: product.imageUrl,
    addedAt: Timestamp.now(),
  };

  await wishlistService.create(wishlistItem);
}

/**
 * Get user's wishlist items
 * DRY: Reuses wishlistService.getWhere()
 */
export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  return wishlistService.getWhere('userId', '==', userId);
}

/**
 * Remove item from wishlist
 * DRY: Reuses wishlistService.delete()
 */
export async function removeFromWishlist(wishlistItemId: string): Promise<void> {
  await wishlistService.delete(wishlistItemId);
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const items = await getWishlistItems(userId);
  return items.some(item => item.productId === productId);
}

/**
 * Clear entire wishlist
 */
export async function clearWishlist(userId: string): Promise<void> {
  const items = await getWishlistItems(userId);
  await Promise.all(items.map(item => item.id && wishlistService.delete(item.id)));
}
