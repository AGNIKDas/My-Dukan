import { AlertTriangle, Tag, Building2, X, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Category, Company, Product } from '../types';
import { CATEGORIES, COMPANIES, DEMO_PRODUCTS } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { SHOP_INFO } from '../utils/constants';

interface ProductBrowserProps {
  searchQuery: string;
  selectedCategory: string | null;
  selectedCompany: string | null;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectCompany: (companyId: string | null) => void;
  onResetAllFilters: () => void;
  products?: Product[];
  categories?: Category[];
  companies?: Company[];
  isLiveCatalog?: boolean;
}

export function ProductBrowser({
  searchQuery,
  selectedCategory,
  selectedCompany,
  onSearchChange,
  onSelectCategory,
  onSelectCompany,
  onResetAllFilters,
  products,
  categories,
  companies,
  isLiveCatalog = false,
}: ProductBrowserProps) {
  const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const activeCompanies = companies && companies.length > 0 ? companies : COMPANIES;
  const activeProducts = products !== undefined ? products : DEMO_PRODUCTS;

  // Filter products based on active criteria
  const filteredProducts: Product[] = activeProducts.filter((product) => {
    // 1. Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = product.name.toLowerCase().includes(q);
      const matchesDesc = product.description?.toLowerCase().includes(q) ?? false;
      const categoryName = activeCategories.find((c) => c.id === product.categoryId)?.name.toLowerCase() || '';
      const companyName = activeCompanies.find((c) => c.id === product.companyId)?.name.toLowerCase() || '';
      const matchesMeta = categoryName.includes(q) || companyName.includes(q);

      if (!matchesName && !matchesDesc && !matchesMeta) {
        return false;
      }
    }

    // 2. Category match
    if (selectedCategory && product.categoryId !== selectedCategory) {
      return false;
    }

    // 3. Company match
    if (selectedCompany && product.companyId !== selectedCompany) {
      return false;
    }

    return true;
  });

  const activeCategoryObj = activeCategories.find((c) => c.id === selectedCategory);
  const activeCompanyObj = activeCompanies.find((c) => c.id === selectedCompany);
  const hasActiveFilters = Boolean(searchQuery || selectedCategory || selectedCompany);

  return (
    <section id="products" className="products-section" aria-label="Featured Products">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-pill">
            <Tag size={14} className="pill-icon" />
            <span>{isLiveCatalog ? 'Live Store Catalog' : 'Sample Product Showcase'}</span>
          </div>
          <h2 className="section-title">
            {isLiveCatalog ? 'Desh Electric Verified Inventory' : 'Featured Electrical Supplies'}
          </h2>
          <p className="section-subtitle">
            {isLiveCatalog
              ? 'Real-time catalog managed directly by shop owner Asoke Kumar Das.'
              : 'Explore sample items across our core product categories. Browse by category or company below.'}
          </p>
        </div>

        {/* DEMO NOTICE OR LIVE NOTICE CALLOUT BANNER */}
        {isLiveCatalog ? (
          <div className="live-catalog-callout" role="note">
            <div className="callout-icon-box">
              <ShieldCheck className="callout-icon" size={24} />
            </div>
            <div className="callout-text">
              <h3 className="callout-heading">⚡ Verified Store Catalog — Desh Electric</h3>
              <p className="callout-body">
                The items, specifications, and prices below represent genuine stock recorded in our shop database. All purchases and physical inspections occur in-person at our physical store at <strong>SH6, Manganpur, Purba Bardhaman</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="demo-disclaimer-callout" role="note">
            <div className="callout-icon-box">
              <AlertTriangle className="callout-icon" size={24} />
            </div>
            <div className="callout-text">
              <h3 className="callout-heading">⚡ Important Demo Notice — Not Live In-Store Stock</h3>
              <p className="callout-body">
                All items, technical specifications, and prices presented below are <strong>strictly illustrative demo examples</strong> created to demonstrate the web interface for {SHOP_INFO.name}. Desh Electric operates exclusively as an in-person retail store. We do not offer online checkout, delivery, or automated stock reservations. Please visit our shop on <strong>SH6, Manganpur, Purba Bardhaman</strong> to view our confirmed inventory, verify specifications, and make direct purchases.
              </p>
            </div>
          </div>
        )}

        {/* Browse by Category Tabs */}
        <div className="browse-controls-wrapper">
          <div className="browse-row">
            <span className="browse-row-label">Browse by Category:</span>
            <div className="browse-pills-list" role="tablist" aria-label="Browse by Category">
              <button
                type="button"
                className={`browse-pill ${selectedCategory === null ? 'browse-pill-active' : ''}`}
                onClick={() => onSelectCategory(null)}
                role="tab"
                aria-selected={selectedCategory === null}
              >
                All Categories
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`browse-pill ${selectedCategory === cat.id ? 'browse-pill-active' : ''}`}
                  onClick={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}
                  role="tab"
                  aria-selected={selectedCategory === cat.id}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Browse by Company Pills */}
          <div className="browse-row">
            <span className="browse-row-label">Browse by Brand:</span>
            <div className="browse-pills-list" role="tablist" aria-label="Browse by Brand">
              <button
                type="button"
                className={`browse-pill ${selectedCompany === null ? 'browse-pill-active' : ''}`}
                onClick={() => onSelectCompany(null)}
                role="tab"
                aria-selected={selectedCompany === null}
              >
                All Brands
              </button>
              {activeCompanies.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  className={`browse-pill ${selectedCompany === comp.id ? 'browse-pill-active' : ''}`}
                  onClick={() => onSelectCompany(selectedCompany === comp.id ? null : comp.id)}
                  role="tab"
                  aria-selected={selectedCompany === comp.id}
                >
                  <Building2 size={13} className="pill-brand-icon" />
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Active Filters Bar & Result Count */}
        <div className="results-status-bar">
          <div className="results-count">
            Showing <strong>{filteredProducts.length}</strong> illustrative demo{' '}
            {filteredProducts.length === 1 ? 'item' : 'items'}
          </div>

          {hasActiveFilters && (
            <div className="active-filters-chips">
              <span className="chips-label">Active Filters:</span>
              {searchQuery && (
                <span className="filter-chip">
                  Search: "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Remove search filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeCategoryObj && (
                <span className="filter-chip">
                  Category: {activeCategoryObj.name}
                  <button
                    type="button"
                    onClick={() => onSelectCategory(null)}
                    aria-label="Remove category filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeCompanyObj && (
                <span className="filter-chip">
                  Brand: {activeCompanyObj.name}
                  <button
                    type="button"
                    onClick={() => onSelectCompany(null)}
                    aria-label="Remove brand filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                className="btn-clear-all"
                onClick={onResetAllFilters}
              >
                <RefreshCw size={12} />
                <span>Reset All</span>
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={activeCategories}
                companies={activeCompanies}
              />
            ))}
          </div>
        ) : (
          <div className="no-products-state">
            <div className="no-products-icon">
              <AlertTriangle size={36} />
            </div>
            <h3>No Demo Products Found</h3>
            <p>
              No demo products match your current selection. Try selecting "All Categories" and "All Brands" or reset your search.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={onResetAllFilters}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
