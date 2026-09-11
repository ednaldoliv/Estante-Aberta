const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();
const bcryptHashPattern = /^\$2[aby]\$\d{2}\$/;

async function main() {
  const users = await prisma.usuario.findMany({ select: { id: true, senha: true } });
  const legacyUsers = users.filter((user) => !bcryptHashPattern.test(user.senha));

  await prisma.$transaction(
    legacyUsers.map((user) =>
      prisma.usuario.update({
        where: { id: user.id },
        data: { senha: bcrypt.hashSync(user.senha, 12) }
      })
    )
  );

  // O projeto atribuía IDs manualmente; alinhamos a sequência nativa antes de novos cadastros.
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Usuario"\', \'id\'), COALESCE((SELECT MAX(id) FROM "Usuario"), 1), true)'
  );

  console.log(`password-hash-migration=ok; migrated=${legacyUsers.length}`);
}

main()
  .catch(() => {
    console.error('password-hash-migration=failed');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
