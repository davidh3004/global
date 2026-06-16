/**
 * Cart Service - Manages shopping cart operations
 * DRY: Reuses FirestoreService and follows existing service patterns
 */

import { cartService, productsService } from './firestore.service';
import type { CartItem, Product } from '../firebase/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Add product to cart
 * If product already exists, increment quantity
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<void> {
  // Get product details for denormalization
  const product = await productsService.getById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check if item already in cart
  const existingItems = await cartService.getWhere('userId', '==', userId);
  const existingItem = existingItems.find(item => item.productId === productId);

  if (existingItem && existingItem.id) {
    // Update quantity
    await cartService.update(existingItem.id, {
      quantity: existingItem.quantity + quantity,
    });
  } else {
    // Add new item
    const cartItem: Omit<CartItem, 'id'> = {
      userId,
      productId,
      productName: product.name,
      productPrice: product.price || 0,
      productImageUrl: product.imageUrl,
      quantity,
      addedAt: Timestamp.now(),
    };
    await cartService.create(cartItem);
  }
}

/**
 * Get user's cart items
 * DRY: Reuses cartService.getWhere()
 */
export async function getCartItems(userId: string): Promise<CartItem[]> {
  return cartService.getWhere('userId', '==', userId);
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    await cartService.delete(cartItemId);
  } else {
    await cartService.update(cartItemId, { quantity });
  }
}

/**
 * Remove item from cart
 * DRY: Reuses cartService.delete()
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  await cartService.delete(cartItemId);
}

/**
 * Clear entire cart
 */
export async function clearCart(userId: string): Promise<void> {
  const items = await getCartItems(userId);
  await Promise.all(items.map(item => item.id && cartService.delete(item.id)));
}

/**
 * Calculate cart totals
 */
export async function getCartTotals(userId: string): Promise<{
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}> {
  const items = await getCartItems(userId);
  
  const subtotal = items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );
  
  const tax = subtotal * 0.07; // 7% tax rate (configurable)
  const total = subtotal + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, tax, total, itemCount };
}
