import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Send, CheckCircle2, Loader2, ChevronLeft, Pin, Lock, Unlock, Trash2, ShieldCheck, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Discussions() {
  const { currentUser, isSuperAdmin } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [accepted, setAccepted] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [roomFilter, setRoomFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newRoom, setNewRoom] = useState('general');
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roomLabel = (id) => rooms.find((r) => r.id === id)?.label || id;
  // Rooms a member may post in (Announcements is staff-only).
  const postableRooms = rooms.filter((r) => !r.staffOnly || isSuperAdmin);

  const loadDiscussions = useCallback(async (room) => {
    try { setDiscussions(await api.getDiscussions(room && room !== 'all' ? { room } : undefined)); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const meta = await api.getForumMeta();
        setRooms(meta.rooms); setGuidelines(meta.guidelines); setAccepted(meta.accepted);
      } catch { /* ignore */ }
      await loadDiscussions('all');
      setLoading(false);
    })();
  }, [loadDiscussions]);

  const selectRoom = (room) => { setRoomFilter(room); setSelected(null); setShowNew(false); loadDiscussions(room); };

  async function loadDiscussion(id) {
    try { setSelected(await api.getDiscussion(id)); } catch { /* ignore */ }
  }

  // Any attempt to post requires accepting the guidelines first.
  const requireAccepted = (then) => { if (accepted) return then(); setShowGuidelines(true); };

  async function acceptGuidelines() {
    try { await api.acceptGuidelines(); setAccepted(true); setShowGuidelines(false); } catch { /* ignore */ }
  }

  function openNew() {
    requireAccepted(() => { setShowNew(true); setSelected(null); setNewRoom(roomFilter !== 'all' && postableRooms.some((r) => r.id === roomFilter) ? roomFilter : 'general'); });
  }

  async function handleCreateDiscussion(e) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const result = await api.createDiscussion({ title: newTitle, body: newBody, room: newRoom });
      setShowNew(false); setNewTitle(''); setNewBody('');
      await loadDiscussions(roomFilter);
      loadDiscussion(result.id);
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmitting(true); setError('');
    try {
      await api.postReply(selected.id, replyBody);
      setReplyBody('');
      loadDiscussion(selected.id);
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  }

  async function handleMarkAnswer(replyId) {
    try { await api.markAnswer(selected.id, replyId); loadDiscussion(selected.id); } catch { /* ignore */ }
  }
  async function togglePin() {
    try { await api.pinDiscussion(selected.id, !selected.pinned); loadDiscussion(selected.id); loadDiscussions(roomFilter); } catch { /* ignore */ }
  }
  async function toggleClose() {
    try { await api.closeDiscussion(selected.id, !selected.closed); loadDiscussion(selected.id); loadDiscussions(roomFilter); } catch { /* ignore */ }
  }
  async function handleDelete() {
    if (!confirm('Delete this discussion and all its replies? This cannot be undone.')) return;
    try { await api.deleteDiscussion(selected.id); setSelected(null); loadDiscussions(roomFilter); } catch { /* ignore */ }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-500 text-sm mt-1">Ask questions, share knowledge, help each other - across the whole partner network.</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Discussion
        </button>
      </div>

      {!accepted && (
        <div className="card p-4 mb-5 flex flex-wrap items-center gap-3 bg-nobus-50/60 border-nobus-100">
          <ShieldCheck className="w-5 h-5 text-nobus-500 shrink-0" />
          <span className="text-sm text-gray-700">Review and accept the community guidelines to start posting.</span>
          <button onClick={() => setShowGuidelines(true)} className="ml-auto btn-secondary !py-1.5 text-sm">Read &amp; accept</button>
        </div>
      )}

      {/* Room filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {[{ id: 'all', label: 'All rooms' }, ...rooms].map((r) => (
          <button key={r.id} onClick={() => selectRoom(r.id)}
            className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-lg font-medium ${roomFilter === r.id ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'}`}>
            {r.label}
          </button>
        ))}
        <button onClick={() => setShowGuidelines(true)} title="Community guidelines"
          className="whitespace-nowrap text-sm px-3 py-1.5 rounded-lg font-medium bg-white border border-gray-200 text-gray-500 hover:border-nobus-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Guidelines
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {showNew && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Start a Discussion</h2>
          <form onSubmit={handleCreateDiscussion} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title"
                required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" />
              <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none">
                {postableRooms.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="What's on your mind?"
              required rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Posting...' : 'Post'}</button>
              <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-nobus-600 hover:underline text-sm mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to discussions
          </button>
          <div className="card p-6 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {selected.room && <span className="badge bg-nobus-50 text-nobus-700">{roomLabel(selected.room)}</span>}
                  {selected.pinned ? <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span> : null}
                  {selected.closed ? <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Closed</span> : null}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-1.5">{selected.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{selected.author_name}</span>
                  <span>&middot;</span>
                  <span>{new Date(selected.created_at).toLocaleDateString()}</span>
                  {selected.author_role === 'super_admin' && <span className="px-2 py-0.5 bg-nobus-100 text-nobus-700 rounded-full text-xs font-medium">Admin</span>}
                </div>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={togglePin} title={selected.pinned ? 'Unpin' : 'Pin to top'}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${selected.pinned ? 'text-amber-600' : 'text-gray-400'}`}><Pin className="w-4 h-4" /></button>
                  <button onClick={toggleClose} title={selected.closed ? 'Reopen' : 'Close to replies'}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                    {selected.closed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</button>
                  <button onClick={handleDelete} title="Delete discussion"
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="mt-4 text-gray-700 whitespace-pre-wrap">{selected.body}</div>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {selected.replies?.length || 0} Replies
          </h3>

          <div className="space-y-3 mb-6">
            {selected.replies?.map((reply) => (
              <div key={reply.id} className={`card p-4 ${reply.is_answer ? 'border-green-300 bg-green-50' : ''}`}>
                {reply.is_answer && <div className="flex items-center gap-1 text-green-600 text-xs font-bold mb-2"><CheckCircle2 className="w-3 h-3" /> Accepted Answer</div>}
                <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{reply.author_name}</span> &middot; {new Date(reply.created_at).toLocaleDateString()}
                  </div>
                  {(currentUser.id === selected.user_id || currentUser.role === 'super_admin') && !reply.is_answer && (
                    <button onClick={() => handleMarkAnswer(reply.id)} className="text-xs text-green-600 hover:underline">Mark as answer</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selected.closed && !isSuperAdmin ? (
            <div className="card p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> This discussion is closed to new replies.
            </div>
          ) : !accepted ? (
            <div className="card p-4 text-center text-sm text-gray-500">
              <button onClick={() => setShowGuidelines(true)} className="text-nobus-600 font-medium hover:underline">Accept the community guidelines</button> to reply.
            </div>
          ) : (
            <div>
              {selected.closed && isSuperAdmin && (
                <div className="text-xs text-amber-600 mb-1.5">This discussion is closed - only Nobus staff can still reply.</div>
              )}
              <form onSubmit={handleReply} className="flex gap-2">
                <input value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" />
                <button type="submit" disabled={submitting} className="btn-primary px-4"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">No discussions in this room yet. Start the first one!</div>
          ) : discussions.map((d) => (
            <button key={d.id} onClick={() => loadDiscussion(d.id)}
              className="w-full text-left card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {d.pinned ? <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : null}
                    {d.closed ? <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : null}
                    <h3 className="font-semibold text-gray-900">{d.title}</h3>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                    {d.room && <span className="badge bg-gray-100 text-gray-600 !py-0">{roomLabel(d.room)}</span>}
                    <span>{d.author_name} &middot; {new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm shrink-0">
                  <MessageSquare className="w-4 h-4" /> {d.reply_count}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showGuidelines && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGuidelines(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-nobus-500" /> Community Guidelines</h2>
              <button onClick={() => setShowGuidelines(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">The Nobus PartnerCentral community is a shared space for all partners. By participating you agree to:</p>
            <ol className="space-y-2 mb-5 list-decimal pl-5">
              {guidelines.map((g, i) => <li key={i} className="text-sm text-gray-700">{g}</li>)}
            </ol>
            {accepted ? (
              <div className="text-center text-sm text-green-600 font-medium flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> You have accepted these guidelines.</div>
            ) : (
              <div className="flex gap-2">
                <button onClick={acceptGuidelines} className="btn-primary flex-1">I agree</button>
                <button onClick={() => setShowGuidelines(false)} className="btn-secondary flex-1">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
