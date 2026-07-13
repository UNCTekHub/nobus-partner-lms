// Nobus Cloud Services pricing catalog for the partner Quote Builder.
// Unit rates extracted from nobus.io published pricing (July 2026):
//   FCS vCPU ₦93.50/unit·day · memory ₦96.80/GB·day · entry instance from ₦9,309/mo
//   FBS ₦120/GB-mo · FOS ₦60/GB-mo · bandwidth ₦6,000/GB-mo · Floating IP ₦1,500/mo
//   Windows licensed instance +₦35,000/mo · database vCPU unit ₦85.00
// Totals are indicative — final pricing must be validated with the official
// Nobus Pricing Calculator (https://nobus.io/nobus-pricing-calculator).

export const RATES = {
  vcpuDay: 93.5,
  memGbDay: 96.8,
  dbVcpuDay: 85.0,
  rootDiskGbMonth: 23.2, // derived: si.1.2.30.l lands on the published ₦9,309/mo entry price
  fbsGbMonth: 120,
  fbsSnapshotGbMonth: 120,
  fosGbMonth: 60,
  bandwidthGbMonth: 6000,
  floatingIpMonth: 1500,
  windowsLicenseMonth: 35000,
  daysPerMonth: 30,
};

const computeMonthly = (vcpu, ramGb, diskGb, os, vcpuRate = RATES.vcpuDay) => {
  let m = (vcpu * vcpuRate + ramGb * RATES.memGbDay) * RATES.daysPerMonth + diskGb * RATES.rootDiskGbMonth;
  if (os === 'windows') m += RATES.windowsLicenseMonth;
  return Math.round(m);
};

// Standard FCS instance flavors (from nobus.io/documentation/fcs image & type list)
export const FCS_INSTANCES = [
  { id: 'si.1.2.30.l',  label: 'si.1.2 — 1 vCPU · 2 GiB · 30 GB (Linux)',    vcpu: 1, ram: 2,  disk: 30, os: 'linux' },
  { id: 'si.2.2.30.l',  label: 'si.2.2 — 2 vCPU · 2 GiB · 30 GB (Linux)',    vcpu: 2, ram: 2,  disk: 30, os: 'linux' },
  { id: 'si.2.4.30.l',  label: 'si.2.4 — 2 vCPU · 4 GiB · 30 GB (Linux)',    vcpu: 2, ram: 4,  disk: 30, os: 'linux' },
  { id: 'si.2.8.30.l',  label: 'si.2.8 — 2 vCPU · 8 GiB · 30 GB (Linux)',    vcpu: 2, ram: 8,  disk: 30, os: 'linux' },
  { id: 'si.4.4.30.l',  label: 'si.4.4 — 4 vCPU · 4 GiB · 30 GB (Linux)',    vcpu: 4, ram: 4,  disk: 30, os: 'linux' },
  { id: 'si.4.8.30.l',  label: 'si.4.8 — 4 vCPU · 8 GiB · 30 GB (Linux)',    vcpu: 4, ram: 8,  disk: 30, os: 'linux' },
  { id: 'si.4.16.30.l', label: 'si.4.16 — 4 vCPU · 16 GiB · 30 GB (Linux)',  vcpu: 4, ram: 16, disk: 30, os: 'linux' },
  { id: 'si.8.16.30.l', label: 'si.8.16 — 8 vCPU · 16 GiB · 30 GB (Linux)',  vcpu: 8, ram: 16, disk: 30, os: 'linux' },
  { id: 'si.2.4.50.w',  label: 'si.2.4 — 2 vCPU · 4 GiB · 50 GB (Windows)',  vcpu: 2, ram: 4,  disk: 50, os: 'windows' },
  { id: 'si.2.8.50.w',  label: 'si.2.8 — 2 vCPU · 8 GiB · 50 GB (Windows)',  vcpu: 2, ram: 8,  disk: 50, os: 'windows' },
  { id: 'si.4.8.50.w',  label: 'si.4.8 — 4 vCPU · 8 GiB · 50 GB (Windows)',  vcpu: 4, ram: 8,  disk: 50, os: 'windows' },
  { id: 'si.4.16.50.w', label: 'si.4.16 — 4 vCPU · 16 GiB · 50 GB (Windows)', vcpu: 4, ram: 16, disk: 50, os: 'windows' },
  { id: 'si.4.32.50.w', label: 'si.4.32 — 4 vCPU · 32 GiB · 50 GB (Windows)', vcpu: 4, ram: 32, disk: 50, os: 'windows' },
  { id: 'si.8.16.50.w', label: 'si.8.16 — 8 vCPU · 16 GiB · 50 GB (Windows)', vcpu: 8, ram: 16, disk: 50, os: 'windows' },
  { id: 'si.8.32.50.w', label: 'si.8.32 — 8 vCPU · 32 GiB · 50 GB (Windows)', vcpu: 8, ram: 32, disk: 50, os: 'windows' },
  { id: 'si.8.64.50.w', label: 'si.8.64 — 8 vCPU · 64 GiB · 50 GB (Windows, burstable)', vcpu: 8, ram: 64, disk: 50, os: 'windows' },
].map((i) => ({ ...i, monthly: computeMonthly(i.vcpu, i.ram, i.disk, i.os) }));

export const DB_ENGINES = ['PostgreSQL', 'MySQL', 'MSSQL', 'MongoDB'];

export const DB_SIZES = [
  { id: 'db.2.4',  label: 'Small — 2 vCPU · 4 GiB · 50 GB',   vcpu: 2, ram: 4,  disk: 50 },
  { id: 'db.4.8',  label: 'Medium — 4 vCPU · 8 GiB · 100 GB', vcpu: 4, ram: 8,  disk: 100 },
  { id: 'db.4.16', label: 'Large — 4 vCPU · 16 GiB · 200 GB', vcpu: 4, ram: 16, disk: 200 },
  { id: 'db.8.32', label: 'XL — 8 vCPU · 32 GiB · 500 GB',    vcpu: 8, ram: 32, disk: 500 },
].map((s) => ({ ...s, monthly: computeMonthly(s.vcpu, s.ram, s.disk, 'linux', RATES.dbVcpuDay) }));

// Quote line-item catalog. Each entry describes how the Quote Builder renders
// and prices one service. kind:
//   'instance'  — pick a flavor + quantity
//   'perUnit'   — quantity × unit price (GB, IPs, …)
//   'database'  — engine + size + quantity
//   'appliance' — fixed config, priced on request (customPrice editable)
export const CATALOG = [
  {
    category: 'Compute',
    services: [
      { id: 'fcs', name: 'FCS Compute Instance', kind: 'instance', options: FCS_INSTANCES,
        blurb: 'Resizable virtual machines. Windows price includes the managed license (+₦35,000/mo).' },
      { id: 'k8s-node', name: 'Kubernetes Worker Node', kind: 'instance',
        options: FCS_INSTANCES.filter((i) => i.os === 'linux'),
        blurb: 'Managed Nobus Kubernetes Engine — priced per Linux worker node.' },
      { id: 'dedicated', name: 'Dedicated Host (BYOL)', kind: 'appliance', defaultPrice: 0,
        blurb: 'Dedicated physical server for compliance / BYOL licensing. Priced on request — enter the agreed rate.' },
    ],
  },
  {
    category: 'Storage & Backup',
    services: [
      { id: 'fbs', name: 'FBS Block Storage', kind: 'perUnit', unit: 'GB', unitPrice: RATES.fbsGbMonth, max: 1024,
        blurb: 'Provisioned block volumes, ₦120 per GB-month. 1 GB – 1 TB per volume.' },
      { id: 'fbs-snap', name: 'FBS Snapshots (stored in FOS)', kind: 'perUnit', unit: 'GB', unitPrice: RATES.fbsSnapshotGbMonth,
        blurb: 'Incremental snapshots billed on consumed data, ₦120 per GB-month.' },
      { id: 'fos', name: 'FOS Object Storage', kind: 'perUnit', unit: 'GB', unitPrice: RATES.fosGbMonth,
        blurb: 'Unlimited object storage, ₦60 per GB-month. Transfer-in free.' },
      { id: 'ncb', name: 'Nobus Cloud Backup (Acronis)', kind: 'appliance', defaultPrice: 0,
        blurb: 'Per-workload or consumption licensing. Priced on request — enter the agreed rate.' },
    ],
  },
  {
    category: 'Networking',
    services: [
      { id: 'bandwidth', name: 'Internet Bandwidth', kind: 'perUnit', unit: 'GB', unitPrice: RATES.bandwidthGbMonth,
        blurb: 'Shared internet bandwidth, ₦6,000 per GB-month (burstable to 50 Mbps).' },
      { id: 'fip', name: 'Floating IP Address', kind: 'perUnit', unit: 'IP', unitPrice: RATES.floatingIpMonth,
        blurb: 'Reserved public IPv4, ₦1,500 per month each.' },
      { id: 'vpn', name: 'Site-to-Site VPN Gateway', kind: 'instance',
        options: FCS_INSTANCES.filter((i) => i.os === 'linux' && i.vcpu <= 2),
        blurb: 'pfSense-based IPsec gateway — billed as the underlying FCS instance.' },
      { id: 'nft', name: 'Nobus Fast Transit', kind: 'appliance', defaultPrice: 0,
        blurb: 'Dedicated 1/10 Gbps private connection. Priced on request per location and port speed.' },
    ],
  },
  {
    category: 'Databases',
    services: [
      { id: 'db', name: 'Managed Database', kind: 'database', engines: DB_ENGINES, sizes: DB_SIZES,
        blurb: 'Managed PostgreSQL, MySQL, MSSQL or MongoDB with HA and automated failover. DB vCPU unit ₦85.' },
    ],
  },
  {
    category: 'Security',
    services: [
      { id: 'sophos', name: 'Sophos XG Firewall', kind: 'appliance', defaultPrice: 0,
        blurb: 'NGFW appliance (min 2 vCPU / 4 GB / 110 GB). License priced on request.' },
      { id: 'fortigate', name: 'FortiGate NGFW', kind: 'appliance', defaultPrice: 0,
        blurb: 'FortiOS NGFW with UTM and SD-WAN. License priced on request.' },
      { id: 'acronis', name: 'Acronis Cyber Protect', kind: 'appliance', defaultPrice: 0,
        blurb: 'Backup + cyber protection (min 8 GB RAM / 100 GB). License priced on request.' },
    ],
  },
];

export const naira = (n) => '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');

export const VAT_RATE = 0.075; // Nigerian VAT 7.5%
export const PARTNER_DISCOUNT_PCT = 10; // standard partner credit per the NCS Partner Agreement

// Per the Partner Agreement, the 10% credit applies only to compute and storage
// resources directly provided by NCS — it excludes external connectivity
// (internet bandwidth, NFT, IPs), licensed software (Windows, Sophos, FortiGate,
// Acronis) and other non-NCS services.
const DISCOUNT_ELIGIBLE = {
  fcs: true, 'k8s-node': true, dedicated: true, vpn: true,
  fbs: true, 'fbs-snap': true, fos: true, db: true,
  ncb: false, bandwidth: false, fip: false, nft: false,
  sophos: false, fortigate: false, acronis: false,
};

// Compute the monthly price of a single line item
export function itemMonthly(item) {
  switch (item.kind) {
    case 'instance': {
      const flavor = FCS_INSTANCES.find((f) => f.id === item.flavorId);
      return (flavor?.monthly || 0) * (item.qty || 1);
    }
    case 'perUnit':
      return (item.unitPrice || 0) * (item.qty || 0);
    case 'database': {
      const size = DB_SIZES.find((s) => s.id === item.sizeId);
      return (size?.monthly || 0) * (item.qty || 1);
    }
    case 'appliance':
      return (item.customPrice || 0) * (item.qty || 1);
    default:
      return 0;
  }
}

// Portion of an item's monthly price that qualifies for the partner discount.
// Windows managed-license fees are licensed software and never discounted.
export function itemDiscountableMonthly(item) {
  if (!DISCOUNT_ELIGIBLE[item.serviceId]) return 0;
  let monthly = itemMonthly(item);
  if (item.kind === 'instance') {
    const flavor = FCS_INSTANCES.find((f) => f.id === item.flavorId);
    if (flavor?.os === 'windows') monthly -= RATES.windowsLicenseMonth * (item.qty || 1);
  }
  return Math.max(monthly, 0);
}

export function quoteTotal(items) {
  return items.reduce((sum, item) => sum + itemMonthly(item), 0);
}

// Full quote financials: subtotal, partner discount, VAT and grand totals
export function quoteBreakdown(items, discountPct = 0) {
  const subtotalMonthly = quoteTotal(items);
  const discountableMonthly = items.reduce((sum, item) => sum + itemDiscountableMonthly(item), 0);
  const discountMonthly = Math.round(discountableMonthly * (discountPct / 100));
  const netMonthly = subtotalMonthly - discountMonthly;
  const netAnnual = netMonthly * 12;
  const vatAnnual = Math.round(netAnnual * VAT_RATE);
  return {
    subtotalMonthly, discountMonthly, netMonthly, netAnnual, vatAnnual,
    totalAnnual: netAnnual + vatAnnual,
  };
}

// Serializable line rows for exports (PDF/XLSX) — description, qty, unit cost, monthly
export function buildQuoteLines(items) {
  const groupOf = (serviceId) => {
    for (const cat of CATALOG) {
      if (cat.services.some((s) => s.id === serviceId)) return cat.category;
    }
    return 'Other';
  };
  return items.map((item) => {
    const monthly = itemMonthly(item);
    const qty = item.qty || 1;
    let config = '';
    if (item.kind === 'instance') {
      const flavor = FCS_INSTANCES.find((f) => f.id === item.flavorId);
      config = flavor ? `${flavor.vcpu} vCPU, ${flavor.ram}GB RAM, ${flavor.disk}GB Volume (${flavor.os === 'windows' ? 'Windows' : 'Linux'} Server)` : item.flavorId;
    } else if (item.kind === 'perUnit') {
      config = `${item.qty} ${item.unit} @ ${naira(item.unitPrice)}/${item.unit}-month`;
    } else if (item.kind === 'database') {
      const size = DB_SIZES.find((s) => s.id === item.sizeId);
      config = size ? `${item.engine} — ${size.vcpu} vCPU, ${size.ram}GB RAM, ${size.disk}GB Volume` : item.engine;
    } else if (item.kind === 'appliance') {
      config = item.customPrice > 0 ? 'Agreed rate' : 'Priced on request';
    }
    return {
      group: groupOf(item.serviceId),
      label: item.name,
      config,
      qty: item.kind === 'perUnit' ? 1 : qty,
      unitCost: item.kind === 'perUnit' ? monthly : Math.round(monthly / qty),
      monthly,
      discountable: itemDiscountableMonthly(item),
    };
  });
}
