import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Menu, X, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { SHOP_INFO } from '../utils/constants';

interface HeaderProps {
  onNavigate?: (sectionId: string) => void;
  phone?: string | null;
}

export function Header({ onNavigate, phone }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activePhone = phone || SHOP_INFO.phone;


  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        {/* Brand Logo & Title */}
        <a
          href="#home"
          className="brand-link"
          onClick={() => handleNavClick('home')}
          aria-label="Desh Electric - Home"
        >
          <div className="brand-icon-wrapper" aria-hidden="true">
            <Zap className="brand-bolt-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">{SHOP_INFO.name}</span>
            <span className="brand-subline">Manganpur • Purba Bardhaman</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            <li>
              <a
                href="#home"
                className="nav-link"
                onClick={() => handleNavClick('home')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#categories"
                className="nav-link"
                onClick={() => handleNavClick('categories')}
              >
                Categories
              </a>
            </li>
            <li>
              <a
                href="#products"
                className="nav-link"
                onClick={() => handleNavClick('products')}
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="#companies"
                className="nav-link"
                onClick={() => handleNavClick('companies')}
              >
                Companies
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="nav-link"
                onClick={() => handleNavClick('about')}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#location"
                className="nav-link"
                onClick={() => handleNavClick('location')}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Action Button: Quick Location & Admin Portal */}
        <div className="header-actions">
          {activePhone && (
            <a
              href={`tel:${activePhone}`}
              className="btn-header-call"
              title={`Call Desh Electric at ${activePhone}`}
            >
              <Phone size={15} aria-hidden="true" />
              <span>Call Shop</span>
            </a>
          )}

          <a
            href="#location"
            className="btn-store-location"
            onClick={() => handleNavClick('location')}
            title="View Shop Location & Directions"
          >
            <MapPin size={16} aria-hidden="true" />
            <span>Store Location</span>
          </a>

          <Link
            to="/admin"
            className="btn-header-admin"
            title="Administrator Portal"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Admin</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              <li>
                <a
                  href="#home"
                  className="mobile-nav-link"
                  onClick={() => handleNavClick('home')}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#categories"
                  className="mobile-nav-link"
                  onClick={() => handleNavClick('categories')}
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className="mobile-nav-link"
                  onClick={() => handleNavClick('products')}
                >
                  Products (Demo)
                </a>
              </li>
              <li>
                <a
                  href="#companies"
                  className="mobile-nav-link"
                  onClick={() => handleNavClick('companies')}
                >
                  Companies
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="mobile-nav-link"
                  onClick={() => handleNavClick('about')}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#location"
                  className="mobile-nav-link"
                  onClick={() => handleNavClick('location')}
                >
                  Contact & Location
                </a>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="mobile-nav-link mobile-nav-link-admin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Admin Dashboard</span>
                </Link>
              </li>
            </ul>


            <div className="mobile-drawer-footer">
              <a
                href={SHOP_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map-full"
              >
                <MapPin size={16} aria-hidden="true" />
                <span>Open in Google Maps</span>
              </a>
              <p className="mobile-drawer-owner">
                Proprietor: <strong>{SHOP_INFO.owner}</strong>
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
