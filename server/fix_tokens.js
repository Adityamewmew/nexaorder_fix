const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.tableMeja.findMany();
  for (const table of tables) {
    if (!table.token) {
      await prisma.tableMeja.update({
        where: { id: table.id },
        data: { token: require('crypto').randomUUID() }
      });
    }
  }
  console.log('Fixed tokens');
}
main().catch(console.error).finally(() => prisma.$disconnect());
