import { prisma } from './src/lib/prisma';

async function clearAvatars() {
  console.log("Clearing all avatars...");
  await prisma.user.updateMany({
    data: {
      avatar: null
    }
  });
  console.log("All avatars cleared!");
}

clearAvatars()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
