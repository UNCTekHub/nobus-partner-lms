import { useState, useEffect, useCallback } from 'react';
import { Library, Search, Plus, X, Loader2, Eye, FileText, BookOpen, Briefcase, HelpCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const TYPES = [
  { id: 'whitepaper', label: 'Whitepapers', icon: BookOpen },
  { id: 'datasheet', label: 'Datasheets', icon: FileText },
  { id: 'case-study', label: 'Case Studies', icon: Briefcase },
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
];

const EMPTY_FORM = { title: '', type: 'whitepaper', summary: '', body: '', fileUrl: '', tags: '' };

export default function ContentHub() {
  const { isSuperAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (type) params.type = type;
      if (query) params.q = query;
      setItems(await api.getContentItems(params));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, query]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const open = async (item) => {
    try {
      setSelected(await api.getContentItem(item.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.addContentItem({
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

  // ---------- Detail view ----------
  if (selected) {
    const typeMeta = TYPES.find((t) => t.id === selected.type);
    let tags = [];
    try { tags = JSON.parse(selected.tags || '[]'); } catch { /* ignore */ }
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-nobus-600 hover:text-nobus-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Content Hub
        </button>
        <div className="card p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-blue capitalize">{typeMeta?.label || selected.type}</span>
            {tags.map((t) => <span key={t} className="badge bg-gray-100 text-gray-600">{t}</span>)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h1>
          {selected.summary && <p className="text-gray-600 mb-4">{selected.summary}</p>}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {selected.views} views</span>
            <span>Published {new Date(selected.created_at + 'Z').toLocaleDateString()}</span>
          </div>
          {selected.body && <MarkdownRenderer content={selected.body} />}
          {selected.file_url && (
            <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 btn-secondary text-sm">
              <ExternalLink className="w-4 h-4" /> Open source document
            </a>
          )}
        </div>
      </div>
    );
  }

  // ---------- List view ----------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Library className="w-7 h-7 text-nobus-500" /> Content Hub
          </h1>
          <p className="text-gray-600">Whitepapers, datasheets, case studies and FAQs to support your customer conversations.</p>
        </div>
        {isSuperAdmin && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Publish Content
          </button>
        )}
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search content…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setType('')}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              !type ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'
            }`}>
            All
          </button>
          {TYPES.map(({ id, label }) => (
            <button key={id} onClick={() => setType(id)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                type === id ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((item) => {
            const typeMeta = TYPES.find((t) => t.id === item.type);
            const Icon = typeMeta?.icon || FileText;
            let tags = [];
            try { tags = JSON.parse(item.tags || '[]'); } catch { /* ignore */ }
            return (
              <button key={item.id} onClick={() => open(item)}
                className="card p-5 text-left hover:border-nobus-200 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-nobus-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-nobus-500" />
                  </div>
                  <span className="badge-blue capitalize">{typeMeta?.label.replace(/s$/, '') || item.type}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-3 flex-1">{item.summary}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 3).map((t) => <span key={t} className="badge bg-gray-100 text-gray-600">{t}</span>)}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                    <Eye className="w-3.5 h-3.5" /> {item.views}
                  </span>
                </div>
              </button>
            );
          })}
          {items.length === 0 && (
            <div className="col-span-full card p-12 text-center text-gray-500">
              <Library className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No content matches your filters.
            </div>
          )}
        </div>
      )}

      {/* Publish content modal (super admin) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Publish Content</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                    {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea rows="2" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body (Markdown)</label>
                <textarea rows="8" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">External file URL (optional)</label>
                  <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Publishing…' : 'Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
