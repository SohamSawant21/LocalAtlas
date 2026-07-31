import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const loc = await prisma.location.findFirst({
    where: { name: { contains: 'Rajapur' } }
  });
  console.log(loc);
}

main().catch(console.error).finally(() => prisma.$disconnect());
