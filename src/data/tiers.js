// Partner tiers: earned on annual revenue booked through Nobus (trailing 12
// months) PLUS a role-matched certification minimum. Each tier carries the
// partner discount applied to the org's quotes. Kept in lockstep with the
// authoritative server model in server/services/tierEngine.js.
export const TIER_DEFINITIONS = [
  {
    name: 'Registered',
    color: 'gray',
    bgClass: 'bg-gray-100 text-gray-700 border-gray-300',
    discount: 10,
    requirements: { Sales: 0, Presales: 0, Technical: 0, revenue: 0, discount: 10, description: 'Entry tier · up to ₦500M annual revenue via Nobus' },
    benefits: ['10% partner discount on compute & storage', 'Deal registration & channel protection', 'Access to the partner portal & training'],
  },
  {
    name: 'Silver',
    color: 'slate',
    bgClass: 'bg-slate-100 text-slate-700 border-slate-300',
    discount: 15,
    requirements: { Sales: 2, Presales: 1, Technical: 1, revenue: 500_000_001, discount: 15, description: 'Over ₦500M annual revenue + 2 sales, 1 presales, 1 technical certified' },
    benefits: ['15% partner discount on compute & storage', 'Co-marketing materials & partner logo', 'Nobus sales support on opportunities'],
  },
  {
    name: 'Gold',
    color: 'amber',
    bgClass: 'bg-amber-50 text-amber-800 border-amber-300',
    discount: 20,
    requirements: { Sales: 5, Presales: 3, Technical: 3, revenue: 1_500_000_000, discount: 20, description: '₦1.5B+ annual revenue + 5 sales, 3 presales, 3 technical certified' },
    benefits: ['20% partner discount on compute & storage', 'MDF eligibility & joint case studies', 'Priority support SLA & partner manager'],
  },
];

export function getNextTier(currentTier) {
  const idx = TIER_DEFINITIONS.findIndex((t) => t.name === currentTier);
  if (idx >= 0 && idx < TIER_DEFINITIONS.length - 1) return TIER_DEFINITIONS[idx + 1];
  return null;
}

export function getTierDef(tierName) {
  return TIER_DEFINITIONS.find((t) => t.name === tierName) || TIER_DEFINITIONS[0];
}

// The partner discount percentage for a tier (used to price quotes).
export function tierDiscount(tierName) {
  return getTierDef(tierName).discount;
}

// Representative metal/prestige color per tier, for the tier label and its dot.
export const TIER_COLORS = {
  Registered: '#64748B', // slate
  Silver: '#9AA6B2',     // silver
  Gold: '#D4AF37',       // gold
};

export function tierColor(tierName) {
  return TIER_COLORS[tierName] || TIER_COLORS.Registered;
}
