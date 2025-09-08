import { useEffect, useState } from 'react';
import NewPostForm from './NewPostForm';
import PostItem from './PostItem';

const API_BASE = 'http://localhost:5001';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/posts`)
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  async function handleCreatePost({ author, content }) {
    setError('');
    if (!author.trim() || !content.trim()) {
      setError('Both author and content are required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Create failed');
      }
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <NewPostForm onCreate={handleCreatePost} />
      {error && <div className="error">⚠️ {error}</div>}
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}