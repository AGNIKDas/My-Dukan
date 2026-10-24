import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Zap, Building2, Package, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { CATEGORIES, COMPANIES, DEMO_PRODUCTS } from '../data/mockData';
import { SHOP_INFO } from '../utils/constants';

const SHOP_INTERIOR_IMG = '/images/desh-electric-shop.png';

import type { Category, Company, Product } from '../types';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectCompany: (companyId: string | null) => void;
  onSearchSubmit: (query: string) => void;
  categories?: Category[];
  companies?: Company[];
  products?: Product[];
}

interface SuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'category' | 'company';
  price?: number;
  refId: string;
}

export function Hero({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectCompany,
  onSearchSubmit,
  categories,
  companies,
  products,
}: HeroProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const activeCompanies = companies && companies.length > 0 ? companies : COMPANIES;
  const activeProducts = products !== undefined && products.length > 0 ? products : DEMO_PRODUCTS;

  // Compute live client-side suggestions with useMemo
  const suggestions = useMemo<SuggestionItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return [];
    }

    const matches: SuggestionItem[] = [];

    // 1. Categories matching query
    for (const cat of activeCategories) {
      if (cat.name.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q)) {
        matches.push({
          id: `cat-${cat.id}`,
          title: cat.name,
          subtitle: 'Product Category',
          type: 'category',
          refId: cat.id,
        });
      }
    }

    // 2. Companies matching query
    for (const comp of activeCompanies) {
      if (comp.name.toLowerCase().includes(q) || comp.description?.toLowerCase().includes(q)) {
        matches.push({
          id: `comp-${comp.id}`,
          title: comp.name,
          subtitle: 'Featured Brand Partner',
          type: 'company',
          refId: comp.id,
        });
      }
    }

    // 3. Products matching query
    for (const prod of activeProducts) {
      if (
        prod.name.toLowerCase().includes(q) ||
        prod.description?.toLowerCase().includes(q)
      ) {
        matches.push({
          id: `prod-${prod.id}`,
          title: prod.name,
          subtitle: 'Product Item',
          type: 'product',
          price: prod.price,
          refId: prod.id,
        });
      }
    }

    return matches.slice(0, 7);
  }, [searchQuery, activeCategories, activeCompanies, activeProducts]);


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleClear = () => {
    onSearchChange('');
    setIsDropdownOpen(false);
  };

  const handleSuggestionClick = (item: SuggestionItem) => {
    setIsDropdownOpen(false);
    if (item.type === 'category') {
      onSelectCategory(item.refId);
      onSelectCompany(null);
      onSearchChange('');
    } else if (item.type === 'company') {
      onSelectCompany(item.refId);
      onSelectCategory(null);
      onSearchChange('');
    } else {
      // product
      onSearchChange(item.title);
      onSearchSubmit(item.title);
    }

    // Smooth scroll to product showcase section
    const target = document.getElementById('products');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    onSearchSubmit(searchQuery);
    const target = document.getElementById('products');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChipClick = (term: string, type: 'category' | 'company' | 'text', refId?: string) => {
    if (type === 'category' && refId) {
      onSelectCategory(refId);
      onSelectCompany(null);
      onSearchChange('');
    } else if (type === 'company' && refId) {
      onSelectCompany(refId);
      onSelectCategory(null);
      onSearchChange('');
    } else {
      onSearchChange(term);
      onSearchSubmit(term);
    }
    const target = document.getElementById('products');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="hero-section" aria-label="Welcome to Desh Electric">
      <div className="container hero-container">
        {/* Left Column: Headlines & Search */}
        <div className="hero-content">
          <div className="hero-badge-group">
            <span className="hero-tag">
              <Zap size={14} className="tag-bolt-icon" />
              Verified Electrical Store
            </span>
            <span className="hero-location-pill">SH6 • Manganpur</span>
          </div>

          <h1 className="hero-title">
            Powering Your Projects with <span className="highlight-text">Genuine Electricals</span>
          </h1>

          <p className="hero-description">
            Welcome to <strong>{SHOP_INFO.name}</strong>, owned and operated by{' '}
            <strong>{SHOP_INFO.owner}</strong>. Providing dependable electrical wiring, switches,
            switchgear, and illumination products for homes, electricians, and contractors in Manganpur
            and across Purba Bardhaman.
          </p>

          {/* Prominent Search Bar with Live Suggestions */}
          <div className="search-wrapper" ref={searchContainerRef}>
            <form onSubmit={handleSubmit} className="search-form" role="search">
              <div className="search-input-box">
                <Search className="search-icon" size={20} aria-hidden="true" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search demo switches, cables, LED lighting, JJU Ultra, Pritam..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  aria-label="Search demo products, categories, or companies"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions"
                  aria-expanded={isDropdownOpen && suggestions.length > 0}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={handleClear}
                    aria-label="Clear search query"
                  >
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="search-submit-btn">
                  <span>Search</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Live Client-Side Suggestions Dropdown */}
            {isDropdownOpen && (
              <div id="search-suggestions" className="suggestions-dropdown" role="listbox">
                {suggestions.length > 0 ? (
                  <ul className="suggestions-list">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        role="option"
                        aria-selected={false}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <div className="suggestion-icon-col">
                          {item.type === 'category' ? (
                            <Tag size={16} className="sugg-icon icon-cat" />
                          ) : item.type === 'company' ? (
                            <Building2 size={16} className="sugg-icon icon-comp" />
                          ) : (
                            <Package size={16} className="sugg-icon icon-prod" />
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-title">{item.title}</span>
                          <span className="suggestion-subtitle">{item.subtitle}</span>
                        </div>
                        <div className="suggestion-badge-col">
                          {item.type === 'product' && item.price !== undefined ? (
                            <span className="badge-demo-price">Demo ₹{item.price}</span>
                          ) : (
                            <span className={`badge-pill badge-${item.type}`}>
                              {item.type === 'category' ? 'Category' : 'Brand'}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="suggestions-empty">
                    <p>No demo items matching "<strong>{searchQuery}</strong>".</p>
                    <span className="empty-sub">
                      Visit our physical store on SH6, Manganpur for our full live inventory.
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="quick-chips">
              <span className="quick-label">Try searching:</span>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleChipClick('Switches & Sockets', 'category', 'cat-switches')}
              >
                Modular Switches
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleChipClick('Wires & Cables', 'category', 'cat-wires')}
              >
                Copper Wires
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleChipClick('JJU Ultra', 'company', 'jju-ultra')}
              >
                JJU Ultra
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleChipClick('Pritam', 'company', 'pritam')}
              >
                Pritam
              </button>
            </div>
          </div>

          {/* Value Props / Confidence Badges */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <ShieldCheck size={18} className="trust-icon" />
              <span>100% Genuine Supplies</span>
            </div>
            <div className="trust-item">
              <Zap size={18} className="trust-icon" />
              <span>Certified ISI Standards</span>
            </div>
            <div className="trust-item">
              <Building2 size={18} className="trust-icon" />
              <span>Direct In-Store Pickup</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Store Showcase */}
        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src={SHOP_INTERIOR_IMG}
              alt="Authentic interior view of Desh Electric shop in Manganpur, showing shelves stocked with electrical accessories, wires, switches, and fixtures"
              className="hero-store-img"
              loading="eager"
            />
            <div className="image-overlay-glow" aria-hidden="true" />
            
            {/* Floating Glass Badge */}
            <div className="floating-info-card">
              <div className="floating-icon-wrap">
                <Zap size={18} className="floating-bolt" />
              </div>
              <div className="floating-text">
                <span className="floating-title">{SHOP_INFO.name}</span>
                <span className="floating-address">SH6, Manganpur, Purba Bardhaman</span>
                <span className="floating-demo-tag">Actual Shop Interior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
