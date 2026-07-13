import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import partnerTerms from '../data/partnerTerms';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-nobus-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-8 w-auto" />
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-nobus-200 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="card p-8">
          <MarkdownRenderer content={partnerTerms} />
        </div>
      </div>
    </div>
  );
}
