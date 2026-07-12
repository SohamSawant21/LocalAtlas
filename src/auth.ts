import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';

const prismaAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...prismaAdapter,
    createUser: async (data) => {
      const { image, ...rest } = data as any;
      const user = await prisma.user.create({
        data: {
          ...rest,
          avatar: image,
        },
      });
      return user as any;
    },
  },
  ...authConfig,
});
