 import React from 'react';
import PostItem from './PostItem.jsx';

export default function PostList({ posts, onLike, onUnlike, onAddComment }) {
  if (!posts?.length) return <div className="muted">No posts yet.</div>;
  return (
    <div className="list">
      {posts.map(p => (
        <PostItem
          key={p.id}
          post={p}
          onLike={() => onLike(p.id)}
          onUnlike={() => onUnlike(p.id)}
          onAddComment={(payload) => onAddComment(p.id, payload)}
        />
      ))}
    </div>
  );
}
