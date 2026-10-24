import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { Companies } from '../components/Companies';
import { ProductBrowser } from '../components/ProductBrowser';
import { About } from '../components/About';
import { LocationSection } from '../components/LocationSection';
import { Footer } from '../components/Footer';
import { getCategories, getCompanies, getProducts, getShopSettings } from '../lib/supabase';
import type { Category, Company, Product } from '../types';

export function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Dynamic Storefront Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [phone, setPhone] = useState<string | null>(null);
  const [isLiveCatalog, setIsLiveCatalog] = useState(false);

  useEffect(() => {
    async function loadStorefrontData() {
      try {
        const [cats, comps, prodsRes, settings] = await Promise.all([
          getCategories(),
          getCompanies(),
          getProducts(),
          getShopSettings(),
        ]);

        setCategories(cats);
        setCompanies(comps);
        setProducts(prodsRes.products);
        setIsLiveCatalog(prodsRes.isLive);
        if (settings.phone) {
          setPhone(settings.phone);
        }
      } catch (err) {
        console.warn('Could not load dynamic storefront data, using fallback data:', err);
      }
    }

    loadStorefrontData();
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSelectCompany = (companyId: string | null) => {
    setSelectedCompany(companyId);
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedCompany(null);
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-layout">
      <Header onNavigate={handleNavigate} phone={phone} />
      <main id="main-content">
        <Hero
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSelectCategory={handleSelectCategory}
          onSelectCompany={handleSelectCompany}
          onSearchSubmit={handleSearchSubmit}
          categories={categories}
          companies={companies}
          products={products}
        />
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          categories={categories}
          products={products}
        />
        <Companies
          selectedCompany={selectedCompany}
          onSelectCompany={handleSelectCompany}
          companies={companies}
          products={products}
        />
        <ProductBrowser
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedCompany={selectedCompany}
          onSearchChange={handleSearchChange}
          onSelectCategory={handleSelectCategory}
          onSelectCompany={handleSelectCompany}
          onResetAllFilters={handleResetAllFilters}
          products={products}
          categories={categories}
          companies={companies}
          isLiveCatalog={isLiveCatalog}
        />
        <About />
        <LocationSection phone={phone} />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
