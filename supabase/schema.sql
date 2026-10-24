-- ==============================================================================
-- DESH ELECTRIC — SECURE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Security Notice:
--   - Public users have READ-ONLY access to products, categories, companies,
--     shop settings, and product images.
--   - WRITE operations (INSERT, UPDATE, DELETE) are strictly restricted to
--     users assigned the 'admin' role in the `public.user_roles` table.
--   - Regular authenticated users CANNOT write data or grant themselves admin rights.
--   - Idempotent: safe to run on a fresh or existing Supabase project.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. ROLE-BASED ACCESS CONTROL (RBAC) TABLES & FUNCTIONS
-- ==============================================================================

-- Admin roles table linking auth.users to specific application roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer function to check if the current user is an admin.
-- Runs with search_path set to public to prevent search-path hijacking attacks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- RLS Policies on user_roles:
-- Authenticated users can only read their own role (needed for frontend UI role checks).
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- CRITICAL PRIVILEGE ESCALATION SAFEGUARD:
-- We intentionally DO NOT provide INSERT, UPDATE, or DELETE policies for public/authenticated users.
-- Only the database service_role (Supabase SQL Editor / Dashboard) can assign or revoke roles.


-- ==============================================================================
-- 3. CORE STORE TABLES
-- ==============================================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT DEFAULT 'Zap',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'out_of_stock', 'confirm_availability')),
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Shop Settings Table
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    shop_name TEXT NOT NULL DEFAULT 'Desh Electric',
    owner_name TEXT NOT NULL DEFAULT 'ASOKE KUMAR DAS',
    address_line1 TEXT NOT NULL DEFAULT 'SH6',
    locality TEXT NOT NULL DEFAULT 'Manganpur',
    district TEXT NOT NULL DEFAULT 'Purba Bardhaman',
    state TEXT NOT NULL DEFAULT 'West Bengal',
    pincode TEXT NOT NULL DEFAULT '741319',
    google_maps_url TEXT NOT NULL DEFAULT 'https://maps.app.goo.gl/PKaiVVLFb8NooDhw6',
    phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR STORE TABLES
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- CATEGORIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Insert Categories" ON public.categories;
CREATE POLICY "Admin Insert Categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Categories" ON public.categories;
CREATE POLICY "Admin Update Categories" ON public.categories
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Categories" ON public.categories;
CREATE POLICY "Admin Delete Categories" ON public.categories
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- COMPANIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Companies" ON public.companies;
CREATE POLICY "Public Read Companies" ON public.companies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Insert Companies" ON public.companies;
CREATE POLICY "Admin Insert Companies" ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Companies" ON public.companies;
CREATE POLICY "Admin Update Companies" ON public.companies
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Companies" ON public.companies;
CREATE POLICY "Admin Delete Companies" ON public.companies
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PRODUCTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Insert Products" ON public.products;
CREATE POLICY "Admin Insert Products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Products" ON public.products;
CREATE POLICY "Admin Update Products" ON public.products
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;
CREATE POLICY "Admin Delete Products" ON public.products
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- SHOP SETTINGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Shop Settings" ON public.shop_settings;
CREATE POLICY "Public Read Shop Settings" ON public.shop_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Upsert Shop Settings" ON public.shop_settings;
CREATE POLICY "Admin Upsert Shop Settings" ON public.shop_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==============================================================================
-- 5. POSTGRES TABLE & FUNCTION LEVEL PERMISSIONS (GRANTS)
-- ==============================================================================
-- In PostgreSQL, standard table-level permissions (GRANT) are required in addition
-- to Row Level Security (RLS) policies.
-- If GRANT statements are missing, PostgreSQL terminates with "permission denied for table products"
-- before RLS policies can even be evaluated.
-- RLS remains fully enabled and strictly enforces admin-only writes.

-- Grant schema usage to public roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Anon can read public storefront catalog tables
GRANT SELECT ON public.categories, public.companies, public.products, public.shop_settings TO anon;

-- Authenticated users have table-level access; RLS policies strictly gate mutations to public.is_admin()
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.companies, public.products, public.shop_settings TO authenticated;

-- Authenticated users can read their own role assignment from public.user_roles (enforced by RLS)
GRANT SELECT ON public.user_roles TO authenticated;

-- Grant execution of the admin check function to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;


-- ==============================================================================
-- 6. SUPABASE STORAGE (PRODUCT IMAGES BUCKET & RLS)
-- ==============================================================================

-- Create bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view product images
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Only verified administrators can upload images
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
CREATE POLICY "Admin Upload Product Images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Only verified administrators can replace or update images
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
CREATE POLICY "Admin Update Product Images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

-- Only verified administrators can delete images
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
CREATE POLICY "Admin Delete Product Images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());


-- ==============================================================================
-- 7. SEED INITIAL STARTER DATA
-- ==============================================================================

-- [TO BE VERIFIED BY SHOP OWNER]:
-- The brand partner descriptions below are illustrative starter placeholders.
-- Verify with Sri Asoke Kumar Das and update freely via the Admin Dashboard.
INSERT INTO public.companies (name, slug, description)
VALUES 
    ('JJU Ultra', 'jju-ultra', 'Manufacturer of modular wiring accessories, conduits, and electrical fittings.'),
    ('Pritam', 'pritam', 'Brand partner for copper wires, energy-efficient lighting, and switchgear.')
ON CONFLICT (slug) DO NOTHING;

-- Initial Electrical Categories
INSERT INTO public.categories (name, slug, description, icon_name)
VALUES
    ('Switches & Sockets', 'switches-sockets', 'Modular switches, multi-pin shuttered sockets, fan step regulators, and cover plates.', 'Zap'),
    ('Wires & Cables', 'wires-cables', 'Flame-retardant (FR) multi-strand copper house wires and heavy-duty industrial cables.', 'Cable'),
    ('Lighting & Luminaires', 'lighting-luminaires', 'Energy-saving LED battens, high-lumen bulbs, slim panel downlights, and outdoor fixtures.', 'Lightbulb'),
    ('Switchgear & Protection', 'switchgear-protection', 'Miniature circuit breakers (MCBs), isolators, changeover switches, and distribution boxes.', 'ShieldCheck'),
    ('Fans & Ventilation', 'fans-ventilation', 'Aerodynamic ceiling fans, heavy-duty exhaust fans, wall fans, and electronic regulators.', 'Fan'),
    ('Pipes & Accessories', 'pipes-accessories', 'Rigid PVC conduit pipes, bend elbows, junction boxes, casing-capping, and insulation tape.', 'Wrench')
ON CONFLICT (slug) DO NOTHING;

-- [TO BE VERIFIED BY SHOP OWNER]:
-- Address and PIN code (SH6, Manganpur, Purba Bardhaman 741319) originate from the public Google Maps listing.
-- Verify exact shop details and update phone number in Admin Dashboard Settings.
INSERT INTO public.shop_settings (id, shop_name, owner_name, address_line1, locality, district, state, pincode, google_maps_url, phone)
VALUES ('default', 'Desh Electric', 'ASOKE KUMAR DAS', 'SH6', 'Manganpur', 'Purba Bardhaman', 'West Bengal', '741319', 'https://maps.app.goo.gl/PKaiVVLFb8NooDhw6', NULL)
ON CONFLICT (id) DO UPDATE
SET shop_name = EXCLUDED.shop_name,
    owner_name = EXCLUDED.owner_name,
    google_maps_url = EXCLUDED.google_maps_url;


-- ==============================================================================
-- 8. HOW TO GRANT ADMINISTRATOR ACCESS (RUN IN SUPABASE SQL EDITOR)
-- ==============================================================================
-- Step 1: Create or invite your administrator user in Supabase:
--         Authentication -> Users -> "Add User" (or "Invite User").
--
-- Step 2: Run ONE of the following queries to assign the 'admin' role:
--
-- Option A: Grant by Email (Recommended):
-- ---------------------------------------
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'YOUR_EMAIL@EXAMPLE.COM'
-- ON CONFLICT (user_id, role) DO NOTHING;
--
-- Option B: Grant by User UUID:
-- ------------------------------
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('paste-user-uuid-here', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
-- ==============================================================================
