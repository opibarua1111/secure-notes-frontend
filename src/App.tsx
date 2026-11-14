import { useState } from 'react';
import { useAuth } from './auth';
import AdminNotesPage from './pages/AdminNotesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AuthPage from './pages/AuthPage';
import InterestsPage from './pages/InterestsPage';
import NotesPage from './pages/NotesPage';
import PostsPage from './pages/PostsPage';

type Tab = 'notes' | 'posts' | 'interests' | 'admin-users' | 'admin-notes';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('notes');
  const [postsUserId, setPostsUserId] = useState('');

  if (loading)
    return (
      <main>
        <p>Loading…</p>
      </main>
    );
  if (!user) return <AuthPage />;

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: 'notes', label: 'My notes' },
    { id: 'posts', label: 'Posts' },
    { id: 'interests', label: 'Interests' },
    { id: 'admin-users', label: 'Users', adminOnly: true },
    { id: 'admin-notes', label: 'All notes', adminOnly: true },
  ];

  const viewPosts = (id: string) => {
    setPostsUserId(id);
    setTab('posts');
  };

  return (
    <>
      <header>
        <strong>Secure Notes</strong>
        <span>
          {user.name} ({user.role}) <button onClick={logout}>Log out</button>
        </span>
      </header>
      <main>
        <nav>
          {tabs
            .filter((t) => !t.adminOnly || user.role === 'admin')
            .map((t) => (
              <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
        </nav>
        {tab === 'notes' && <NotesPage />}
        {tab === 'posts' && <PostsPage userId={postsUserId || user._id} onUserChange={setPostsUserId} />}
        {tab === 'interests' && <InterestsPage onViewPosts={viewPosts} />}
        {tab === 'admin-users' && user.role === 'admin' && <AdminUsersPage />}
        {tab === 'admin-notes' && user.role === 'admin' && <AdminNotesPage />}
      </main>
    </>
  );
}
