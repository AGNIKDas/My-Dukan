import { Building2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { COMPANIES, DEMO_PRODUCTS } from '../data/mockData';

import type { Company, Product } from '../types';

interface CompaniesProps {
  selectedCompany: string | null;
  onSelectCompany: (companyId: string | null) => void;
  companies?: Company[];
  products?: Product[];
}

export function Companies({
  selectedCompany,
  onSelectCompany,
  companies,
  products,
}: CompaniesProps) {
  const activeCompanies = companies && companies.length > 0 ? companies : COMPANIES;
  const activeProducts = products && products.length > 0 ? products : DEMO_PRODUCTS;

  const handleCompanyClick = (companyId: string) => {
    if (selectedCompany === companyId) {
      onSelectCompany(null);
    } else {
      onSelectCompany(companyId);
      const target = document.getElementById('products');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getCompanyHighlights = (companyId: string) => {
    if (companyId === 'jju-ultra') {
      return [
        'Modular Switches & Heavy-Duty Sockets',
        'Impact-Resistant PVC Conduit Systems',
        'Fire-Retardant Polycarbonate Construction',
      ];
    }
    return [
      '100% Electrolytic Copper House Wires',
      'Double Pole (DP) MCBs & Isolators',
      'High-Lumen Energy Efficient LED Battens',
    ];
  };

  return (
    <section id="companies" className="companies-section" aria-label="Partner Companies">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <Building2 size={14} className="pill-icon" />
            <span>Brand Partners</span>
          </div>
          <h2 className="section-title">Initial Featured Brands</h2>
          <p className="section-subtitle">
            Highlighting our example partner brands known for safety, durability, and compliance with Indian electrical standards.
          </p>
        </div>

        <div className="companies-grid">
          {activeCompanies.map((company) => {
            const isSelected = selectedCompany === company.id;
            const productCount = activeProducts.filter((p) => p.companyId === company.id).length;
            const highlights = getCompanyHighlights(company.id);

            return (
              <div
                key={company.id}
                className={`company-card ${isSelected ? 'company-card-active' : ''}`}
              >
                <div className="company-card-top">
                  <div className="company-badge-row">
                    <span className="brand-tier-tag">
                      <ShieldCheck size={13} />
                      Verified Partner
                    </span>
                    <span className="company-demo-count">{productCount} Demo Products</span>
                  </div>

                  <div className="company-brand-header">
                    <div className="company-monogram-badge">
                      <span>{company.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="company-name">{company.name}</h3>
                      <span className="company-category-tag">Electrical Hardware & Components</span>
                    </div>
                  </div>

                  <p className="company-description">{company.description}</p>

                  <div className="company-features-list">
                    {highlights.map((feat, idx) => (
                      <div key={idx} className="feature-item">
                        <CheckCircle2 size={15} className="feature-check" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="company-card-bottom">
                  <button
                    type="button"
                    className={`btn-browse-company ${isSelected ? 'btn-browse-company-active' : ''}`}
                    onClick={() => handleCompanyClick(company.id)}
                    aria-pressed={isSelected}
                  >
                    <span>
                      {isSelected ? `Viewing ${company.name} Products` : `Browse ${company.name} Products`}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
