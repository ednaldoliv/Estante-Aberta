const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

function createPasswordResetService({ db, sendMail, now = () => new Date(), randomToken = () => crypto.randomBytes(32).toString('hex'), hashPassword = password => bcrypt.hash(password, 12) }) {
  return {
    async request(email) {
      const user = await db.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (!user) return;
      const token = randomToken();
      const expiresAt = new Date(now().getTime() + 15 * 60 * 1000);
      await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Usuario" WHERE id = ${user.id} FOR UPDATE`;
        await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
        await tx.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt } });
      });
      await sendMail(user.email, token);
    },
    async reset(token, password) {
      if (!/^[a-f0-9]{64}$/.test(token)) return false;
      const passwordHash = await hashPassword(password);
      return db.$transaction(async tx => {
        const record = await tx.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
        if (!record) return false;
        await tx.$queryRaw`SELECT id FROM "Usuario" WHERE id = ${record.userId} FOR UPDATE`;
        const consumed = await tx.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null, expiresAt: { gt: now() } }, data: { usedAt: now() } });
        if (consumed.count !== 1) return false;
        await tx.usuario.update({ where: { id: record.userId }, data: { senha: passwordHash } });
        await tx.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: now() } });
        return true;
      });
    }
  };
}

async function sendResetEmail(email, token) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, FRONTEND_URL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM || !FRONTEND_URL) throw new Error('Configuração de e-mail incompleta');
  const base = new URL(FRONTEND_URL);
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname))) throw new Error('FRONTEND_URL deve usar HTTPS');
  const link = new URL('/esqueci-senha', base);
  link.searchParams.set('token', token);
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: process.env.SMTP_SECURE === 'true', requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false', auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined });
  await transport.sendMail({ from: SMTP_FROM, to: email, subject: 'Redefinição de senha', text: `Para redefinir sua senha, acesse o link abaixo. Ele expira em 15 minutos.\n\n${link.href}\n\nSe você não solicitou a redefinição, ignore esta mensagem.` });
}

module.exports = { createPasswordResetService, passwordResetService: createPasswordResetService({ db: prisma, sendMail: sendResetEmail }) };
