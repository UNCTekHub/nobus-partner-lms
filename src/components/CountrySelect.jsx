import { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { COUNTRIES, useCountry } from '../context/CountryContext';

// First-visit country selector: a faded full-screen popup that localizes
// currency, compliance and program availability across the public portal.
export default function CountrySelect({ open, onClose }) {
  const { countryCode, selectCountry } = useCountry();
  const [choice, setChoice] = useState(countryCode || 'NG');

  if (!open) return null;

  const confirm = () => {
    selectCountry(choice);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nobus-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-10 w-auto mx-auto mb-1 bg-nobus-950 rounded-lg px-3 py-2" />
        <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-6">PartnerCentral</div>

        <div className="w-12 h-12 bg-nobus-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-6 h-6 text-nobus-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">I am connecting from</h2>
        <p className="text-sm text-gray-500 mb-6">
          We will tailor currency, compliance and program availability to your region.
        </p>

        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:border-nobus-400 mb-3"
        >
          {Object.values(COUNTRIES).map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>

        <div className="text-xs text-gray-400 mb-5 min-h-[32px]">
          {COUNTRIES[choice].currencyName} · {COUNTRIES[choice].complianceChip}
          {!COUNTRIES[choice].partnerProgram && (
            <div className="text-amber-600 font-medium mt-1">Partner program coming soon in this region</div>
          )}
        </div>

        <button onClick={confirm} className="btn-primary w-full flex items-center justify-center gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
