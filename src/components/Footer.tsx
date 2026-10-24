import { Zap, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { SHOP_INFO } from '../utils/constants';

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleNavClick = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-container">
        <div className="footer-top-grid">
          {/* Brand & Overview Column */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <div className="footer-bolt-wrap">
                <Zap size={20} className="footer-bolt" />
              </div>
              <span className="footer-brand-title">{SHOP_INFO.name}</span>
            </div>
            <p className="footer-brand-desc">
              Your dependable neighborhood store for certified domestic, commercial, and industrial electrical supplies.
            </p>
            <div className="footer-proprietor-pill">
              <ShieldCheck size={14} />
              <span>Proprietor: <strong>{SHOP_INFO.owner}</strong></span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="footer-col footer-col-nav">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#home" onClick={() => handleNavClick('home')}>
                  Home
                </a>
              </li>
              <li>
                <a href="#categories" onClick={() => handleNavClick('categories')}>
                  Product Categories
                </a>
              </li>
              <li>
                <a href="#products" onClick={() => handleNavClick('products')}>
                  Featured Demo Products
                </a>
              </li>
              <li>
                <a href="#companies" onClick={() => handleNavClick('companies')}>
                  Brand Partners (JJU Ultra, Pritam)
                </a>
              </li>
              <li>
                <a href="#about" onClick={() => handleNavClick('about')}>
                  About Sri Asoke Kumar Das
                </a>
              </li>
              <li>
                <a href="#location" onClick={() => handleNavClick('location')}>
                  Location & Directions
                </a>
              </li>
            </ul>
          </div>

          {/* Location & Directions Column */}
          <div className="footer-col footer-col-address">
            <h4 className="footer-col-title">Store Address</h4>
            <div className="footer-address-details">
              <p><strong>{SHOP_INFO.name}</strong></p>
              <p>{SHOP_INFO.address.line1} (State Highway 6)</p>
              <p>{SHOP_INFO.address.locality}, {SHOP_INFO.address.district}</p>
              <p>{SHOP_INFO.address.state} — PIN {SHOP_INFO.address.pincode}</p>
            </div>

            <div className="footer-maps-cta">
              <a
                href={SHOP_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-maps-link"
              >
                <MapPin size={16} />
                <span>Find Us on Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Clear Demo Notice Disclaimer in Footer */}
        <div className="footer-disclaimer-box">
          <p className="footer-disclaimer-text">
            <strong>Website Notice:</strong> This web presence is an illustrative digital showcase designed for {SHOP_INFO.name}. All products, specifications, and prices displayed are demo representations. We do not provide online sales, payments, or automated shipping. Real inventory purchases and queries must be made in person at our physical store at SH6, Manganpur, West Bengal.
          </p>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © {CURRENT_YEAR} <strong>{SHOP_INFO.name}</strong>. Owned by <strong>{SHOP_INFO.owner}</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
}
