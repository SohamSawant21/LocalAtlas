import prisma from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, avatar: true } });
  for (const u of users) {
    console.log(u.email, u.avatar ? u.avatar.length : 0);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
