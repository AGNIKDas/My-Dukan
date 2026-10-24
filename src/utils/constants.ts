import type { ShopInfo } from '../types';

/**
 * Verified Shop Information for Desh Electric.
 *
 * NOTE: We strictly use confirmed data from the Google Maps listing.
 * We do NOT invent phone numbers, opening hours, or inventory.
 */
export const SHOP_INFO: ShopInfo = {
  name: 'Desh Electric',
  owner: 'ASOKE KUMAR DAS',
  address: {
    line1: 'SH6',
    locality: 'Manganpur',
    district: 'Purba Bardhaman',
    state: 'West Bengal',
    pincode: '741319',
    formatted: 'SH6, Purba Bardhaman, Manganpur, West Bengal 741319',
  },
  googleMapsUrl: 'https://maps.app.goo.gl/PKaiVVLFb8NooDhw6',
  // Phone number will be provided by shop owner later.
  phone: '9232564610',
};

/**
 * Flag indicating whether a phone number is currently configured.
 * When false, click-to-call buttons remain gracefully disabled or hidden.
 */
export const HAS_PHONE_NUMBER = Boolean(SHOP_INFO.phone);
