import { useState } from 'react';
import { request } from '../api';
import { ErrorText, Pager } from '../components';
import { usePaged } from '../hooks';
import type { InterestGroup, Paged } from '../types';

export default function InterestsPage({ onViewPosts }: { onViewPosts: (userId: string) => void }) {
  const [interest, setInterest] = useState('');
  const groups = usePaged<InterestGroup>(
    (page) =>
      request<Paged<InterestGroup>>('/users/by-interests', {
        query: { page, limit: 5, interest: interest.trim() || undefined },
      }),
    [interest],
  );

  return (
    <section>
      <h3>Users grouped by interests</h3>
      <input
        placeholder="Only this interest (optional), e.g. chess"
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
      />
      <ErrorText message={groups.error} />
      {!groups.loading && groups.items.length === 0 && <p className="muted">No matching users.</p>}
      {groups.items.map((g) => (
        <div className="item" key={g.interest}>
          <span className="tag">{g.interest}</span>
          <span className="muted">{g.count} user(s)</span>
          <div className="row" style={{ marginTop: 6 }}>
            {g.users.map((u) => (
              <button key={u._id} onClick={() => onViewPosts(u._id)} title="View posts">
                {u.name}
              </button>
            ))}
            {g.count > g.users.length && <span className="muted">+{g.count - g.users.length} more</span>}
          </div>
        </div>
      ))}
      <Pager meta={groups.meta} onPage={groups.setPage} />
    </section>
  );
}
