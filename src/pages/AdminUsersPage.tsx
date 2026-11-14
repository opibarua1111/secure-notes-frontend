import { useState, type FormEvent } from 'react';
import { request } from '../api';
import { useAuth } from '../auth';
import { ErrorText, Pager, parseInterests } from '../components';
import { errorMessage, usePaged } from '../hooks';
import type { Paged, Role, User } from '../types';

const EMPTY = { name: '', email: '', password: '', role: 'user' as Role, interests: '' };

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const users = usePaged<User>((page) =>
    request<Paged<User>>('/admin/users', { query: { page, limit: 10 } }),
  );
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await request('/admin/users', {
        method: 'POST',
        body: { ...form, interests: parseInterests(form.interests) },
      });
      setForm(EMPTY);
      users.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function act(fn: () => Promise<unknown>) {
    setError('');
    try {
      await fn();
      users.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const changeRole = (u: User) =>
    act(() =>
      request(`/admin/users/${u._id}`, {
        method: 'PATCH',
        body: { role: u.role === 'admin' ? 'user' : 'admin' },
      }),
    );

  const rename = (u: User) => {
    const name = prompt('New name', u.name)?.trim();
    if (name && name !== u.name)
      void act(() => request(`/admin/users/${u._id}`, { method: 'PATCH', body: { name } }));
  };

  const remove = (u: User) => {
    if (confirm(`Delete ${u.email}? Their notes and posts are deleted too.`)) {
      void act(async () => {
        await request(`/admin/users/${u._id}`, { method: 'DELETE' });
        if (users.items.length === 1 && users.page > 1) users.setPage(users.page - 1);
      });
    }
  };

  return (
    <>
      <section>
        <h3>Add user</h3>
        <form onSubmit={create}>
          <div className="row">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              required
              type="password"
              minLength={8}
              placeholder="Password (min 8)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <input
              placeholder="Interests (comma separated)"
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
            />
            <select
              style={{ width: 120, margin: 0 }}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button className="primary">Add</button>
          </div>
        </form>
        <ErrorText message={error} />
      </section>

      <section>
        <h3>Users</h3>
        <ErrorText message={users.error} />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Id</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.items.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="muted">{u._id}</td>
                <td className="row">
                  <button onClick={() => rename(u)}>Rename</button>
                  <button disabled={u._id === me?._id} onClick={() => changeRole(u)}>
                    Make {u.role === 'admin' ? 'user' : 'admin'}
                  </button>
                  <button className="danger" disabled={u._id === me?._id} onClick={() => remove(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager meta={users.meta} onPage={users.setPage} />
      </section>
    </>
  );
}
