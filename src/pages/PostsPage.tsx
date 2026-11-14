import { useState, type FormEvent } from 'react';
import { request } from '../api';
import { useAuth } from '../auth';
import { ErrorText, Pager } from '../components';
import { errorMessage, usePaged } from '../hooks';
import type { Paged, Post } from '../types';

interface PostsResponse extends Paged<Post> {
  user: { _id: string; name: string };
}

// keyed by userId in the parent, so the input resets when the shown user changes
function UserLookup({ userId, onShow }: { userId: string; onShow: (id: string) => void }) {
  const { user: me } = useAuth();
  const [lookup, setLookup] = useState(userId);

  return (
    <div className="row">
      <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="User id" />
      <button onClick={() => onShow(lookup.trim())}>Show</button>
      <button onClick={() => me && onShow(me._id)}>Mine</button>
    </div>
  );
}

export default function PostsPage({
  userId,
  onUserChange,
}: {
  userId: string;
  onUserChange: (id: string) => void;
}) {
  const { user: me } = useAuth();
  const [owner, setOwner] = useState('');
  const [form, setForm] = useState({ title: '', body: '' });
  const [error, setError] = useState('');

  const posts = usePaged<Post>(
    async (page) => {
      const res = await request<PostsResponse>(`/users/${userId}/posts`, { query: { page, limit: 5 } });
      setOwner(res.user.name);
      return res;
    },
    [userId],
  );

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await request('/posts', { method: 'POST', body: form });
      setForm({ title: '', body: '' });
      if (userId === me?._id) posts.reload();
      else onUserChange(me!._id);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <section>
        <h3>Write a post (public)</h3>
        <form onSubmit={create}>
          <input
            required
            maxLength={120}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            required
            rows={3}
            placeholder="Post body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <button className="primary">Publish</button>
        </form>
        <ErrorText message={error} />
      </section>

      <section>
        <h3>Posts by {owner || 'user'}</h3>
        <UserLookup key={userId} userId={userId} onShow={onUserChange} />
        <ErrorText message={posts.error} />
        {!posts.loading && !posts.error && posts.items.length === 0 && <p className="muted">No posts yet.</p>}
        {posts.items.map((p) => (
          <div className="item" key={p._id}>
            <strong>{p.title}</strong>
            <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0' }}>{p.body}</p>
            <span className="muted">{new Date(p.createdAt).toLocaleString()}</span>
          </div>
        ))}
        <Pager meta={posts.meta} onPage={posts.setPage} />
      </section>
    </>
  );
}
