import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/client';

/**
 * Servicio genérico para operaciones CRUD en Firestore
 */
export class FirestoreService<T> {
  constructor(private collectionName: string) {}

  /**
   * Obtiene todos los documentos de la colección
   */
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db, this.collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  /**
   * Obtiene un documento por ID
   */
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  /**
   * Crea un nuevo documento
   */
  async create(data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return docRef.id;
  }

  /**
   * Actualiza un documento existente
   */
  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data as any);
  }

  /**
   * Elimina un documento
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Obtiene documentos ordenados
   */
  async getAllOrdered(field: string, direction: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    return this.getAll([orderBy(field, direction)]);
  }

  /**
   * Obtiene documentos con filtro
   */
  async getWhere(field: string, operator: any, value: any): Promise<T[]> {
    return this.getAll([where(field, operator, value)]);
  }
}

// Instancias de servicios para cada colección
import type {
  CrewMember,
  TeamMember,
  Review,
  ServiceArea,
  FourTrade,
  FAQ,
  SiteConfig,
  PublicUser,
  CartItem,
  Order,
  WishlistItem,
  Product,
  LearningArticle,
  Lead,
} from '../firebase/types';

// Existing services
export const crewService = new FirestoreService<CrewMember>('crew');
export const teamService = new FirestoreService<TeamMember>('team');
export const reviewsService = new FirestoreService<Review>('reviews');
export const serviceAreasService = new FirestoreService<ServiceArea>('serviceAreas');
export const fourTradesService = new FirestoreService<FourTrade>('fourTrades');
export const faqService = new FirestoreService<FAQ>('faqs');
export const siteConfigService = new FirestoreService<SiteConfig>('siteConfig');

// New services for e-commerce functionality (DRY: reusing FirestoreService)
export const usersService = new FirestoreService<PublicUser>('users');
export const cartService = new FirestoreService<CartItem>('cart');
export const ordersService = new FirestoreService<Order>('orders');
export const wishlistService = new FirestoreService<WishlistItem>('wishlist');
export const productsService = new FirestoreService<Product>('products');
export const learningService = new FirestoreService<LearningArticle>('learning');
export const leadsService = new FirestoreService<Lead>('leads');
