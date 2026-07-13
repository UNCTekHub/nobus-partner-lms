import { useState, useEffect, useCallback } from 'react';
import { Calculator, Plus, X, Trash2, Loader2, Printer, Save, ArrowLeft, FileText, ExternalLink, ShieldCheck, FileDown, Sheet, BadgePercent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CATALOG, DB_SIZES, itemMonthly, quoteBreakdown, buildQuoteLines, naira, PARTNER_DISCOUNT_PCT } from '../data/pricingCatalog';

let itemSeq = 1;

function newItem(service) {
  const base = { key: itemSeq++, serviceId: service.id, name: service.name, kind: service.kind, qty: 1 };
  if (service.kind === 'instance') base.flavorId = service.options[0].id;
  if (service.kind === 'perUnit') { base.unitPrice = service.unitPrice; base.unit = service.unit; base.qty = 10; }
  if (service.kind === 'database') { base.engine = service.engines[0]; base.sizeId = service.sizes[0].id; }
  if (service.kind === 'appliance') base.customPrice = service.defaultPrice || 0;
  return base;
}

export default function QuoteBuilder() {
  const { organization, currentUser } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // list | build | print
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [printQuote, setPrintQuote] = useState(null);
  const [discount, setDiscount] = useState(false);
  const [exporting, setExporting] = useState(null);

  const load = useCallback(async () => {
    try {
      setQuotes(await api.getQuotes());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setItems([]); setTitle(''); setCustomerName(''); setNotes(''); setEditingId(null); setDiscount(false);
    setView('build');
  };

  const startEdit = (q) => {
    let parsed = [];
    try { parsed = JSON.parse(q.items || '[]'); } catch { /* ignore */ }
    parsed.forEach((it) => { it.key = itemSeq++; });
    setItems(parsed); setTitle(q.title); setCustomerName(q.customer_name || ''); setNotes(q.notes || '');
    setDiscount((q.discount_pct || 0) > 0);
    setEditingId(q.id);
    setView('build');
  };

  const exportQuote = async (q, format) => {
    setExporting(`${q.id}-${format}`);
    try {
      const blob = await api.exportQuote(q.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NCS-Q-${String(q.id).padStart(5, '0')}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(null);
    }
  };

  const addItem = (service) => setItems((prev) => [...prev, newItem(service)]);
  const updateItem = (key, patch) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const removeItem = (key) => setItems((prev) => prev.filter((it) => it.key !== key));

  const discountPct = discount ? PARTNER_DISCOUNT_PCT : 0;
  const fin = quoteBreakdown(items, discountPct);
  const monthly = fin.netMonthly;

  const save = async (status) => {
    if (!title.trim()) { setError('Give the quote a title first.'); return; }
    setSaving(true);
    setError('');
    try {
      const cleanItems = items.map(({ key, ...rest }) => rest);
      const payload = {
        title: title.trim(),
        customerName: customerName.trim() || null,
        items: cleanItems,
        lines: buildQuoteLines(cleanItems),
        discountPct,
        monthlyTotal: monthly,
        notes: notes.trim() || null,
        status,
      };
      if (editingId) await api.updateQuote(editingId, payload);
      else await api.createQuote(payload);
      setView('list');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (q) => {
    if (!window.confirm(`Delete quote "${q.title}"?`)) return;
    await api.deleteQuote(q.id);
    load();
  };

  const openPrint = (q) => {
    let parsed = [];
    try { parsed = JSON.parse(q.items || '[]'); } catch { /* ignore */ }
    setPrintQuote({ ...q, parsedItems: parsed });
    setView('print');
  };

  const describeItem = (item) => {
    if (item.kind === 'instance') {
      const flavor = CATALOG.flatMap((c) => c.services).find((s) => s.id === item.serviceId)
        ?.options?.find((f) => f.id === item.flavorId);
      return flavor?.label || item.flavorId;
    }
    if (item.kind === 'perUnit') return `${item.qty} ${item.unit} × ${naira(item.unitPrice)}/${item.unit}-month`;
    if (item.kind === 'database') {
      const size = DB_SIZES.find((s) => s.id === item.sizeId);
      return `${item.engine} · ${size?.label || item.sizeId}`;
    }
    if (item.kind === 'appliance') return item.customPrice > 0 ? `Agreed rate ${naira(item.customPrice)}/month` : 'Priced on request';
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
      </div>
    );
  }

  // ============ PRINT VIEW ============
  if (view === 'print' && printQuote) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm font-medium text-nobus-600 hover:text-nobus-700">
            <ArrowLeft className="w-4 h-4" /> Back to quotes
          </button>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>

        <div className="card p-8 print:shadow-none print:border-0">
          <div className="flex items-start justify-between pb-6 border-b-2 border-nobus-950 mb-6">
            <div>
              <div className="bg-nobus-950 rounded-lg px-3 py-2 inline-block mb-2">
                <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-8 w-auto" />
              </div>
              <div className="text-xs text-gray-500">Nobus Cloud Services (Nkponani Limited)</div>
              <div className="text-xs text-gray-500">Prepared by {printQuote.org_name} - Nobus Cloud Partner</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">Cloud Services Quote</div>
              <div className="text-sm text-gray-500">Ref: NCS-Q-{String(printQuote.id).padStart(5, '0')}</div>
              <div className="text-sm text-gray-500">{new Date(printQuote.updated_at + 'Z').toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prepared for</div>
              <div className="font-semibold text-gray-900">{printQuote.customer_name || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quote</div>
              <div className="font-semibold text-gray-900">{printQuote.title}</div>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-nobus-950 text-white">
                <th className="text-left p-2.5 rounded-l-lg">Service</th>
                <th className="text-left p-2.5">Configuration</th>
                <th className="text-right p-2.5">Qty</th>
                <th className="text-right p-2.5 rounded-r-lg">Monthly (₦)</th>
              </tr>
            </thead>
            <tbody>
              {printQuote.parsedItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-2.5 font-medium text-gray-900">{item.name}</td>
                  <td className="p-2.5 text-gray-600">{describeItem(item)}</td>
                  <td className="p-2.5 text-right text-gray-600">{item.qty}</td>
                  <td className="p-2.5 text-right font-medium text-gray-900">{naira(itemMonthly(item))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {(() => {
                const pfin = quoteBreakdown(printQuote.parsedItems, printQuote.discount_pct || 0);
                return (
                  <>
                    <tr>
                      <td colSpan="3" className="p-2.5 text-right font-bold text-gray-900">Sub total monthly</td>
                      <td className="p-2.5 text-right font-bold text-gray-900">{naira(pfin.subtotalMonthly)}</td>
                    </tr>
                    {pfin.discountMonthly > 0 && (
                      <tr>
                        <td colSpan="3" className="p-2.5 text-right text-green-700">Exclusive partner pricing (compute &amp; storage)</td>
                        <td className="p-2.5 text-right text-green-700 font-medium">−{naira(pfin.discountMonthly)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="p-2.5 text-right text-gray-500">Sub total annual</td>
                      <td className="p-2.5 text-right text-gray-700 font-medium">{naira(pfin.netAnnual)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="p-2.5 text-right text-gray-500">VAT (7.5%)</td>
                      <td className="p-2.5 text-right text-gray-700 font-medium">{naira(pfin.vatAnnual)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="p-2.5 text-right font-bold text-gray-900">Total (annual, incl. VAT)</td>
                      <td className="p-2.5 text-right font-bold text-nobus-600 text-base">{naira(pfin.totalAnnual)}</td>
                    </tr>
                  </>
                );
              })()}
            </tfoot>
          </table>

          {printQuote.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="font-semibold text-gray-800 mb-1">Notes</div>
              {printQuote.notes}
            </div>
          )}

          <div className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
            All prices in Nigerian Naira (NGN), exclusive of VAT and applicable taxes. Billed in Naira with no
            foreign-exchange exposure. This is an indicative estimate based on published Nobus rates - final
            pricing is confirmed at order via the Nobus Pricing Calculator (nobus.io/nobus-pricing-calculator).
            Items marked "priced on request" require a Nobus sales quotation. Valid for 30 days.
          </div>
        </div>
      </div>
    );
  }

  // ============ BUILD VIEW ============
  if (view === 'build') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm font-medium text-nobus-600 hover:text-nobus-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to quotes
        </button>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Catalog column */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-nobus-500" /> Service Catalog
            </h2>
            {CATALOG.map((cat) => (
              <div key={cat.category} className="card p-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{cat.category}</div>
                <div className="space-y-1.5">
                  {cat.services.map((svc) => (
                    <button key={svc.id} onClick={() => addItem(svc)} title={svc.blurb}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left text-gray-700 hover:bg-nobus-50 hover:text-nobus-700 border border-transparent hover:border-nobus-200 transition-all group">
                      {svc.name}
                      <Plus className="w-4 h-4 text-gray-300 group-hover:text-nobus-500" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 leading-relaxed">
              Rates from published nobus.io pricing. Validate final figures with the{' '}
              <a href="https://nobus.io/nobus-pricing-calculator" target="_blank" rel="noopener noreferrer" className="text-nobus-600 hover:underline">
                official Pricing Calculator <ExternalLink className="w-3 h-3 inline" />
              </a>.
            </p>
          </div>

          {/* Estimate column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Zenith MFB - core banking environment"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer / prospect name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="card p-12 text-center text-gray-400">
                <Calculator className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                Add services from the catalog to start the estimate.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const service = CATALOG.flatMap((c) => c.services).find((s) => s.id === item.serviceId);
                  return (
                    <div key={item.key} className="card p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="font-medium text-gray-900 flex-1 min-w-[140px]">{item.name}</div>

                        {item.kind === 'instance' && (
                          <select value={item.flavorId} onChange={(e) => updateItem(item.key, { flavorId: e.target.value })}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm max-w-[340px] focus:outline-none focus:ring-2 focus:ring-nobus-400">
                            {service.options.map((f) => (
                              <option key={f.id} value={f.id}>{f.label} - {naira(f.monthly)}/mo</option>
                            ))}
                          </select>
                        )}

                        {item.kind === 'database' && (
                          <>
                            <select value={item.engine} onChange={(e) => updateItem(item.key, { engine: e.target.value })}
                              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                              {service.engines.map((eng) => <option key={eng}>{eng}</option>)}
                            </select>
                            <select value={item.sizeId} onChange={(e) => updateItem(item.key, { sizeId: e.target.value })}
                              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm max-w-[280px] focus:outline-none focus:ring-2 focus:ring-nobus-400">
                              {service.sizes.map((s) => <option key={s.id} value={s.id}>{s.label} - {naira(s.monthly)}/mo</option>)}
                            </select>
                          </>
                        )}

                        {item.kind === 'perUnit' && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="number" min="0" max={service.max || 100000} value={item.qty}
                              onChange={(e) => updateItem(item.key, { qty: Number(e.target.value) })}
                              className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                            <span>{item.unit} × {naira(item.unitPrice)}</span>
                          </div>
                        )}

                        {item.kind === 'appliance' && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>₦/month:</span>
                            <input type="number" min="0" value={item.customPrice}
                              onChange={(e) => updateItem(item.key, { customPrice: Number(e.target.value) })}
                              placeholder="Agreed rate"
                              className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                          </div>
                        )}

                        {item.kind !== 'perUnit' && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <span>Qty</span>
                            <input type="number" min="1" value={item.qty}
                              onChange={(e) => updateItem(item.key, { qty: Math.max(1, Number(e.target.value)) })}
                              className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                          </div>
                        )}

                        <div className="ml-auto flex items-center gap-3">
                          <span className="font-semibold text-nobus-600 whitespace-nowrap">{naira(itemMonthly(item))}/mo</span>
                          <button onClick={() => removeItem(item.key)} className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {service?.blurb && <div className="text-xs text-gray-400 mt-2">{service.blurb}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="card p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes for the customer</label>
              <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Assumptions, migration scope, support terms…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
            </div>

            {/* Partner discount */}
            <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={discount} onChange={(e) => setDiscount(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-nobus-500 focus:ring-nobus-400" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <BadgePercent className="w-4 h-4 text-nobus-500" /> Apply exclusive partner pricing
                  </div>
                  <div className="text-xs text-gray-400">
                    Preferential partner rates per the NCS Partner Agreement - applies to compute &amp; storage only (excludes connectivity, licensed software).
                  </div>
                </div>
              </label>
              {discount && <span className="badge-green">−{naira(fin.discountMonthly)}/mo</span>}
            </div>

            {/* Total bar */}
            <div className="card p-5 bg-nobus-950 !border-nobus-900 text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-0.5 text-sm">
                  <div className="flex justify-between gap-10 text-nobus-300">
                    <span>Sub total monthly</span><span>{naira(fin.subtotalMonthly)}</span>
                  </div>
                  {discount && (
                    <div className="flex justify-between gap-10 text-green-300">
                      <span>Exclusive partner pricing</span><span>−{naira(fin.discountMonthly)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-10 text-nobus-300">
                    <span>Sub total annual</span><span>{naira(fin.netAnnual)}</span>
                  </div>
                  <div className="flex justify-between gap-10 text-nobus-300">
                    <span>VAT (7.5%)</span><span>{naira(fin.vatAnnual)}</span>
                  </div>
                  <div className="flex justify-between gap-10 text-white font-bold text-lg pt-1 border-t border-white/20">
                    <span>Total (annual, incl. VAT)</span><span>{naira(fin.totalAnnual)}</span>
                  </div>
                  <div className="text-xs text-nobus-400 pt-1">{naira(monthly)}/month net · Local billing, zero FX risk</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => save('draft')} disabled={saving}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button onClick={() => save('final')} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? 'Saving…' : <><FileText className="w-4 h-4" /> Finalize Quote</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ LIST VIEW ============
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Calculator className="w-7 h-7 text-nobus-500" /> Quote Builder
          </h1>
          <p className="text-gray-600">
            Build customer-ready Naira estimates from the Nobus service catalog - compute, storage, networking, databases and security.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={startNew}>
          <Plus className="w-4 h-4" /> New Quote
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{q.title}</h3>
                <span className={q.status === 'final' ? 'badge-green' : 'badge-amber'}>{q.status}</span>
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {q.customer_name || 'No customer set'} · Ref NCS-Q-{String(q.id).padStart(5, '0')} · by {q.author_name}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold text-nobus-600">{naira(q.monthly_total)}<span className="text-xs font-medium text-gray-400">/mo</span></div>
                <div className="text-xs text-gray-400">{new Date(q.updated_at + 'Z').toLocaleDateString()}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => exportQuote(q, 'pdf')} title="Download PDF" disabled={exporting === `${q.id}-pdf`}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40">
                  {exporting === `${q.id}-pdf` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                </button>
                <button onClick={() => exportQuote(q, 'xlsx')} title="Download Excel (.xlsx)" disabled={exporting === `${q.id}-xlsx`}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40">
                  {exporting === `${q.id}-xlsx` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />}
                </button>
                <button onClick={() => openPrint(q)} title="Print view"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"><Printer className="w-4 h-4" /></button>
                <button onClick={() => startEdit(q)} title="Edit"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"><Calculator className="w-4 h-4" /></button>
                <Link to="/deals" title="Register deal with this quote"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"><ShieldCheck className="w-4 h-4" /></Link>
                <button onClick={() => remove(q)} title="Delete"
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="card p-12 text-center text-gray-500">
            <Calculator className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No quotes yet. Build your first customer estimate from the Nobus catalog.
          </div>
        )}
      </div>
    </div>
  );
}
