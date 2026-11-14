import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth';
import { ErrorText, parseInterests } from '../components';
import { errorMessage } from '../hooks';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', interests: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register({ ...form, interests: parseInterests(form.interests) });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <section style={{ maxWidth: 420, margin: '48px auto' }}>
        <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>
                Name
                <input required value={form.name} onChange={set('name')} />
              </label>
              <label>
                Interests (comma separated)
                <input value={form.interests} onChange={set('interests')} placeholder="chess, reading" />
              </label>
            </>
          )}
          <label>
            Email
            <input type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={mode === 'register' ? 8 : 1}
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          <ErrorText message={error} />
          <div className="row">
            <button className="primary" disabled={busy}>
              {mode === 'login' ? 'Log in' : 'Register'}
            </button>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
