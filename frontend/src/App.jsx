import React, { useEffect, useMemo, useState } from 'react';
// import dayjs from 'dayjs'; 
import NewPostForm from './components/NewPostForm.jsx';
import PostList from './components/PostList.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [typingQ, setTypingQ] = useState('');
  const [error, setError] = useState('');

  // 
  useEffect(() => {
    const t = setTimeout(() => setQ(typingQ.trim()), 300);
    return () => clearTimeout(t);
  }, [typingQ]);

  // 
  function normalizePosts(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(p => ({
      id: p.id,
      author: p.author ?? 'Anonymous',
      content: p.content ?? '',
      likes: typeof p.likes === 'number' ? p.likes : 0,
      comments: Array.isArray(p.comments) ? p.comments : [],
      createdAt: p.createdAt ?? null,
    }));
  }

  async function fetchPosts() {
    setLoading(true);
    setError('');
    try {
      const url = q ? `${API_BASE}/posts?q=${encodeURIComponent(q)}` : `${API_BASE}/posts`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setPosts(normalizePosts(data));
    } catch (e) {
      setError(e?.message || 'Failed to load posts');
      setPosts([]); // 
    } finally {
      setLoading(false);
    }
  }

  // 
  useEffect(() => { fetchPosts(); }, [q]);

  // 
  async function handleCreatePost({ author, content }) {
    setError('');
    if (!author.trim() || !content.trim()) {
        setError('Both author and text are required');
        return;
    }
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ? JSON.stringify(err.error) : `Create failed: ${res.status}`);
      }
      const newPost = await res.json();
      const normalized = normalizePosts([newPost])[0];
      setPosts(prev => [normalized, ...prev]);
    } catch (e) {
      setError(e?.message || 'Failed to create post');
    }
  }

  // 
  async function handleLike(id, delta) {
    setError('');
    try {
      const endpoint = delta > 0 ? 'like' : 'unlike';
      const res = await fetch(`${API_BASE}/posts/${id}/${endpoint}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Like failed: ${res.status}`);
      const json = await res.json();
      const likes = typeof json?.likes === 'number' ? json.likes : 0;
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes } : p));
    } catch (e) {
      setError(e?.message || 'Like failed');
    }
  }

  // 
  async function handleAddComment(postId, { author, text }) {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ? JSON.stringify(err.error) : `Comment failed: ${res.status}`);
      }
      const comment = await res.json();
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      );
    } catch (e) {
      setError(e?.message || 'Failed to add comment');
    }
  }

  const subtitle = useMemo(() => {
    if (q && !loading) return `Filtered by "${q}" · ${posts.length} result(s)`;
    if (!loading) return `${posts.length} post(s)`;
    return 'Loading...';
  }, [q, loading, posts]);

  return (
    <div className="container">
      <header className="header">
        <h1>Change++ Mini Feed</h1>
        <p className="muted">{subtitle}</p>
        <div className="search">
          <input
            placeholder="Search posts (content)..."
            value={typingQ}
            onChange={e => setTypingQ(e.target.value)}
          />
          <button onClick={() => setTypingQ('')}>Clear</button>
          <button onClick={fetchPosts} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
      </div>
      </header>

      {error && <div className="error">⚠️ {String(error)}</div>}

      <section className="card">
        <h2>Create a Post</h2>
        <NewPostForm onCreate={handleCreatePost} />
      </section>

      <PostList
        posts={posts}
        onLike={(id) => handleLike(id, +1)}
        onUnlike={(id) => handleLike(id, -1)}
        onAddComment={handleAddComment}
      />

      <footer className="footer">
        <span className="muted">API: {API_BASE}</span>
      </footer>
    </div>
  );
}
