import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Trophy, Ban, Loader2, Plus, X, EyeOff, Eye, Printer, ShieldCheck, Calculator, Megaphone, Library, FlaskConical, CalendarCheck } from 'lucide-react';
import { api } from '../lib/api';

const naira = (n) => '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400';

function Th({ children }) {
  return <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 whitespace-nowrap">{children}</th>;
}

function StatusBadge({ status }) {
  const cls = {
    pending: 'badge-amber', approved: 'badge-green', rejected: 'badge bg-red-50 text-red-700',
    expired: 'badge bg-gray-100 text-gray-600', won: 'badge-green', lost: 'badge bg-gray-100 text-gray-600',
    draft: 'badge-amber', final: 'badge-green', booked: 'badge-blue', completed: 'badge-green',
    cancelled: 'badge bg-gray-100 text-gray-500',
  }[status] || 'badge-blue';
  return <span className={cls}>{status}</span>;
}

// ==================== Deals & Quotes ====================

export function AdminDealsQuotes() {
  const [deals, setDeals] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState('deals');

  const load = useCallback(async () => {
    try {
      const [d, q] = await Promise.all([api.getDeals(), api.getQuotes()]);
      setDeals(d); setQuotes(q);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const review = async (deal, action) => {
    if (action === 'approve') await api.approveDeal(deal.id);
    else {
      const reason = window.prompt('Rejection reason (optional):') || '';
      await api.rejectDeal(deal.id, reason);
    }
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-nobus-500" /></div>;

  const pending = deals.filter((d) => d.status === 'pending');

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <button onClick={() => setSub('deals')} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${sub === 'deals' ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <ShieldCheck className="w-4 h-4 inline mr-1" />Deals ({pending.length} pending)
        </button>
        <button onClick={() => setSub('quotes')} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${sub === 'quotes' ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          <Calculator className="w-4 h-4 inline mr-1" />Quotes ({quotes.length})
        </button>
      </div>

      {sub === 'deals' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead><tr className="bg-gray-50 border-b">
              <Th>Opportunity</Th><Th>Customer</Th><Th>Partner</Th><Th>Value</Th><Th>Status</Th><Th>Registered</Th><Th>Actions</Th>
            </tr></thead>
            <tbody className="divide-y">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{d.opportunity_name}</div>
                    {d.duplicate_of && <span className="text-xs text-red-600">possible duplicate of #{d.duplicate_of}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.org_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-nobus-600">{naira(d.est_value)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(d.created_at + 'Z').toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {d.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => review(d, 'approve')} title="Approve" className="p-1.5 rounded text-green-600 hover:bg-green-50"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => review(d, 'reject')} title="Reject" className="p-1.5 rounded text-red-500 hover:bg-red-50"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {deals.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No deals registered yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {sub === 'quotes' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="bg-gray-50 border-b">
              <Th>Ref</Th><Th>Title</Th><Th>Customer</Th><Th>Partner</Th><Th>Monthly</Th><Th>Status</Th><Th>Updated</Th>
            </tr></thead>
            <tbody className="divide-y">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">NCS-Q-{String(q.id).padStart(5, '0')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{q.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{q.customer_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{q.org_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-nobus-600">{naira(q.monthly_total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(q.updated_at + 'Z').toLocaleDateString()}</td>
                </tr>
              ))}
              {quotes.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No quotes yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== Resources (marketing + content) ====================

const ASSET_CATEGORIES = ['Logos & Brand', 'Brochures', 'Battle Cards', 'Email Templates', 'Social Media', 'Presentations'];
const CONTENT_TYPES = ['whitepaper', 'datasheet', 'case-study', 'faq'];

export function AdminResources() {
  const [assets, setAssets] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState('marketing');
  const [assetForm, setAssetForm] = useState(null);
  const [contentForm, setContentForm] = useState(null);

  const load = useCallback(async () => {
    try {
      const [a, c] = await Promise.all([api.getMarketingAssets(), api.getContentItems()]);
      setAssets(a); setContent(c);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveAsset = async (e) => {
    e.preventDefault();
    await api.addMarketingAsset({ ...assetForm, tags: assetForm.tags.split(',').map((t) => t.trim()).filter(Boolean) });
    setAssetForm(null); load();
  };
  const saveContent = async (e) => {
    e.preventDefault();
    await api.addContentItem({ ...contentForm, tags: contentForm.tags.split(',').map((t) => t.trim()).filter(Boolean) });
    setContentForm(null); load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-nobus-500" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          <button onClick={() => setSub('marketing')} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${sub === 'marketing' ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <Megaphone className="w-4 h-4 inline mr-1" />Marketing ({assets.length})
          </button>
          <button onClick={() => setSub('content')} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${sub === 'content' ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <Library className="w-4 h-4 inline mr-1" />Content Hub ({content.length})
          </button>
        </div>
        <button className="btn-primary !py-2 text-sm flex items-center gap-1.5"
          onClick={() => sub === 'marketing'
            ? setAssetForm({ title: '', description: '', category: ASSET_CATEGORIES[1], fileUrl: '', fileType: 'PDF', tags: '' })
            : setContentForm({ title: '', type: 'whitepaper', summary: '', body: '', fileUrl: '', tags: '' })}>
          <Plus className="w-4 h-4" /> Add {sub === 'marketing' ? 'Asset' : 'Content'}
        </button>
      </div>

      {sub === 'marketing' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="bg-gray-50 border-b"><Th>Title</Th><Th>Category</Th><Th>Type</Th><Th>Downloads</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.category}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{a.file_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.downloads}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { await api.updateMarketingAsset(a.id, { active: 0 }); load(); }}
                      title="Unpublish" className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-500"><EyeOff className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === 'content' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="bg-gray-50 border-b"><Th>Title</Th><Th>Type</Th><Th>Views</Th><Th>Published</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y">
              {content.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{c.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.views}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.created_at + 'Z').toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { await api.updateContentItem(c.id, { active: 0 }); load(); }}
                      title="Unpublish" className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-500"><EyeOff className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add asset modal */}
      {assetForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAssetForm(null)}>
          <form onSubmit={saveAsset} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">Add Marketing Asset</h3>
              <button type="button" onClick={() => setAssetForm(null)}><X className="w-5 h-5" /></button>
            </div>
            <input required placeholder="Title *" value={assetForm.title} onChange={(e) => setAssetForm({ ...assetForm, title: e.target.value })} className={inputCls} />
            <textarea rows="2" placeholder="Description" value={assetForm.description} onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <select value={assetForm.category} onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })} className={inputCls}>
                {ASSET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={assetForm.fileType} onChange={(e) => setAssetForm({ ...assetForm, fileType: e.target.value })} className={inputCls}>
                {['PDF', 'PPTX', 'DOCX', 'ZIP', 'PNG', 'SVG', 'MP4'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <input required type="url" placeholder="File URL *" value={assetForm.fileUrl} onChange={(e) => setAssetForm({ ...assetForm, fileUrl: e.target.value })} className={inputCls} />
            <input placeholder="Tags (comma-separated)" value={assetForm.tags} onChange={(e) => setAssetForm({ ...assetForm, tags: e.target.value })} className={inputCls} />
            <button type="submit" className="btn-primary w-full">Publish Asset</button>
          </form>
        </div>
      )}

      {/* Add content modal */}
      {contentForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setContentForm(null)}>
          <form onSubmit={saveContent} className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">Publish Content</h3>
              <button type="button" onClick={() => setContentForm(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Title *" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} className={inputCls} />
              <select value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })} className={inputCls}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <textarea rows="2" placeholder="Summary" value={contentForm.summary} onChange={(e) => setContentForm({ ...contentForm, summary: e.target.value })} className={inputCls} />
            <textarea rows="7" placeholder="Body (Markdown)" value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} className={`${inputCls} font-mono`} />
            <div className="grid grid-cols-2 gap-3">
              <input type="url" placeholder="External file URL (optional)" value={contentForm.fileUrl} onChange={(e) => setContentForm({ ...contentForm, fileUrl: e.target.value })} className={inputCls} />
              <input placeholder="Tags (comma-separated)" value={contentForm.tags} onChange={(e) => setContentForm({ ...contentForm, tags: e.target.value })} className={inputCls} />
            </div>
            <button type="submit" className="btn-primary w-full">Publish</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==================== Demo Labs & Bookings ====================

export function AdminLabs() {
  const [labs, setLabs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState('bookings');
  const [labForm, setLabForm] = useState(null);

  const load = useCallback(async () => {
    try {
      const [l, b] = await Promise.all([api.getLabs(), api.getLabBookings()]);
      setLabs(l); setBookings(b);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveLab = async (e) => {
    e.preventDefault();
    await api.createLab({ ...labForm, durationMinutes: Number(labForm.durationMinutes) || 60 });
    setLabForm(null); load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-nobus-500" /></div>;

  const active = bookings.filter((b) => b.status === 'booked');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          <button onClick={() => setSub('bookings')} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${sub === 'bookings' ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <CalendarCheck className="w-4 h-4 inline mr-1" />Bookings ({active.length} upcoming)
          </button>
          <button onClick={() => setSub('labs')} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${sub === 'labs' ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <FlaskConical className="w-4 h-4 inline mr-1" />Lab Catalogue ({labs.length})
          </button>
        </div>
        {sub === 'labs' && (
          <button className="btn-primary !py-2 text-sm flex items-center gap-1.5"
            onClick={() => setLabForm({ title: '', description: '', serviceArea: 'Compute', difficulty: 'Beginner', durationMinutes: 60, guide: '' })}>
            <Plus className="w-4 h-4" /> Add Lab
          </button>
        )}
      </div>

      {sub === 'bookings' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="bg-gray-50 border-b"><Th>Lab</Th><Th>Partner User</Th><Th>Organization</Th><Th>Scheduled</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.lab_title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.user_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.org_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.scheduled_date} · {b.time_slot}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    {b.status === 'booked' && (
                      <div className="flex gap-1.5">
                        <button onClick={async () => { await api.completeLabBooking(b.id); load(); }} title="Mark completed"
                          className="p-1.5 rounded text-green-600 hover:bg-green-50"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={async () => { await api.cancelLabBooking(b.id); load(); }} title="Cancel"
                          className="p-1.5 rounded text-red-500 hover:bg-red-50"><Ban className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {sub === 'labs' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="bg-gray-50 border-b"><Th>Title</Th><Th>Area</Th><Th>Difficulty</Th><Th>Duration</Th><Th>Actions</Th></tr></thead>
            <tbody className="divide-y">
              {labs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{l.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{l.service_area}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{l.difficulty}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{l.duration_minutes} min</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { await api.updateLab(l.id, { active: 0 }); load(); }}
                      title="Retire lab" className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-500"><EyeOff className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add lab modal */}
      {labForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setLabForm(null)}>
          <form onSubmit={saveLab} className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">Add Demo Lab</h3>
              <button type="button" onClick={() => setLabForm(null)}><X className="w-5 h-5" /></button>
            </div>
            <input required placeholder="Title *" value={labForm.title} onChange={(e) => setLabForm({ ...labForm, title: e.target.value })} className={inputCls} />
            <textarea rows="2" placeholder="Description" value={labForm.description} onChange={(e) => setLabForm({ ...labForm, description: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-3 gap-3">
              <select value={labForm.serviceArea} onChange={(e) => setLabForm({ ...labForm, serviceArea: e.target.value })} className={inputCls}>
                {['Compute', 'Storage & Backup', 'Networking & Security', 'Containers', 'Databases', 'Automation'].map((a) => <option key={a}>{a}</option>)}
              </select>
              <select value={labForm.difficulty} onChange={(e) => setLabForm({ ...labForm, difficulty: e.target.value })} className={inputCls}>
                {['Beginner', 'Intermediate', 'Advanced'].map((d) => <option key={d}>{d}</option>)}
              </select>
              <input type="number" min="15" placeholder="Minutes" value={labForm.durationMinutes} onChange={(e) => setLabForm({ ...labForm, durationMinutes: e.target.value })} className={inputCls} />
            </div>
            <textarea rows="8" placeholder="Lab guide (Markdown)" value={labForm.guide} onChange={(e) => setLabForm({ ...labForm, guide: e.target.value })} className={`${inputCls} font-mono`} />
            <button type="submit" className="btn-primary w-full">Publish Lab</button>
          </form>
        </div>
      )}
    </div>
  );
}
