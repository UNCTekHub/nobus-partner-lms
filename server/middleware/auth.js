import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db.js';

// Never fall back to a hardcoded, publicly-known secret. If JWT_SECRET is unset,
// generate a strong random secret at boot (this invalidates sessions on restart
// but is safe); production must set JWT_SECRET so sessions survive restarts.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET is not set - using an ephemeral secret. Set JWT_SECRET in the environment for stable sessions.');
}

// Token carries the user's token_version. Changing a password bumps the version,
// which invalidates all previously issued tokens for that user.
export function generateToken(userId, tokenVersion = 0) {
  return jwt.sign({ userId, tv: tokenVersion }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(header.slice(7));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account inactive' });
    // Reject tokens issued before the last credential change
    if ((decoded.tv || 0) !== (user.token_version || 0)) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
