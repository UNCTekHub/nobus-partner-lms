import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, CheckCircle2, Loader2, ChevronLeft } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Discussions() {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadDiscussions(); }, []);

  async function loadDiscussions() {
    setLoading(true);
    try { setDiscussions(await api.getDiscussions()); } catch {} finally { setLoading(false); }
  }

  async function loadDiscussion(id) {
    try { setSelected(await api.getDiscussion(id)); } catch {}
  }

  async function handleCreateDiscussion(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.createDiscussion({ title: newTitle, body: newBody });
      setShowNew(false);
      setNewTitle('');
      setNewBody('');
      loadDiscussions();
      loadDiscussion(result.id);
    } catch {} finally { setSubmitting(false); }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await api.postReply(selected.id, replyBody);
      setReplyBody('');
      loadDiscussion(selected.id);
    } catch {} finally { setSubmitting(false); }
  }

  async function handleMarkAnswer(replyId) {
    try {
      await api.markAnswer(selected.id, replyId);
      loadDiscussion(selected.id);
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discussion Forum</h1>
          <p className="text-gray-500 text-sm mt-1">Ask questions, share knowledge, help each other</p>
        </div>
        <button onClick={() => { setShowNew(true); setSelected(null); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Discussion
        </button>
      </div>

      {showNew && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Start a Discussion</h2>
          <form onSubmit={handleCreateDiscussion} className="space-y-4">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title"
              required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" />
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
            <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{selected.author_name}</span>
              <span>&middot;</span>
              <span>{new Date(selected.created_at).toLocaleDateString()}</span>
              {selected.author_role === 'super_admin' && <span className="px-2 py-0.5 bg-nobus-100 text-nobus-700 rounded-full text-xs font-medium">Admin</span>}
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

          <form onSubmit={handleReply} className="flex gap-2">
            <input value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" />
            <button type="submit" disabled={submitting} className="btn-primary px-4"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">No discussions yet. Start the first one!</div>
          ) : discussions.map((d) => (
            <button key={d.id} onClick={() => loadDiscussion(d.id)}
              className="w-full text-left card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{d.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {d.author_name} &middot; {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <MessageSquare className="w-4 h-4" /> {d.reply_count}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
