const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPasswordResetService } = require('../src/services/passwordReset');

function setup() {
  let clock = new Date('2026-01-01T00:00:00Z');
  let record;
  let sent;
  let password;
  const db = {
    usuario: {
      findUnique: async ({ where }) => where.email === 'user@example.com' ? { id: 1, email: where.email } : null,
      update: async ({ data }) => { if (data.senha) password = data.senha; }
    },
    passwordResetToken: {
      deleteMany: async () => { record = undefined; },
      create: async ({ data }) => { record = { id: 1, usedAt: null, ...data }; },
      findUnique: async ({ where }) => record?.tokenHash === where.tokenHash ? { ...record } : null,
      updateMany: async ({ where, data }) => {
        if (!record || (where.id && where.id !== record.id) || (where.usedAt === null && record.usedAt) || (where.expiresAt && record.expiresAt <= where.expiresAt.gt)) return { count: 0 };
        Object.assign(record, data); return { count: 1 };
      }
    },
    $queryRaw: async () => [],
    $transaction: async fn => fn(db)
  };
  const token = 'a'.repeat(64);
  const service = createPasswordResetService({ db, sendMail: async (email, value) => { sent = { email, token: value }; }, now: () => clock, randomToken: () => token, hashPassword: async value => `hash:${value}` });
  return { service, token, getSent: () => sent, getRecord: () => record, getPassword: () => password, advance: ms => { clock = new Date(clock.getTime() + ms); } };
}

test('solicita envio e redefine senha com token de uso único', async () => {
  const t = setup(); await t.service.request(' USER@example.com ');
  assert.equal(t.getSent().email, 'user@example.com');
  assert.notEqual(t.getRecord().tokenHash, t.token);
  assert.equal(await t.service.reset(t.token, 'nova senha'), true);
  assert.equal(t.getPassword(), 'hash:nova senha');
  assert.equal(await t.service.reset(t.token, 'outra senha'), false);
});
test('rejeita token inválido', async () => { const t = setup(); await t.service.request('user@example.com'); assert.equal(await t.service.reset('b'.repeat(64), 'senha'), false); });
test('rejeita token expirado', async () => { const t = setup(); await t.service.request('user@example.com'); t.advance(15 * 60 * 1000); assert.equal(await t.service.reset(t.token, 'senha'), false); });
test('não envia para email inexistente', async () => { const t = setup(); await t.service.request('inexistente@example.com'); assert.equal(t.getSent(), undefined); assert.equal(t.getRecord(), undefined); });
