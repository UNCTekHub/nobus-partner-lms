import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      // Nobus staff land on the operations console; partners on the dashboard
      navigate(result.user?.role === 'super_admin' ? '/ncs-console' : '/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nobus-900 via-nobus-800 to-nobus-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-12 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Nobus PartnerCentral</h1>
          <p className="text-nobus-300 mt-1">One portal for everything you do with Nobus Cloud</p>
        </div>

        {/* Login form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <LogIn className="w-4 h-4" /> {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-nobus-600 hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="text-sm text-nobus-600 hover:underline">
              Become a Partner
            </Link>
          </div>
        </div>

        <p className="text-center text-nobus-400 text-xs mt-6">
          <Link to="/" className="hover:text-nobus-200 hover:underline">← Back to PartnerCentral</Link>
        </p>
      </div>
    </div>
  );
}
