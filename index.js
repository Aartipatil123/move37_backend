const express = require('express');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Move37 Backend is running!');
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch users" });
  }
});

// Create new user
app.post('/users', async (req, res) => {
  const { name, email, passwordHash } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Unable to create user" });
  }
});

// Create new poll
app.post('/polls', async (req, res) => {
  const { question, creatorId, options } = req.body;
  try {
    const poll = await prisma.poll.create({
      data: {
        question,
        creatorId,
        options: {
          create: options.map(text => ({ text }))
        }
      },
      include: {
        options: true
      }
    });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Unable to create poll", details: error.message });
  }
});

// Get all polls
app.get('/polls', async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: true,
        creator: true
      }
    });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch polls" });
  }
});

// Submit a vote
app.post('/vote', async (req, res) => {
  const { userId, optionId, pollId } = req.body;
  try {
    const vote = await prisma.vote.create({
      data: {
        userId,
        optionId
      }
    });

    // After vote, emit updated results
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: true
          }
        }
      }
    });

    const results = poll.options.map(option => ({
      id: option.id,
      text: option.text,
      voteCount: option.votes.length
    }));

    io.to(`poll_${pollId}`).emit('pollResults', results);

    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: "Unable to submit vote", details: error.message });
  }
});

// Get poll results
app.get('/poll/:id/results', async (req, res) => {
  const pollId = parseInt(req.params.id);
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: true
          }
        }
      }
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const results = poll.options.map(option => ({
      id: option.id,
      text: option.text,
      voteCount: option.votes.length
    }));

    res.json({ pollId: poll.id, question: poll.question, results });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch poll results", details: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinPoll', (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log('User joined poll', pollId);
  });

  socket.on('vote', async (data) => {
    const { userId, optionId, pollId } = data;
    try {
      await prisma.vote.create({
        data: {
          userId,
          optionId
        }
      });

      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
          options: {
            include: {
              votes: true
            }
          }
        }
      });

      const results = poll.options.map(option => ({
        id: option.id,
        text: option.text,
        voteCount: option.votes.length
      }));

      io.to(`poll_${pollId}`).emit('pollResults', results);

    } catch (error) {
      socket.emit('error', { message: "Vote failed", details: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
