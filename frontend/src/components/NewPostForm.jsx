import React, { useState } from 'react';

export default function NewPostForm({ onCreate }) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    setBusy(true);
    try {
      await onCreate({ author: author.trim(), content: content.trim() });
      setContent('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="form-row">
      <input
        placeholder="Your name"
        value={author}
        onChange={e => setAuthor(e.target.value)}
      />
      <textarea
        placeholder="Say something (max 500 chars)"
        value={content}
        maxLength={500}
        onChange={e => setContent(e.target.value)}
      />
      <button disabled={busy || !author.trim() || !content.trim()}>
        {busy ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
