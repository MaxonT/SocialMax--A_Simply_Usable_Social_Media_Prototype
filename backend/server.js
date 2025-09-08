// server.js (BACKEND - COMPLETE)
const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const { nanoid } = require('nanoid');
const fs = require('fs');
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';
function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { posts: [] };
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

app.get('/posts', (req, res) => {
  const db = loadDB();
  res.json(db.posts.sort((a, b) => b.createdAt - a.createdAt));
});

app.post('/posts', (req, res) => {
  const { content, author } = req.body || {};
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const db = loadDB();
  const post = {
    id: nanoid(),
    text: content.trim(),
    author: author?.trim() || 'Anonymous',
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: Date.now(),
    createdAtISO: dayjs().toISOString()
  };
  db.posts.push(post);
  saveDB(db);
  res.status(201).json(post);
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
