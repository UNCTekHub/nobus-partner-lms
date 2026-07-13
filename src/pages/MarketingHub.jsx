import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Search, Download, Plus, X, Loader2, FileText, Image, Presentation, Mail, Share2, Swords } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const CATEGORIES = [
  { id: 'Logos & Brand', icon: Image },
  { id: 'Brochures', icon: FileText },
  { id: 'Battle Cards', icon: Swords },
  { id: 'Email Templates', icon: Mail },
  { id: 'Social Media', icon: Share2 },
  { id: 'Presentations', icon: Presentation },
];

const EMPTY_FORM = { title: '', description: '', category: 'Brochures', fileUrl: '', fileType: 'PDF', tags: '' };

export default function MarketingHub() {
  const { isSuperAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (category) params.category = category;
      if (query) params.q = query;
      setAssets(await api.getMarketingAssets(params));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const download = async (asset) => {
    try {
      const { url } = await api.downloadMarketingAsset(asset.id);
      window.open(url, '_blank', 'noopener');
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, downloads: a.downloads + 1 } : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.addMarketingAsset({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-nobus-500" /> Marketing Materials
          </h1>
          <p className="text-gray-600">Logos, brochures, battle cards, email templates and social kits — ready for co-branded campaigns.</p>
        </div>
        {isSuperAdmin && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        )}
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search materials…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory('')}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              !category ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'
            }`}>
            All
          </button>
          {CATEGORIES.map(({ id }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                category === id ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'
              }`}>
              {id}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset) => {
            const CatIcon = CATEGORIES.find((c) => c.id === asset.category)?.icon || FileText;
            let tags = [];
            try { tags = JSON.parse(asset.tags || '[]'); } catch { /* ignore */ }
            return (
              <div key={asset.id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-nobus-50 rounded-lg flex items-center justify-center">
                    <CatIcon className="w-5 h-5 text-nobus-500" />
                  </div>
                  <span className="badge bg-gray-100 text-gray-600">{asset.file_type || 'FILE'}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{asset.title}</h3>
                <p className="text-sm text-gray-500 mb-3 flex-1">{asset.description}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.slice(0, 4).map((t) => <span key={t} className="badge-blue">{t}</span>)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{asset.downloads} download{asset.downloads === 1 ? '' : 's'}</span>
                  <button onClick={() => download(asset)}
                    className="flex items-center gap-1.5 text-sm font-medium text-nobus-600 hover:text-nobus-700">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            );
          })}
          {assets.length === 0 && (
            <div className="col-span-full card p-12 text-center text-gray-500">
              <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No materials match your filters.
            </div>
          )}
        </div>
      )}

      {/* Add asset modal (super admin) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Marketing Asset</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File type</label>
                  <select value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                    {['PDF', 'PPTX', 'DOCX', 'ZIP', 'PNG', 'SVG', 'MP4'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
                <input required type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="brand, logo, co-branding"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving…' : 'Publish Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
