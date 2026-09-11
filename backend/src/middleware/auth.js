const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve ser configurado com pelo menos 32 caracteres');
  }
  return secret;
}

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.isAdmin ? 'admin' : 'user' },
    getJwtSecret(),
    { expiresIn: '8h', issuer: 'estante-aberta' }
  );
}

function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Autenticação obrigatória' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { issuer: 'estante-aberta' });
    req.auth = { userId: Number(payload.sub), isAdmin: payload.role === 'admin' };
    return next();
  } catch (_) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ error: 'Acesso administrativo obrigatório' });
  }
  return next();
}

module.exports = { signUserToken, requireAuth, requireAdmin };
