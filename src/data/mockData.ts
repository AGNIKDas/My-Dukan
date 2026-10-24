import type { Category, Company, Product } from '../types';

/**
 * Predefined electrical hardware categories for Desh Electric.
 */
export const CATEGORIES: Category[] = [
  {
    id: 'cat-switches',
    name: 'Switches & Sockets',
    slug: 'switches-sockets',
    description: 'Modular switches, multi-pin shuttered sockets, fan step regulators, and cover plates.',
    iconName: 'Zap',
  },
  {
    id: 'cat-wires',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'Flame-retardant (FR) multi-strand copper house wires and heavy-duty industrial cables.',
    iconName: 'Cable',
  },
  {
    id: 'cat-lighting',
    name: 'Lighting & Luminaires',
    slug: 'lighting-luminaires',
    description: 'Energy-saving LED battens, high-lumen bulbs, slim panel downlights, and outdoor fixtures.',
    iconName: 'Lightbulb',
  },
  {
    id: 'cat-switchgear',
    name: 'Switchgear & Protection',
    slug: 'switchgear-protection',
    description: 'Miniature circuit breakers (MCBs), isolators, changeover switches, and distribution boxes.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'cat-fans',
    name: 'Fans & Ventilation',
    slug: 'fans-ventilation',
    description: 'Aerodynamic ceiling fans, heavy-duty exhaust fans, wall fans, and electronic regulators.',
    iconName: 'Fan',
  },
  {
    id: 'cat-accessories',
    name: 'Pipes & Accessories',
    slug: 'pipes-accessories',
    description: 'Rigid PVC conduit pipes, bend elbows, junction boxes, casing-capping, and insulation tape.',
    iconName: 'Wrench',
  },
];

/**
 * Initial partner companies featured on Desh Electric.
 * JJU Ultra and Pritam are the initial example brand names requested.
 */
export const COMPANIES: Company[] = [
  {
    id: 'jju-ultra',
    name: 'JJU Ultra',
    slug: 'jju-ultra',
    description: 'Specialist manufacturer of premium modular wiring accessories, heavy-gauge conduits, and durable electrical fittings.',
  },
  {
    id: 'pritam',
    name: 'Pritam',
    slug: 'pritam',
    description: 'Trusted regional brand offering reliable copper house wires, energy-efficient lighting, and domestic switchgear.',
  },
];

/**
 * Realistic DEMO products clearly marked with demo prices.
 * Strictly illustrative for website demonstration purposes.
 */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'JJU Ultra 6A 1-Way Modular Switch (White)',
    slug: 'jju-ultra-6a-modular-switch',
    categoryId: 'cat-switches',
    companyId: 'jju-ultra',
    price: 42,
    description: 'Smooth rocker action modular switch made with fire-retardant polycarbonate and silver cadmium oxide contacts for spark-free switching.',
    specifications: {
      'Rating': '6A, 240V AC',
      'Material': 'UV Stabilized Polycarbonate',
      'Module Size': '1 Module',
      'Contact Material': 'Silver Alloy',
      'Expected Life': '40,000+ Operations',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Pritam 1.5 sq mm FR House Wire (90m Coil)',
    slug: 'pritam-1-5-sq-mm-fr-wire',
    categoryId: 'cat-wires',
    companyId: 'pritam',
    price: 1850,
    description: '100% electrolytic pure copper multi-strand wire with flame-retardant (FR) PVC insulation for domestic residential wiring.',
    specifications: {
      'Conductor': 'High Conductivity Electrolytic Copper',
      'Cross Section': '1.5 sq mm',
      'Coil Length': '90 Metres',
      'Insulation': 'Flame Retardant (FR) PVC',
      'Voltage Grade': 'Up to 1100V',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-3',
    name: 'JJU Ultra 16A 3-Pin Heavy-Duty Power Socket',
    slug: 'jju-ultra-16a-power-socket',
    categoryId: 'cat-switches',
    companyId: 'jju-ultra',
    price: 110,
    description: 'Child-safe shuttered modular socket designed for high-load appliances like water heaters, refrigerators, and air conditioners.',
    specifications: {
      'Rating': '16A / 6A Combined, 250V AC',
      'Safety': 'Built-in Child Protection Shutters',
      'Module Size': '2 Module',
      'Terminal': 'Brass Screw Clamp Terminals',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-4',
    name: 'Pritam 20W LED Slim Batten Tube Light',
    slug: 'pritam-20w-led-batten',
    categoryId: 'cat-lighting',
    companyId: 'pritam',
    price: 240,
    description: 'Glare-free cool daylight LED batten light with wide beam angle, integrated surge protection, and low power consumption.',
    specifications: {
      'Wattage': '20 Watts',
      'Color Temp': '6500K (Cool Day White)',
      'Luminous Efficacy': '100 Lumens / Watt',
      'Surge Protection': 'Up to 3.5 kV',
      'Lifespan': '25,000 Hours',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-5',
    name: 'Pritam 32A Double Pole (DP) MCB Isolator',
    slug: 'pritam-32a-dp-mcb-isolator',
    categoryId: 'cat-switchgear',
    companyId: 'pritam',
    price: 390,
    description: 'High-breaking capacity double pole isolator for safe disconnecting of domestic phase and neutral incoming mains.',
    specifications: {
      'Poles': 'Double Pole (DP)',
      'Rated Current': '32 Amperes',
      'Breaking Capacity': '10 kA',
      'Mounting': 'Standard 35mm DIN Rail',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-6',
    name: 'JJU Ultra 25mm Heavy Gauge PVC Rigid Conduit (3m)',
    slug: 'jju-ultra-25mm-pvc-conduit',
    categoryId: 'cat-accessories',
    companyId: 'jju-ultra',
    price: 75,
    description: 'Impact-resistant and corrosion-proof rigid PVC conduit pipe suitable for concealed wall and concrete slab electrical wiring.',
    specifications: {
      'Nominal Diameter': '25 mm',
      'Length': '3 Metres Per Pipe',
      'Classification': 'Medium Duty Impact Resistant',
      'Corrosion Resistance': 'Non-conductive & Rust-Proof',
    },
    inStock: true,
    featured: false,
  },
  {
    id: 'prod-7',
    name: 'Pritam 1200mm High-Speed Decorative Ceiling Fan',
    slug: 'pritam-1200mm-ceiling-fan',
    categoryId: 'cat-fans',
    companyId: 'pritam',
    price: 1750,
    description: 'Double ball bearing ceiling fan with aerodynamically contoured aluminum blades for maximum air delivery with quiet operation.',
    specifications: {
      'Blade Sweep': '1200 mm (48 Inches)',
      'Speed': '380 RPM',
      'Motor': '100% Copper Winding Motor',
      'Bearings': 'Dual Deep Groove Ball Bearings',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-8',
    name: 'JJU Ultra 2.5 sq mm FR Industrial Copper Cable (90m)',
    slug: 'jju-ultra-2-5-sq-mm-cable',
    categoryId: 'cat-wires',
    companyId: 'jju-ultra',
    price: 2950,
    description: 'Heavy gauge multi-strand copper cable designed for power sockets, air conditioning circuits, and inverter battery backup lines.',
    specifications: {
      'Conductor': 'Annealed Bare Copper Multi-strand',
      'Cross Section': '2.5 sq mm',
      'Coil Length': '90 Metres Coil',
      'Grade': 'Heat Resistant Flame Retardant (HRFR)',
    },
    inStock: true,
    featured: false,
  },
];
