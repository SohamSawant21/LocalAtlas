'use client';

import { useActionState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { loginUser } from '@/actions/auth';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success('Logged in successfully!');
      router.push('/explore');
      router.refresh();
    }
  }, [state, router]);

  return (
    <AuthLayout
      image="https://images.unsplash.com/photo-1590130638515-560416b7ff6c?q=80&w=2000&auto=format&fit=crop"
      title="Welcome back to the untouched trails."
      description="Sign in to continue exploring verified hidden gems and connecting with local experts."
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Sign in</h1>
        <p className="text-muted-foreground">Enter your email and password to access your account.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl"
          onClick={() => signIn('google', { callbackUrl: '/explore' })}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Sign in with Google
        </Button>
      </div>
      
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                id="email" 
                name="email"
                type="email" 
                required
                placeholder="name@example.com" 
                className="pl-10 h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                placeholder="••••••••" 
                className="pl-10 h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors" 
              />
            </div>
          </div>
        </div>
        
        <Button disabled={isPending} className="w-full h-12 text-base font-semibold group rounded-xl">
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
