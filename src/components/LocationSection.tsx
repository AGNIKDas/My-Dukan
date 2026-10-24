import { MapPin, ExternalLink, Navigation, Clock, Phone, AlertCircle, Building } from 'lucide-react';
import { SHOP_INFO } from '../utils/constants';

interface LocationSectionProps {
  phone?: string | null;
}

export function LocationSection({ phone }: LocationSectionProps) {
  const activePhone = phone || SHOP_INFO.phone;

  return (
    <section id="location" className="location-section" aria-label="Shop Location & Contact">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <MapPin size={14} className="pill-icon" />
            <span>Store Location</span>
          </div>
          <h2 className="section-title">Visit Desh Electric in Manganpur</h2>
          <p className="section-subtitle">
            Easily accessible on State Highway 6 (SH6) in Purba Bardhaman. Stop by for direct in-store purchases and electrical consultations.
          </p>
        </div>

        <div className="location-grid">
          {/* Address & Store Info Card */}
          <div className="location-info-card">
            <div className="info-card-header">
              <div className="shop-name-row">
                <Building size={22} className="shop-icon" />
                <div>
                  <h3 className="shop-title">{SHOP_INFO.name}</h3>
                  <span className="shop-owner-badge">Proprietor: {SHOP_INFO.owner}</span>
                </div>
              </div>
            </div>

            <div className="address-block">
              <span className="address-label">Verified Physical Address:</span>
              <div className="address-content">
                <p className="address-line"><strong>{SHOP_INFO.address.line1}</strong> (State Highway 6)</p>
                <p className="address-line">{SHOP_INFO.address.locality}</p>
                <p className="address-line">{SHOP_INFO.address.district}, {SHOP_INFO.address.state}</p>
                <p className="address-pincode">PIN Code: <strong>{SHOP_INFO.address.pincode}</strong></p>
              </div>
            </div>

            {/* Landmarks & Accessibility */}
            <div className="landmarks-block">
              <div className="landmark-item">
                <Navigation size={18} className="landmark-icon" />
                <div>
                  <strong>Roadside Access:</strong>
                  <p>Situated directly along SH6 with convenient stopping and loading space for transporting heavy pipes and cables.</p>
                </div>
              </div>
            </div>

            {/* Notice regarding Phone & Hours */}
            <div className="contact-status-box">
              {activePhone ? (
                <div className="status-item status-item-active-phone">
                  <Phone size={18} className="status-icon icon-phone-active" />
                  <div>
                    <span className="status-title">Direct Shop Phone Line:</span>
                    <a href={`tel:${activePhone}`} className="phone-active-link">
                      <strong>{activePhone}</strong> (Click to Call)
                    </a>
                  </div>
                </div>
              ) : (
                <div className="status-item">
                  <Phone size={16} className="status-icon" />
                  <div>
                    <span className="status-title">Direct Phone Line:</span>
                    <span className="status-desc">Phone contact will be updated by the shop owner soon.</span>
                  </div>
                </div>
              )}
              <div className="status-item">
                <Clock size={16} className="status-icon" />
                <div>
                  <span className="status-title">Shop Hours:</span>
                  <span className="status-desc">Please visit the shop directly or check the Google Maps listing for real-time schedule.</span>
                </div>
              </div>
            </div>

            {/* Prominent Google Maps Button & Phone Call Button */}
            <div className="maps-button-wrapper">
              <div className="location-buttons-row">
                <a
                  href={SHOP_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-google-maps"
                  id="btn-open-google-maps"
                >
                  <MapPin size={20} />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={18} />
                </a>

                {activePhone && (
                  <a
                    href={`tel:${activePhone}`}
                    className="btn-call-shop"
                    id="btn-call-desh-electric"
                    title={`Call Desh Electric at ${activePhone}`}
                  >
                    <Phone size={18} />
                    <span>Call Store</span>
                  </a>
                )}
              </div>
              <span className="maps-btn-caption">Opens official Google Maps listing in a new window</span>
            </div>

          </div>

          {/* Visual Map & Directions Card */}
          <div className="location-visual-card">
            <div className="map-preview-container">
              {/* Map Illustration Frame */}
              <div className="map-graphic-box">
                <div className="map-road map-road-sh6">
                  <span className="highway-badge">SH 6</span>
                </div>
                <div className="map-pin-indicator">
                  <div className="pulse-ring" aria-hidden="true" />
                  <div className="pin-marker">
                    <MapPin size={24} className="pin-bolt" />
                  </div>
                  <div className="pin-tooltip">
                    <strong>{SHOP_INFO.name}</strong>
                    <span>SH6, Manganpur</span>
                  </div>
                </div>
              </div>

              <div className="map-card-footer">
                <div className="map-quick-details">
                  <div className="quick-detail-row">
                    <span className="qd-label">Location:</span>
                    <span className="qd-value">Manganpur, Purba Bardhaman</span>
                  </div>
                  <div className="quick-detail-row">
                    <span className="qd-label">State Highway:</span>
                    <span className="qd-value">SH6 Highway Corridor</span>
                  </div>
                </div>

                <div className="map-instructions-callout">
                  <AlertCircle size={16} className="callout-mini-icon" />
                  <span>
                    Need driving directions? Click the Google Maps button above to navigate using GPS.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
