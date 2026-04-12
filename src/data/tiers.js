export const ROLE_WEIGHTS = {
  Sales: 1.0,
  Presales: 1.5,
  Technical: 2.0,
};

export const TIER_DEFINITIONS = [
  {
    name: 'Registered',
    color: 'gray',
    bgClass: 'bg-gray-100 text-gray-700 border-gray-300',
    requirements: { Sales: 0, Presales: 0, Technical: 0, description: 'Org admin enrolled; 1+ user active on LMS' },
    benefits: ['Access to Nobus partner portal', 'Deal registration', 'Basic partner resources'],
  },
  {
    name: 'Silver',
    color: 'amber',
    bgClass: 'bg-amber-50 text-amber-800 border-amber-300',
    requirements: { Sales: 2, Presales: 1, Technical: 1, description: '2+ trained sales, 1+ presales, 1+ technical' },
    benefits: ['Co-marketing materials', 'Partner logo usage', 'Nobus sales support on opportunities'],
  },
  {
    name: 'Gold',
    color: 'blue',
    bgClass: 'bg-blue-50 text-blue-800 border-blue-300',
    requirements: { Sales: 5, Presales: 3, Technical: 3, description: '5+ trained sales, 3+ presales, 3+ technical' },
    benefits: ['MDF (marketing development funds) eligibility', 'Joint customer case studies', 'Priority support SLA'],
  },
  {
    name: 'Platinum',
    color: 'purple',
    bgClass: 'bg-purple-50 text-purple-800 border-purple-300',
    requirements: { Sales: 10, Presales: 5, Technical: 6, description: '10+ trained sales, 5+ presales, 6+ technical' },
    benefits: ['Dedicated Nobus partner manager', 'Quarterly business reviews', 'Early access to new products'],
  },
  {
    name: 'Elite',
    color: 'orange',
    bgClass: 'bg-orange-50 text-orange-800 border-orange-300',
    requirements: { Sales: 15, Presales: 8, Technical: 10, description: '15+ sales, 8+ presales, 10+ technical + active managed accounts' },
    benefits: ['NFT high-bandwidth provisioning authorization', 'Highest deal registration margin', 'Listed as Premier Partner'],
  },
];

export function calculateTierScore(trainedCounts) {
  return (
    (trainedCounts.Sales || 0) * ROLE_WEIGHTS.Sales +
    (trainedCounts.Presales || 0) * ROLE_WEIGHTS.Presales +
    (trainedCounts.Technical || 0) * ROLE_WEIGHTS.Technical
  );
}

export function determineTier(trainedCounts) {
  const s = trainedCounts.Sales || 0;
  const p = trainedCounts.Presales || 0;
  const t = trainedCounts.Technical || 0;

  if (s >= 15 && p >= 8 && t >= 10) return 'Elite';
  if (s >= 10 && p >= 5 && t >= 6) return 'Platinum';
  if (s >= 5 && p >= 3 && t >= 3) return 'Gold';
  if (s >= 2 && p >= 1 && t >= 1) return 'Silver';
  return 'Registered';
}

export function getNextTier(currentTier) {
  const idx = TIER_DEFINITIONS.findIndex((t) => t.name === currentTier);
  if (idx < TIER_DEFINITIONS.length - 1) return TIER_DEFINITIONS[idx + 1];
  return null;
}

export function getTierDef(tierName) {
  return TIER_DEFINITIONS.find((t) => t.name === tierName) || TIER_DEFINITIONS[0];
}
