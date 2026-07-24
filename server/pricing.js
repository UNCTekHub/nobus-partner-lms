// Server-side pricing engine - the authoritative mirror of src/data/pricingCatalog.js.
// Quote line rows and totals are recomputed here from the raw item configs so the
// stored figures (and the NCS credit derived from `discountable`) can never be
// tampered with client-side. Keep the rates in lockstep with the client catalog.
// NOTE: lives at server root, NOT server/data/ (that directory is gitignored).

export const RATES = {
  vcpuDay: 94,
  memGbDay: 97,
  diskGbDay: 4,
  fbsGbMonth: 120,
  fosGbMonth: 60,
  ncbMultiplier: 3,
  bandwidthMonth: 6000,
  floatingIpMonth: 1500,
  windowsLicenseMonth: 35000,
  daysPerMonth: 30,
};

const computeMonthly = (vcpu, ramGb, diskGb, os = 'linux') => {
  let m = (vcpu * RATES.vcpuDay + ramGb * RATES.memGbDay + diskGb * RATES.diskGbDay) * RATES.daysPerMonth;
  if (os === 'windows') m += RATES.windowsLicenseMonth;
  return Math.round(m);
};

export const FCS_INSTANCES = [
  { id: 'si.1.2.30.l',  vcpu: 1, ram: 2,  disk: 30, os: 'linux' },
  { id: 'si.2.2.30.l',  vcpu: 2, ram: 2,  disk: 30, os: 'linux' },
  { id: 'si.2.4.30.l',  vcpu: 2, ram: 4,  disk: 30, os: 'linux' },
  { id: 'si.2.8.30.l',  vcpu: 2, ram: 8,  disk: 30, os: 'linux' },
  { id: 'si.4.4.30.l',  vcpu: 4, ram: 4,  disk: 30, os: 'linux' },
  { id: 'si.4.8.30.l',  vcpu: 4, ram: 8,  disk: 30, os: 'linux' },
  { id: 'si.4.16.30.l', vcpu: 4, ram: 16, disk: 30, os: 'linux' },
  { id: 'si.8.16.30.l', vcpu: 8, ram: 16, disk: 30, os: 'linux' },
  { id: 'si.2.4.50.w',  vcpu: 2, ram: 4,  disk: 50, os: 'windows' },
  { id: 'si.2.8.50.w',  vcpu: 2, ram: 8,  disk: 50, os: 'windows' },
  { id: 'si.4.8.50.w',  vcpu: 4, ram: 8,  disk: 50, os: 'windows' },
  { id: 'si.4.16.50.w', vcpu: 4, ram: 16, disk: 50, os: 'windows' },
  { id: 'si.4.32.50.w', vcpu: 4, ram: 32, disk: 50, os: 'windows' },
  { id: 'si.8.16.50.w', vcpu: 8, ram: 16, disk: 50, os: 'windows' },
  { id: 'si.8.32.50.w', vcpu: 8, ram: 32, disk: 50, os: 'windows' },
  { id: 'si.8.64.50.w', vcpu: 8, ram: 64, disk: 50, os: 'windows' },
].map((i) => ({ ...i, monthly: computeMonthly(i.vcpu, i.ram, i.disk, i.os) }));

export const DB_SIZES = [
  { id: 'db.2.4',  vcpu: 2, ram: 4,  disk: 50 },
  { id: 'db.4.8',  vcpu: 4, ram: 8,  disk: 100 },
  { id: 'db.4.16', vcpu: 4, ram: 16, disk: 200 },
  { id: 'db.8.32', vcpu: 8, ram: 32, disk: 500 },
].map((s) => ({ ...s, monthly: computeMonthly(s.vcpu, s.ram, s.disk, 'linux') }));

// Per-unit rates by serviceId - the server never trusts a client-sent unitPrice.
const UNIT_PRICES = {
  fbs: RATES.fbsGbMonth,
  fos: RATES.fosGbMonth,
  ncb: RATES.fosGbMonth * RATES.ncbMultiplier,
  bandwidth: RATES.bandwidthMonth,
  fip: RATES.floatingIpMonth,
};

const SERVICE_CATEGORY = {
  fcs: 'Compute', nke: 'Compute', dedicated: 'Compute',
  fbs: 'Storage & Backup', fos: 'Storage & Backup', ncb: 'Storage & Backup',
  bandwidth: 'Networking', fip: 'Networking', vpn: 'Networking', nft: 'Networking',
  db: 'Databases',
  sophos: 'Security', fortigate: 'Security', acronis: 'Security',
};

// Per the Partner Agreement: the 10% credit covers compute and storage provided
// by NCS; it excludes external connectivity, licensed software (incl. the Windows
// managed license and NCB's Acronis license) and account-manager-priced options.
const DISCOUNT_ELIGIBLE = {
  fcs: true, nke: true, vpn: true, db: true, sophos: true, fortigate: true,
  fbs: true, fos: true,
  ncb: false, bandwidth: false, fip: false, nft: false, dedicated: false, acronis: false,
};

const qtyOf = (item) => Math.max(0, Math.round(Number(item.qty) || 1));

export function itemMonthly(item) {
  switch (item.kind) {
    case 'instance': {
      const flavor = FCS_INSTANCES.find((f) => f.id === item.flavorId);
      return (flavor?.monthly || 0) * qtyOf(item);
    }
    case 'perUnit':
      return (UNIT_PRICES[item.serviceId] || 0) * Math.max(0, Math.round(Number(item.qty) || 0));
    case 'database': {
      const size = DB_SIZES.find((s) => s.id === item.sizeId);
      return (size?.monthly || 0) * qtyOf(item);
    }
    case 'kubernetes': {
      const m = FCS_INSTANCES.find((f) => f.id === item.masterFlavorId);
      const w = FCS_INSTANCES.find((f) => f.id === item.workerFlavorId);
      return (m?.monthly || 0) * Math.max(1, Math.round(Number(item.masterCount) || 1))
        + (w?.monthly || 0) * Math.max(0, Math.round(Number(item.workerCount) || 0));
    }
    case 'appliance':
      // Appliance/agreed rates are negotiated per deal, so the price itself is an
      // input - but eligibility below still bounds what can count as discountable.
      return Math.max(0, Math.round(Number(item.customPrice) || 0)) * qtyOf(item);
    default:
      return 0;
  }
}

export function itemDiscountableMonthly(item) {
  if (!DISCOUNT_ELIGIBLE[item.serviceId]) return 0;
  let monthly = itemMonthly(item);
  if (item.kind === 'instance') {
    const flavor = FCS_INSTANCES.find((f) => f.id === item.flavorId);
    if (flavor?.os === 'windows') monthly -= RATES.windowsLicenseMonth * qtyOf(item);
  }
  return Math.max(monthly, 0);
}

export function quoteTotal(items) {
  return items.reduce((sum, item) => sum + itemMonthly(item), 0);
}

// Rebuild the serializable line rows (same shape the client renders/exports)
// from the raw items. Display strings (label/config) may be taken from the
// client-sent lines - they map 1:1 by index with items - but every FIGURE
// (qty, unitCost, monthly, discountable) is server-computed. These lines feed
// the official PDF/XLSX quote exports and the NCS-credit calculation.
export function buildQuoteLines(items, clientLines = []) {
  return items.map((item, i) => {
    const monthly = itemMonthly(item);
    const qty = qtyOf(item) || 1;
    const display = clientLines[i] || {};
    return {
      group: SERVICE_CATEGORY[item.serviceId] || 'Other',
      label: String(display.label || item.name || item.serviceId || 'Line item').slice(0, 120),
      config: String(display.config || '').slice(0, 200),
      qty: item.kind === 'perUnit' ? 1 : qty,
      unitCost: item.kind === 'perUnit' ? monthly : Math.round(monthly / qty),
      monthly,
      discountable: itemDiscountableMonthly(item),
    };
  });
}
