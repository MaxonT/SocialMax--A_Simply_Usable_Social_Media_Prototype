import React, { useState } from 'react';
import dayjs from 'dayjs';
import CommentSection from './CommentSection.jsx';

export default function PostItem({ post, onLike, onUnlike, onAddComment }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="card">
      <header className="post-header">
        <div className="post-author">@{post.author}</div>
        <div className="post-time">
          {dayjs(post.createdAt).format('YYYY/MM/DD HH:mm')}
        </div>
      </header>

      <p className="post-content">{post.content}</p>

      <div className="row">
        <button onClick={onLike}>👍 Like ({post.likes})</button>
        <button onClick={onUnlike}>👎 Unlike</button>
        <button onClick={() => setShowComments(s => !s)}>
          💬 Comments ({post.comments?.length || 0}) {showComments ? '▲' : '▼'}
        </button>
      </div>

      {showComments && (
        <CommentSection
          comments={post.comments || []}
          onAddComment={onAddComment}
        />
      )}
    </article>
  );
}
