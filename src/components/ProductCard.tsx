import { useState } from 'react';
import { Tag, Building2, Info, Check, X, ShieldAlert } from 'lucide-react';
import type { Category, Company, Product } from '../types';
import { CATEGORIES, COMPANIES } from '../data/mockData';
import { SHOP_INFO } from '../utils/constants';

interface ProductCardProps {
  product: Product;
  /** Live categories from Supabase — falls back to mock data if not provided */
  categories?: Category[];
  /** Live companies from Supabase — falls back to mock data if not provided */
  companies?: Company[];
}

export function ProductCard({ product, categories, companies }: ProductCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Prefer live Supabase data; fall back to static mock arrays for demo products
  const allCategories = (categories && categories.length > 0) ? categories : CATEGORIES;
  const allCompanies = (companies && companies.length > 0) ? companies : COMPANIES;

  const category = allCategories.find((c) => c.id === product.categoryId);
  const company = allCompanies.find((c) => c.id === product.companyId);

  return (
    <>
      <div className="product-card">
        {/* Card Header Badges */}
        <div className="product-card-header">
          <div className="product-tags-left">
            {category && (
              <span className="badge-category-mini">
                <Tag size={12} />
                {category.name}
              </span>
            )}
            {company && (
              <span className="badge-company-mini">
                <Building2 size={12} />
                {company.name}
              </span>
            )}
          </div>
          <span className="badge-demo-flag" title="Strictly for illustrative demo purposes">
            DEMO ITEM
          </span>
        </div>

        {/* Product Visual / Icon Area — shows real image if available, else decorative placeholder */}
        <div className="product-visual-box">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={(e) => {
                // If the image URL is broken, hide it and let the placeholder show
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="product-silhouette"
            style={product.imageUrl ? { display: 'none' } : undefined}
          >
            <span className="product-brand-stamp">{company?.name || 'DESH'}</span>
          </div>
          {!product.imageUrl && (
            <span className="demo-visual-notice">Illustrative Demo Display</span>
          )}
        </div>

        {/* Product Details */}
        <div className="product-card-body">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-desc">{product.description}</p>

          {/* Quick Specifications Preview */}
          {product.specifications && (
            <div className="product-specs-preview">
              {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
                <div key={key} className="spec-row">
                  <span className="spec-key">{key}:</span>
                  <span className="spec-val">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Demo Pricing Block */}
          <div className="demo-price-block">
            <div className="demo-price-row">
              <span className="demo-price-label">Demo Price:</span>
              <span className="demo-price-val">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="demo-asterisk">*</span>
            </div>
            <span className="demo-price-subtext">*Illustrative demo price. Check in-store for live rates.</span>
          </div>
        </div>

        {/* Card Footer: Store Inquiry CTA */}
        <div className="product-card-footer">
          <button
            type="button"
            className="btn-product-details"
            onClick={() => setShowDetailsModal(true)}
            aria-label={`View details for ${product.name}`}
          >
            <Info size={16} />
            <span>Specifications & Details</span>
          </button>
          <a
            href="#location"
            className="btn-product-inquire"
            title="Visit store to check current stock"
          >
            <Check size={14} />
            <span>Inquire in Store</span>
          </a>
        </div>
      </div>

      {/* Product Details Modal (Purely Informational - No Checkout) */}
      {showDetailsModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${product.id}`}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <span className="modal-demo-badge">DEMO CATALOG ITEM</span>
                <h3 id={`modal-title-${product.id}`} className="modal-title">
                  {product.name}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Demo Notice Warning Box */}
              <div className="demo-warning-banner">
                <ShieldAlert size={20} className="warning-icon" />
                <div>
                  <strong>Illustrative Demo Product:</strong>
                  <p>
                    This item is part of the digital catalog demonstration for {SHOP_INFO.name}.
                    Real-time stock, actual manufacturer models, and current retail prices are available
                    directly at our physical shop at SH6, Manganpur.
                  </p>
                </div>
              </div>

              <div className="modal-section">
                <h4>Description</h4>
                <p>{product.description}</p>
              </div>

              {product.specifications && (
                <div className="modal-section">
                  <h4>Technical Specifications</h4>
                  <div className="specs-table">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="table-row">
                        <span className="table-cell table-key">{key}</span>
                        <span className="table-cell table-val">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-section modal-price-section">
                <div>
                  <span className="price-label">Illustrative Demo Price</span>
                  <div className="price-big">₹{product.price.toLocaleString('en-IN')}</div>
                  <span className="price-note">
                    Not a confirmed quotation. In-store rates may vary based on market material costs.
                  </span>
                </div>
                <div className="modal-brand-badge">
                  <span>Manufacturer: <strong>{company?.name}</strong></span>
                  <span>Category: <strong>{category?.name}</strong></span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <a
                href="#location"
                className="btn-modal-visit"
                onClick={() => setShowDetailsModal(false)}
              >
                Find Desh Electric on Map
              </a>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
