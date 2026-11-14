import { useState } from 'react';
import { request } from '../api';
import { ErrorText, Pager } from '../components';
import { usePaged } from '../hooks';
import type { Note, Paged } from '../types';

export default function AdminNotesPage() {
  const [userId, setUserId] = useState('');
  const notes = usePaged<Note>(
    (page) =>
      request<Paged<Note>>('/admin/notes', {
        query: { page, limit: 10, userId: userId.trim() || undefined },
      }),
    [userId],
  );

  return (
    <section>
      <h3>All notes (admin)</h3>
      <input
        placeholder="Filter by user id (optional)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <ErrorText message={notes.error} />
      {notes.items.map((n) => (
        <div className="item" key={n._id}>
          <strong>{n.title}</strong>{' '}
          <span className="muted">
            by {typeof n.owner === 'object' ? `${n.owner.name} (${n.owner.email})` : n.owner}
          </span>
          <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0' }}>{n.content}</p>
        </div>
      ))}
      <Pager meta={notes.meta} onPage={notes.setPage} />
    </section>
  );
}
