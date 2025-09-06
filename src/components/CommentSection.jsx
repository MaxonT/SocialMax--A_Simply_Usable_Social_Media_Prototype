import React, { useState } from 'react';
import dayjs from 'dayjs';

export default function CommentSection({ comments, onAddComment }) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    setBusy(true);
    try {
      await onAddComment({ author: author.trim(), text: text.trim() });
      setText('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="comments">
      <ul className="comment-list">
        {comments.length === 0 && <li className="muted">Be the first to comment.</li>}
        {comments.map(c => (
          <li key={c.id} className="comment">
            <div className="comment-meta">
              <span className="comment-author">@{c.author}</span>
              <span className="comment-time">
                {dayjs(c.createdAt).format('YYYY/MM/DD HH:mm')}
              </span>
            </div>
            <div className="comment-text">{c.text}</div>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="form-row">
        <input
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <input
          placeholder="Write a comment (max 300)"
          value={text}
          maxLength={300}
          onChange={e => setText(e.target.value)}
        />
        <button disabled={busy || !author.trim() || !text.trim()}>
          {busy ? 'Sending...' : 'Comment'}
        </button>
      </form>
    </div>
  );
}
