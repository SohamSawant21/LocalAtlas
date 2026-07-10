import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000&auto=format&fit=crop"
      title="Lost your way?"
      description="Don't worry, we'll help you get back on the trail. Reset your password to continue."
    >
      <Link href="/sign-in" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to sign in
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Reset password</h1>
        <p className="text-muted-foreground text-sm mt-2">
          We&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              className="pl-10 h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors" 
            />
          </div>
        </div>
        
        <Button className="w-full h-12 text-base font-semibold group rounded-xl">
          Send Reset Link
          <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Button>
      </form>
    </AuthLayout>
  );
}
