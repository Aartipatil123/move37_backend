// index.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const PORT = 3000;

// WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== USERS ====================
app.post('/users', async (req, res) => {
  try {
    const { name, email, passwordHash } = req.body;
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// ==================== POLLS ====================
app.post('/polls', async (req, res) => {
  try {
    const { question, creatorId, options } = req.body;
    const poll = await prisma.poll.create({
      data: {
        question,
        creatorId,
        options: {
          create: options.map((opt) => ({ text: opt }))
        }
      },
      include: { options: true }
    });
    res.json(poll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/polls', async (req, res) => {
  const polls = await prisma.poll.findMany({ include: { options: true } });
  res.json(polls);
});

// ==================== VOTES ====================
app.post('/vote', async (req, res) => {
  try {
    const { userId, pollOptionId } = req.body;

    // create vote
    const vote = await prisma.vote.create({
      data: { userId, pollOptionId }
    });

    // get updated vote count for this poll option
    const votesCount = await prisma.vote.count({
      where: { pollOptionId }
    });

    // broadcast to all connected clients
    io.emit('voteUpdate', { pollOptionId, votes: votesCount });

    res.json(vote);
  } catch (err) {
    res.status(400).json({ error: 'User may have already voted or invalid data' });
  }
});

// ==================== GET POLL RESULTS ====================
app.get('/poll/:pollId/results', async (req, res) => {
  const { pollId } = req.params;
  try {
    const options = await prisma.pollOption.findMany({
      where: { pollId: parseInt(pollId) },
      include: { votes: true }
    });

    const results = options.map((opt) => ({
      optionId: opt.id,
      text: opt.text,
      votes: opt.votes.length
    }));

    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== START SERVER ====================
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
