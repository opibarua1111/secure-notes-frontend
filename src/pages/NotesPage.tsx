import { useState, type FormEvent } from 'react';
import { request } from '../api';
import { ErrorText, Pager } from '../components';
import { errorMessage, usePaged } from '../hooks';
import type { Note, Paged } from '../types';

export default function NotesPage() {
  const notes = usePaged<Note>((page) => request<Paged<Note>>('/notes', { query: { page, limit: 5 } }));
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editing) await request(`/notes/${editing._id}`, { method: 'PATCH', body: form });
      else await request('/notes', { method: 'POST', body: form });
      setForm({ title: '', content: '' });
      setEditing(null);
      notes.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this note?')) return;
    try {
      await request(`/notes/${id}`, { method: 'DELETE' });
      // went past the last item on this page, so step back
      if (notes.items.length === 1 && notes.page > 1) notes.setPage(notes.page - 1);
      else notes.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <section>
        <h3>{editing ? 'Edit note' : 'New note'}</h3>
        <form onSubmit={save}>
          <input
            required
            maxLength={120}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="row">
            <button className="primary">{editing ? 'Update' : 'Add note'}</button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ title: '', content: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <ErrorText message={error} />
      </section>

      <section>
        <h3>My notes</h3>
        <ErrorText message={notes.error} />
        {!notes.loading && notes.items.length === 0 && <p className="muted">No notes yet.</p>}
        {notes.items.map((n) => (
          <div className="item" key={n._id}>
            <strong>{n.title}</strong>
            <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0' }}>{n.content}</p>
            <div className="row">
              <span className="muted">{new Date(n.updatedAt).toLocaleString()}</span>
              <button
                onClick={() => {
                  setEditing(n);
                  setForm({ title: n.title, content: n.content });
                }}
              >
                Edit
              </button>
              <button className="danger" onClick={() => remove(n._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        <Pager meta={notes.meta} onPage={notes.setPage} />
      </section>
    </>
  );
}
