import { NextAuthConfig } from 'next-auth';


export const authConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in', // Error code passed in query string as ?error=
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = 
        nextUrl.pathname.startsWith('/settings') || 
        nextUrl.pathname.startsWith('/contribute') || 
        nextUrl.pathname.startsWith('/saved') ||
        nextUrl.pathname.startsWith('/notifications') ||
        nextUrl.pathname.startsWith('/trips') ||
        nextUrl.pathname.startsWith('/admin');
      
      const isAuthRoute = nextUrl.pathname.startsWith('/sign-in') || nextUrl.pathname.startsWith('/sign-up');

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to unauthenticated page
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/explore', nextUrl));
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        
        const avatar = (user as any).avatar;
        if (avatar && avatar.startsWith('data:image')) {
          token.image = `/api/avatar/${user.id}`;
        } else {
          token.image = avatar;
        }
      }
      if (trigger === 'update' && session) {
        if (session.image && session.image.startsWith('data:image')) {
          token.image = `/api/avatar/${token.id}`;
        } else if (session.image === null) {
          token.image = undefined;
        } else if (session.image) {
          token.image = session.image;
        }
        
        // Merge the rest of the session if there's any other fields like name
        if (session.name) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN' | 'MODERATOR';
        session.user.image = token.image as string | undefined;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
} satisfies NextAuthConfig;
