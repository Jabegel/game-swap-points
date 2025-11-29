const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troca_secret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'token missing' });

  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'token invalid' });

  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'token invalid' });
  }
}

module.exports = authMiddleware;
