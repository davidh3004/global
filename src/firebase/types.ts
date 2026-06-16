import type { Timestamp } from 'firebase/firestore';

// Crew Member (Meet the Crew)
export interface CrewMember {
  id?: string;
  name: string;
  title: string;
  imageUrl: string;
  order: number;
}

// Team Member (Meet the Team)
export interface TeamMember {
  id?: string;
  name: string;
  title: string;
  imageUrl: string;
  order: number;
}

// Review
export interface Review {
  id?: string;
  author: string;
  authorInitials: string;
  rating: number;
  content: string;
  date: Timestamp;
  isApproved: boolean;
  source?: string; // e.g., "Google Review", "Local Guide"
}

// Product
export interface Product {
  id?: string;
  name: string;
  description: string;
  price?: number; // null si es "Call for Pricing"
  priceUnit?: string; // e.g., "/ ton"
  imageUrl: string;
  badge?: string; // e.g., "Most Popular"
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Learning Article
export interface LearningArticle {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string; // e.g., "Concrete", "Asphalt", "Road Base"
  isPublished: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Service Area
export interface ServiceArea {
  id?: string;
  area: string;
  order: number;
}

// Four Trades Service
export interface FourTrade {
  id?: string;
  serviceName: string;
  description: string;
  icon: string;
  features: string[];
  priceRange: string;
  callToAction: string;
  isActive: boolean;
  order: number;
}

// FAQ
export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// Site Configuration
export interface SiteConfig {
  id?: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  googleRating: string;
  homesServed: string;
  emergencyService: string;
  satisfaction: string;
  socialMedia: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
  heroBackgroundImage: string;
  heroTitle: {
    es: string;
    en: string;
  };
  heroSubtitle: {
    es: string;
    en: string;
  };
}

// Public User (for customer accounts)
export interface PublicUser {
  id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin'; // Role-based access
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Shopping Cart Item
export interface CartItem {
  id?: string;
  userId: string; // Reference to PublicUser
  productId: string; // Reference to Product
  productName: string; // Denormalized for performance
  productPrice: number;
  productImageUrl: string;
  quantity: number;
  addedAt: Timestamp;
}

// Order
export interface Order {
  id?: string;
  userId: string; // Reference to PublicUser
  orderNumber: string; // Unique order number (e.g., "ORD-2024-001")
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'quickbooks' | 'cash' | 'other';
  paymentId?: string; // QuickBooks payment ID
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

// Order Item (embedded in Order)
export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

// Lead (Hero form submissions / quote requests)
export interface Lead {
  id?: string;
  name: string;
  material: string;
  quantity: string;
  contact: string; // phone or email
  status: 'new' | 'read' | 'replied';
  notes?: string;
  createdAt: Timestamp;
}

// Wishlist Item
export interface WishlistItem {
  id?: string;
  userId: string; // Reference to PublicUser
  productId: string; // Reference to Product
  productName: string; // Denormalized
  productPrice: number;
  productImageUrl: string;
  addedAt: Timestamp;
}
