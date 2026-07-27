import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { api } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import partnerTerms from '../data/partnerTerms';

export default function OrgRegistration() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    rcNumber: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    country: 'Nigeria',
    state: '',
    estimatedStaff: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the NCS Partner Terms and Conditions to apply.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.registerOrg(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nobus-900 via-nobus-800 to-nobus-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to become a Nobus Cloud partner. Our team will review your application
              and send an invitation link to <strong>{form.contactEmail}</strong> once approved.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Typical review time: 1-3 business days.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nobus-900 via-nobus-800 to-nobus-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-11 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Become a Partner</h1>
          <p className="text-nobus-300 mt-1">Register your organization to join the NCS Partner Network</p>
        </div>

        <div className="card p-6">
          <div className="bg-nobus-50 border border-nobus-200 rounded-lg p-3 mb-6 text-sm text-nobus-700">
            <strong>How it works:</strong> Submit your application below. Once approved by the Nobus team,
            you'll receive an invitation link to create your organization's admin account on PartnerCentral.
            Your Nobus partner account is activated after enrollment.
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RC Number / Business Registration *</label>
                <input name="rcNumber" value={form.rcNumber} onChange={handleChange} required placeholder="RC-123456"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees *</label>
                <input name="estimatedStaff" type="number" min="1" value={form.estimatedStaff} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Name *</label>
                <input name="contactName" value={form.contactName} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+234..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input name="state" value={form.state} onChange={handleChange} required placeholder="e.g. your state or region"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none" />
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-nobus-500 focus:ring-nobus-400" />
              <span className="text-sm text-gray-600">
                I have read and agree to the{' '}
                <button type="button" onClick={() => setShowTerms(true)} className="text-nobus-600 font-medium hover:underline">
                  NCS Partner Terms and Conditions
                </button>
                , and I have legal authority to bind the organization named above. *
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !acceptedTerms}
              className={`btn-primary w-full mt-2 ${submitting || !acceptedTerms ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          {showTerms && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
              <div className="bg-white rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">NCS Partner Terms and Conditions</h2>
                  <button onClick={() => setShowTerms(false)} className="p-1.5 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <MarkdownRenderer content={partnerTerms} />
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                  <button onClick={() => setShowTerms(false)} className="btn-secondary !py-2 text-sm">Close</button>
                  <button onClick={() => { setAcceptedTerms(true); setShowTerms(false); }} className="btn-primary !py-2 text-sm">
                    Accept Terms
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-nobus-600 hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
