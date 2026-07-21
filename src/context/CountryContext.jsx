import { createContext, useContext, useState, useCallback } from 'react';

// Country localization for the public-facing portal experience.
// The partner program is currently live in Nigeria only; Kenya and other
// countries see the localized landing page with partnership marked coming soon.
export const COUNTRIES = {
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currencyName: 'Nigerian Naira (NGN)',
    currencyShort: 'Naira',
    complianceChip: 'NDPA · ISO 27001 · PCI DSS',
    regulator: 'NDPA (Nigeria Data Protection Act)',
    homeZone: 'Lagos: nobus-wa-az1 (Ikeja) & nobus-wa-az2 (Lekki)',
    computePrice: 'from NGN 9,309/month',
    partnerProgram: true,
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currencyName: 'Kenyan Shilling (KES)',
    currencyShort: 'Shilling',
    complianceChip: 'ODPC · ISO 27001 · PCI DSS',
    regulator: 'ODPC (Office of the Data Protection Commissioner)',
    homeZone: 'Nairobi: nobus-ea-az1',
    computePrice: 'with local pricing',
    partnerProgram: false,
  },
  OTHER: {
    code: 'OTHER',
    name: 'Other Countries',
    flag: '🌍',
    currencyName: 'US Dollars (USD)',
    currencyShort: 'US Dollar',
    complianceChip: 'NDPA · ODPC · ISO 27001 · PCI DSS',
    regulator: 'NDPA & ODPC compliant, ISO 27001 & PCI DSS certified',
    homeZone: 'Lagos (Ikeja & Lekki) and Nairobi',
    computePrice: 'with transparent pricing',
    partnerProgram: false,
  },
};

const STORAGE_KEY = 'nobus-country';

const CountryContext = createContext();

export function CountryProvider({ children }) {
  const [countryCode, setCountryCode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && COUNTRIES[stored] ? stored : null;
    } catch {
      return null;
    }
  });

  const selectCountry = useCallback((code) => {
    if (!COUNTRIES[code]) return;
    setCountryCode(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  const clearCountry = useCallback(() => {
    setCountryCode(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <CountryContext.Provider
      value={{
        country: countryCode ? COUNTRIES[countryCode] : null,
        countryCode,
        selectCountry,
        clearCountry,
        needsSelection: !countryCode,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}
