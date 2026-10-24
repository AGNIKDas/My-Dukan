import { UserCheck, ShieldCheck, HeartHandshake, Award, MapPin } from 'lucide-react';
import { SHOP_INFO } from '../utils/constants';

export function About() {
  return (
    <section id="about" className="about-section" aria-label="About Desh Electric">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <UserCheck size={14} className="pill-icon" />
            <span>Store Leadership & Heritage</span>
          </div>
          <h2 className="section-title">About Desh Electric</h2>
          <p className="section-subtitle">
            A trusted local electrical retail enterprise serving Manganpur and the greater Purba Bardhaman district.
          </p>
        </div>

        <div className="about-grid">
          {/* Owner Profile Card */}
          <div className="owner-profile-card">
            <div className="owner-avatar-wrapper">
              <div className="owner-monogram">
                <span>AKD</span>
              </div>
              <div className="owner-status-badge">
                <Award size={14} />
                <span>Proprietor</span>
              </div>
            </div>

            <div className="owner-details">
              <h3 className="owner-name">{SHOP_INFO.owner}</h3>
              <p className="owner-role">Proprietor & Merchant</p>
              <div className="owner-shop-tag">
                <span>{SHOP_INFO.name}</span>
              </div>

              <div className="owner-location-snippet">
                <MapPin size={16} className="snippet-icon" />
                <span>SH6, Manganpur, Purba Bardhaman</span>
              </div>

              <div className="owner-quote-box">
                <p>
                  "Our mission is simple: provide every customer—whether an electrician wiring a new building or a homeowner fixing a switch—with genuine, certified electrical products that ensure absolute safety and long-lasting durability."
                </p>
              </div>
            </div>
          </div>

          {/* Story & Commitment Content */}
          <div className="about-narrative">
            <h3 className="narrative-heading">
              Serving the Community Along State Highway 6
            </h3>
            <p className="narrative-text">
              <strong>{SHOP_INFO.name}</strong> was established on State Highway 6 (SH6) in Manganpur, Purba Bardhaman, with a dedication to delivering quality electrical products to local communities, agricultural setups, and commercial buildings.
            </p>
            <p className="narrative-text">
              We specialize in dependable wiring cables, modular switch assemblies, circuit protection switchgear, and illumination fixtures. Located strategically on SH6, our store provides easy accessibility for electricians, contractors, and local residents seeking reliable electrical components without having to travel to distant urban centers.
            </p>

            {/* Core Values Pillars */}
            <div className="values-pillars-grid">
              <div className="value-pillar">
                <div className="pillar-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="pillar-title">100% Genuine Supplies</h4>
                  <p className="pillar-desc">
                    We prioritize electrical safety by dealing in authentic products from reputed brand partners.
                  </p>
                </div>
              </div>

              <div className="value-pillar">
                <div className="pillar-icon-box">
                  <HeartHandshake size={20} />
                </div>
                <div>
                  <h4 className="pillar-title">Honest Guidance</h4>
                  <p className="pillar-desc">
                    Personalized advice tailored to your wiring layout, load calculations, and home improvement plans.
                  </p>
                </div>
              </div>

              <div className="value-pillar">
                <div className="pillar-icon-box">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="pillar-title">Contractor Support</h4>
                  <p className="pillar-desc">
                    Reliable supply of pipes, gang boxes, heavy-duty switchgear, and coils for construction projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Real Shop Interior Showcase */}
            <div className="about-shop-showcase">
              <div className="about-shop-image-frame">
                <img
                  src="/images/desh-electric-shop.png"
                  alt="Real photo of Desh Electric shop interior on SH6, Manganpur, Purba Bardhaman showing shelves with electrical equipment, wires, and lighting"
                  className="about-shop-img"
                  loading="lazy"
                />
                <div className="about-shop-badge">
                  <MapPin size={14} className="badge-pin-icon" />
                  <span>Real Shop Interior • SH6, Manganpur</span>
                </div>
              </div>
              <p className="about-shop-caption">
                Inside <strong>{SHOP_INFO.name}</strong>: Shelves and counters stocked with modular switches, lighting accessories, ceiling fan boxes, and domestic wiring coils.
              </p>
            </div>

            <div className="about-notice-box">
              <p>
                <strong>In-Store Consultation:</strong> Sri Asoke Kumar Das personally attends to customer queries at our shop on SH6. Please visit our shop directly for product availability, bulk contractor requirements, and genuine advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
