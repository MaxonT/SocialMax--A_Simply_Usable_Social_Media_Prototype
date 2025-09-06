/**
 * Minimal, fully-runnable backend for your Social-Media app.
 * Run:  cd backend && npm install && npm run dev
 * API:  http://localhost:5001
 */
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// ---- tiny file DB (safe: starts empty if db.json missing) ----
function loadDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { posts: [] };
  }
}
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ---- helpers ----
function getPost(db, id) {
  return db.posts.find(p => p.id === id);
}

// ---- routes ----

// Get all posts (newest first)
app.get('/posts', (req, res) => {
  const db = loadDB();
  const sorted = [...db.posts].sort((a, b) => b.createdAt - a.createdAt);
  res.json(sorted);
});

// Create a new post
app.post('/posts', (req, res) => {
  const { text, author } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const db = loadDB();
  const post = {
    id: nanoid(),
    text: text.trim(),
    author: author?.trim() || 'Anonymous',
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: Date.now(),         // number timestamp for sort((a,b)=>b.createdAt - a.createdAt)
    createdAtISO: dayjs().toISOString()
  };
  db.posts.push(post);
  saveDB(db);
  res.status(201).json(post);
});

// Like a post
app.post('/posts/:id/like', (req, res) => {
  const userId = (req.body && req.body.userId) || 'guest';
  const db = loadDB();
  const post = getPost(db, req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });

  if (!post.likedBy.includes(userId)) {
    post.likedBy.push(userId);
    post.likes = post.likedBy.length;
    saveDB(db);
  }
  res.json(post);
});

// Unlike a post
app.post('/posts/:id/unlike', (req, res) => {
  const userId = (req.body && req.body.userId) || 'guest';
  const db = loadDB();
  const post = getPost(db, req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });

  post.likedBy = post.likedBy.filter(u => u !== userId);
  post.likes = post.likedBy.length;
  saveDB(db);
  res.json(post);
});

// Add a comment
app.post('/posts/:id/comments', (req, res) => {
  const { text, author } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const db = loadDB();
  const post = getPost(db, req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });

  const comment = {
    id: nanoid(),
    text: text.trim(),
    author: author?.trim() || 'Anonymous',
    createdAt: Date.now(),
    createdAtISO: dayjs().toISOString()
  };
  post.comments.push(comment);
  saveDB(db);
  res.status(201).json(comment);
});

// Get comments for a post (newest first)
app.get('/posts/:id/comments', (req, res) => {
  const db = loadDB();
  const post = getPost(db, req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });

  const sorted = [...post.comments].sort((a, b) => b.createdAt - a.createdAt);
  res.json(sorted);
});

// Health check
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: dayjs().toISOString() });
});

// Boot
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});