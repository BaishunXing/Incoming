// backend/server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d'; // 7days

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

// 演示用内存数据库（重启会清空）
// This is a demonstration using an in-memory database (it will be cleared upon restart)
const users = [];
let idSeq = 1;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/health', (_, res) => res.status(200).send('OK'));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const exists = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: idSeq++, email, passwordHash, createdAt: new Date().toISOString() };
    users.push(user);

    // Register and log in 
    const token = signToken({ id: user.id, email: user.email });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 3600 * 1000 // 7days
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken({ id: user.id, email: user.email });

    // Remember me：true -> 7days；false -> Cookie（The browser is no longer working when closed）
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };
    if (remember) cookieOptions.maxAge = 7 * 24 * 3600 * 1000;

    res.cookie('token', token, cookieOptions);
    res.status(200).json({ id: user.id, email: user.email });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  const me = users.find(u => u.id === req.user.id);
  if (!me) return res.status(404).json({ message: 'User not found' });
  res.status(200).json({ id: me.id, email: me.email, createdAt: me.createdAt });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: 'Logged out' });
});

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`Server is starting on port ${PORT}`));