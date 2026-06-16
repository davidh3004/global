/**
 * Cart Context
 * Provides cart state and operations throughout the app
 */

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/client';
import type { CartState, CartAction, CartItem } from '../types/cart';
import {
  cartLocalStorage,
  cartFirestore,
  syncLocalToFirestore,
  syncFirestoreToLocal,
} from '../services/cart-persistence.service';

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: true,
  isSyncing: false,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS': {
      const items = action.payload;
      return {
        ...state,
        items,
        total: calculateTotal(items),
        itemCount: calculateItemCount(items),
        isLoading: false,
      };
    }

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Item exists, update quantity
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // New item
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0); // Remove items with quantity 0

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    default:
      return state;
  }
}

// Helper functions
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Context type
interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const previousUser = user;
      setUser(currentUser);

      if (!isAuthReady) {
        // First load
        setIsAuthReady(true);
        await loadInitialCart(currentUser);
      } else {
        // Auth state changed after initial load
        await handleAuthChange(previousUser, currentUser);
      }
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Listen for addToCart events from non-React components
  useEffect(() => {
    const handleAddFromWindow = (e: Event) => {
      const customEvent = e as CustomEvent<CartItem>;
      console.log('[Cart] Received addToCart event:', customEvent.detail);
      addItem(customEvent.detail);
    };
    
    window.addEventListener('addToCart', handleAddFromWindow);
    return () => window.removeEventListener('addToCart', handleAddFromWindow);
  }, []);

  // Load initial cart
  async function loadInitialCart(currentUser: User | null) {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (currentUser) {
        console.log('[Cart] Loading from Firestore for user:', currentUser.uid);
        const items = await cartFirestore.get(currentUser.uid);
        console.log('[Cart] Loaded items from Firestore:', items);
        dispatch({ type: 'SET_ITEMS', payload: items });
      } else {
        console.log('[Cart] Loading from localStorage');
        const items = cartLocalStorage.get();
        console.log('[Cart] Loaded items from localStorage:', items);
        dispatch({ type: 'SET_ITEMS', payload: items });
      }
    } catch (error) {
      console.error('[Cart] Error loading cart:', error);
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  }

  // Handle auth state changes (login/logout)
  async function handleAuthChange(previousUser: User | null, currentUser: User | null) {
    dispatch({ type: 'SET_SYNCING', payload: true });

    try {
      if (!previousUser && currentUser) {
        // User logged in - sync localStorage to Firestore
        const items = await syncLocalToFirestore(currentUser.uid);
        dispatch({ type: 'SET_ITEMS', payload: items });
      } else if (previousUser && !currentUser) {
        // User logged out - sync Firestore to localStorage
        const items = await syncFirestoreToLocal(previousUser.uid);
        dispatch({ type: 'SET_ITEMS', payload: items });
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }

  // Persist cart after state changes
  async function persistCart(items: CartItem[]) {
    try {
      if (user) {
        console.log('[Cart] Persisting to Firestore:', items);
        await cartFirestore.set(user.uid, items);
      } else {
        console.log('[Cart] Persisting to localStorage:', items);
        cartLocalStorage.set(items);
      }
    } catch (error) {
      console.error('[Cart] Error persisting cart:', error);
      throw error;
    }
  }

  // Cart operations
  const addItem = async (item: CartItem) => {
    console.log('[Cart] Adding item:', item);
    dispatch({ type: 'ADD_ITEM', payload: item });
    // Persist will happen in the effect below
  };

  const removeItem = async (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = async (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const refreshCart = async () => {
    await loadInitialCart(user);
  };

  // Persist cart whenever items change
  useEffect(() => {
    if (isAuthReady && !state.isLoading && !state.isSyncing) {
      persistCart(state.items).catch(console.error);
    }
  }, [state.items, isAuthReady, state.isLoading, state.isSyncing]);

  // Dispatch custom event when cart updates (for non-React components)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: state }));
  }, [state.itemCount]);

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
