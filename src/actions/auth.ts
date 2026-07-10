'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function loginUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid credentials. Please check your inputs.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    throw error; // Let next-auth handle redirection errors (NEXT_REDIRECT)
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return { error: 'Email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to create account.' };
  }
}
