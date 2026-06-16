/**
 * Order Service - Manages order creation and retrieval
 * DRY: Reuses FirestoreService and cart.service patterns
 */

import { ordersService } from './firestore.service';
import { getCartItems, clearCart } from './cart.service';
import type { Order, OrderItem } from '../firebase/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}-${random}`;
}

/**
 * Create order from cart
 * DRY: Reuses getCartItems() and clearCart()
 */
export async function createOrderFromCart(
  userId: string,
  customerEmail: string,
  customerName: string,
  customerPhone?: string,
  notes?: string
): Promise<Order> {
  const cartItems = await getCartItems(userId);
  
  if (cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  // Convert cart items to order items
  const orderItems: OrderItem[] = cartItems.map(item => ({
    productId: item.productId,
    productName: item.productName,
    productPrice: item.productPrice,
    quantity: item.quantity,
    subtotal: item.productPrice * item.quantity,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax;

  const orderData: Omit<Order, 'id'> = {
    userId,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    subtotal,
    tax,
    total,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'quickbooks',
    customerEmail,
    customerName,
    customerPhone,
    notes,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const orderId = await ordersService.create(orderData);
  
  // Clear cart after order creation
  await clearCart(userId);

  return { id: orderId, ...orderData };
}

/**
 * Get user's orders
 * DRY: Reuses ordersService.getWhere()
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const orders = await ordersService.getWhere('userId', '==', userId);
  return orders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

/**
 * Get order by ID
 * DRY: Reuses ordersService.getById()
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  return ordersService.getById(orderId);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<void> {
  const updates: Partial<Order> = {
    status,
    updatedAt: Timestamp.now(),
  };

  if (status === 'completed') {
    updates.completedAt = Timestamp.now();
  }

  await ordersService.update(orderId, updates);
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: Order['paymentStatus'],
  paymentId?: string
): Promise<void> {
  await ordersService.update(orderId, {
    paymentStatus,
    paymentId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get all orders (admin only)
 * DRY: Reuses ordersService.getAllOrdered()
 */
export async function getAllOrders(): Promise<Order[]> {
  return ordersService.getAllOrdered('createdAt', 'desc');
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<void> {
  await ordersService.update(orderId, {
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  });
}
