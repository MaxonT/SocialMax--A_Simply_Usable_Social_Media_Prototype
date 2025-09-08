// NewPostForm.jsx (FRONTEND COMPONENT)
import { useState } from 'react';

export default function NewPostForm({ onCreate }) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    await onCreate({ author, content });
    setAuthor('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Your name"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Say something (max 500 chars)"
      />
      <button type="submit">Post</button>
    </form>
  );
}