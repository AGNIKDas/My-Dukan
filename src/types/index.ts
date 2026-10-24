/**
 * Type definitions for Desh Electric web application.
 */

export interface ShopInfo {
  name: string;
  owner: string;
  address: {
    line1: string;
    locality: string;
    district: string;
    state: string;
    pincode: string;
    formatted: string;
  };
  googleMapsUrl: string;
  /** Phone number will be set once provided by the shop owner */
  phone: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  createdAt?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
}

export type ProductAvailability = 'available' | 'out_of_stock' | 'confirm_availability';

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  companyId: string;
  price: number;
  description?: string;
  specifications?: Record<string, string>;
  imageUrl?: string;
  inStock: boolean;
  availability?: ProductAvailability;
  featured?: boolean;
  createdAt?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null;
  selectedCompany: string | null;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
}

export interface ShopSettingsRow {
  id: string;
  shop_name: string;
  owner_name: string;
  address_line1: string;
  locality: string;
  district: string;
  state: string;
  pincode: string;
  google_maps_url: string;
  phone: string | null;
  updated_at?: string;
}
