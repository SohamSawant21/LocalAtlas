import { auth } from '@/auth';
import { AuthRequiredError, ForbiddenError } from './exceptions';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthRequiredError();
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role as string)) {
    throw new ForbiddenError();
  }
  return user;
}
