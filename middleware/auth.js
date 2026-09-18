const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'valtoztasd-meg-ezt-a-titkos-kulcsot';

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Nincs bejelentkezve.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ervenytelen vagy lejart munkamenet.' });
  }
}

// Nem kotelezo bejelentkezes - ha van token, betolti a usert, ha nincs, tovabb enged
function optionalAuth(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      req.user = null;
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
