import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Category, Company, Product } from '../types';
import { CATEGORIES as INITIAL_CATEGORIES, COMPANIES as INITIAL_COMPANIES, DEMO_PRODUCTS } from '../data/mockData';
import { SHOP_INFO } from '../utils/constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validates whether Supabase environment variables are properly supplied.
 * Checks for non-empty values and filters out default example placeholders.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ==============================================================================
// PUBLIC & DATA ACCESS HELPERS
// ==============================================================================

/**
 * Fetch all categories.
 * If Supabase is connected, reads from 'categories' table; otherwise returns initial data.
 */
export async function getCategories(): Promise<Category[]> {
  if (!supabase) {
    return INITIAL_CATEGORIES;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('Failed to load categories from Supabase, using local data:', error.message);
    return INITIAL_CATEGORIES;
  }

  if (!data || data.length === 0) {
    return INITIAL_CATEGORIES;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    iconName: row.icon_name || 'Zap',
    createdAt: row.created_at,
  }));
}

/**
 * Fetch all companies / brand partners.
 */
export async function getCompanies(): Promise<Company[]> {
  if (!supabase) {
    return INITIAL_COMPANIES;
  }

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('Failed to load companies from Supabase, using local data:', error.message);
    return INITIAL_COMPANIES;
  }

  if (!data || data.length === 0) {
    return INITIAL_COMPANIES;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    logoUrl: row.logo_url,
    createdAt: row.created_at,
  }));
}

/**
 * Fetch products from the database.
 * If Supabase is configured and has products, returns live database products.
 * If Supabase is unconfigured or returns an empty table, returns fallback demo items.
 */
export async function getProducts(): Promise<{ products: Product[]; isLive: boolean }> {
  if (!supabase) {
    return { products: DEMO_PRODUCTS, isLive: false };
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to load products from Supabase, falling back to demo catalog:', error.message);
    return { products: DEMO_PRODUCTS, isLive: false };
  }

  if (!data || data.length === 0) {
    // If the database has 0 products yet, return empty list for dashboard, or demo for catalog preview
    return { products: [], isLive: true };
  }

  const mapped: Product[] = data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    companyId: row.company_id,
    price: Number(row.price),
    description: row.description || '',
    specifications: row.specifications || {},
    imageUrl: row.image_url || '',
    inStock: row.in_stock ?? true,
    availability: row.availability || (row.in_stock ? 'available' : 'out_of_stock'),
    featured: row.featured ?? false,
    createdAt: row.created_at,
  }));

  return { products: mapped, isLive: true };
}

/**
 * Fetch shop settings (address, owner, phone number).
 */
export async function getShopSettings(): Promise<{ phone: string | null }> {
  if (!supabase) {
    return { phone: SHOP_INFO.phone };
  }

  const { data, error } = await supabase
    .from('shop_settings')
    .select('phone')
    .eq('id', 'default')
    .maybeSingle();

  if (error || !data) {
    return { phone: SHOP_INFO.phone };
  }

  return { phone: data.phone || null };
}

// ==============================================================================
// ADMIN STORAGE & MUTATION HELPERS (Protected by RLS)
// ==============================================================================

/**
 * Upload an image to the 'product-images' bucket in Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please connect Supabase in .env first.');
  }

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload product image: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Checks whether the currently logged-in user is explicitly assigned the 'admin' role in public.user_roles.
 */
export async function checkCurrentUserRole(): Promise<{ isAdmin: boolean; email: string | null; userId: string | null }> {
  if (!supabase) return { isAdmin: false, email: null, userId: null };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { isAdmin: false, email: null, userId: null };

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  const isAdmin = !error && data?.role === 'admin';
  return { isAdmin, email: user.email || null, userId: user.id };
}

/**
 * Insert or update a product in Supabase.
 */
export async function upsertProduct(product: Partial<Product> & { name: string; price: number; categoryId: string; companyId: string }): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot save product.');
  }

  const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const row = {
    name: product.name.trim(),
    slug,
    category_id: product.categoryId || null,
    company_id: product.companyId || null,
    price: product.price,
    description: product.description?.trim() || '',
    specifications: product.specifications || {},
    image_url: product.imageUrl || null,
    availability: product.availability || 'available',
    in_stock: product.availability !== 'out_of_stock',
    featured: product.featured ?? false,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (product.id) {
    const res = await supabase.from('products').update(row).eq('id', product.id);
    error = res.error;
  } else {
    const res = await supabase.from('products').insert(row);
    error = res.error;
  }

  if (error) {
    if (error.code === '42501' || error.message?.toLowerCase().includes('permission denied') || error.message?.toLowerCase().includes('row-level security')) {
      throw new Error(`Permission denied for table products: Your logged-in account does not have administrator privileges in 'public.user_roles' or database table permissions need to be granted. (PostgreSQL: ${error.message})`);
    }
    throw new Error(`Error saving product: ${error.message}`);
  }
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(productId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot delete product.');
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) {
    if (error.code === '42501' || error.message?.toLowerCase().includes('permission denied') || error.message?.toLowerCase().includes('row-level security')) {
      throw new Error(`Permission denied for table products: Your logged-in account does not have administrator privileges in 'public.user_roles'. (PostgreSQL: ${error.message})`);
    }
    throw new Error(`Error deleting product: ${error.message}`);
  }
}

/**
 * Upsert a category (Add or Rename).
 */
export async function upsertCategory(category: { id?: string; name: string; description?: string; iconName?: string }): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot save category.');
  }

  const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const row = {
    name: category.name.trim(),
    slug,
    description: category.description?.trim() || '',
    icon_name: category.iconName || 'Zap',
  };

  let error;
  if (category.id) {
    const res = await supabase.from('categories').update(row).eq('id', category.id);
    error = res.error;
  } else {
    const res = await supabase.from('categories').insert(row);
    error = res.error;
  }

  if (error) {
    throw new Error(`Error saving category: ${error.message}`);
  }
}

/**
 * Delete a category by ID.
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('categories').delete().eq('id', categoryId);
  if (error) {
    throw new Error(`Error deleting category: ${error.message}`);
  }
}

/**
 * Upsert a company (Add or Rename).
 */
export async function upsertCompany(company: { id?: string; name: string; description?: string; logoUrl?: string }): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot save company.');
  }

  const slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const row = {
    name: company.name.trim(),
    slug,
    description: company.description?.trim() || '',
    logo_url: company.logoUrl || null,
  };

  let error;
  if (company.id) {
    const res = await supabase.from('companies').update(row).eq('id', company.id);
    error = res.error;
  } else {
    const res = await supabase.from('companies').insert(row);
    error = res.error;
  }

  if (error) {
    throw new Error(`Error saving company: ${error.message}`);
  }
}

/**
 * Delete a company by ID.
 */
export async function deleteCompany(companyId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('companies').delete().eq('id', companyId);
  if (error) {
    throw new Error(`Error deleting company: ${error.message}`);
  }
}

/**
 * Update the shop phone number in the database settings.
 */
export async function updateShopPhone(phone: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot update settings.');
  }

  const { error } = await supabase
    .from('shop_settings')
    .upsert({
      id: 'default',
      shop_name: 'Desh Electric',
      owner_name: 'ASOKE KUMAR DAS',
      google_maps_url: 'https://maps.app.goo.gl/PKaiVVLFb8NooDhw6',
      phone: phone.trim() || null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Error updating phone number: ${error.message}`);
  }
}
