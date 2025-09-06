//backend/server.js
const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { z } = require("zod");
const { readDb, writeDb } = require("./store");

const app = express();
app.use(cors());
app.use(express.json());

const PostInput = z.object({
    author: z.string().min(1),
    content: z.string().min(1).max(500)
});
const CommentInput = z.object({
    author: z.string().min(1),
    text: z.string().min(1).max(300)
});

// Get all posts (newest first). Optional ?q=term filter.
app.get("/posts", async (req, res) => {
  const db = await readDb();
  const q = String(req.query.q || "").toLowerCase();

  const posts = (db.posts ?? [])
    .slice() // 复制一份再排
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter(p => !q || p.content.toLowerCase().includes(q));

  res.json(posts);
});

// Create post
app.post("/posts", async (req, res) => {
  const parsed = PostInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const db = await readDb();
  db.posts = db.posts ?? [];   // ← 兜底

  const post = {
    id: nanoid(),
    author: parsed.data.author,
    content: parsed.data.content,
    likes: 0,
    createdAt: Date.now(),
    comments: []
  };
  db.posts.push(post);
  await writeDb(db);
  res.status(201).json(post);
});

// Like / Unlike
app.post("/posts/:id/like", async (req, res) => {
  const db = await readDb();
  const list = db.posts ?? [];          // ← 兜底
  const p = list.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  p.likes += 1;
  await writeDb({ ...db, posts: list }); // 写回
  res.json({ likes: p.likes });
});

app.post("/posts/:id/unlike", async (req, res) => {
  const db = await readDb();
  const list = db.posts ?? [];
  const p = list.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  p.likes = Math.max(0, p.likes - 1);
  await writeDb({ ...db, posts: list });
  res.json({ likes: p.likes });
});


// Add / View comments
app.post("/posts/:id/comments", async (req, res) => {
  const parsed = CommentInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const db = await readDb();
  const list = db.posts ?? [];
  const p = list.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });

  const comment = { id: nanoid(), createdAt: Date.now(), ...parsed.data };
  p.comments = p.comments ?? [];        // ← 评论也兜底
  p.comments.push(comment);

  await writeDb({ ...db, posts: list });
  res.status(201).json(comment);
});

app.get("/posts/:id/comments", async (req, res) => {
  const db = await readDb();
  const list = db.posts ?? [];
  const p = list.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });

  const comments = (p.comments ?? []).slice().sort((a,b) => a.createdAt - b.createdAt);
  res.json(comments);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
