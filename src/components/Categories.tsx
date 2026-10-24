import { ArrowRight, Layers } from 'lucide-react';
import { CATEGORIES, DEMO_PRODUCTS } from '../data/mockData';
import { CategoryIcon } from './CategoryIcon';

import type { Category, Product } from '../types';

interface CategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categories?: Category[];
  products?: Product[];
}

export function Categories({
  selectedCategory,
  onSelectCategory,
  categories,
  products,
}: CategoriesProps) {
  const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const activeProducts = products && products.length > 0 ? products : DEMO_PRODUCTS;

  const handleCategoryClick = (categoryId: string) => {
    // Toggle if already selected, or select and scroll
    if (selectedCategory === categoryId) {
      onSelectCategory(null);
    } else {
      onSelectCategory(categoryId);
      const target = document.getElementById('products');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section id="categories" className="categories-section" aria-label="Product Categories">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <Layers size={14} className="pill-icon" />
            <span>Product Catalog</span>
          </div>
          <h2 className="section-title">Explore by Electrical Category</h2>
          <p className="section-subtitle">
            From essential modular switches and heat-resistant cables to energy-saving luminaires and circuit protection switchgear.
          </p>
        </div>

        <div className="categories-grid">
          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const itemCount = activeProducts.filter((p) => p.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                className={`category-card ${isSelected ? 'category-card-active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(cat.id);
                  }
                }}
                aria-pressed={isSelected}
              >
                <div className="category-header">
                  <div className="category-icon-wrapper">
                    <CategoryIcon name={cat.iconName} size={28} className="cat-icon" />
                  </div>
                  <span className="category-count">{itemCount} Demo Items</span>
                </div>

                <h3 className="category-name">{cat.name}</h3>
                <p className="category-description">{cat.description}</p>

                <div className="category-action">
                  <span className="action-text">
                    {isSelected ? 'Viewing Category' : 'Browse Products'}
                  </span>
                  <ArrowRight size={16} className="action-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
