import { NextRequest } from 'next/server';
import { handlers } from '@/auth';

export async function GET(req: NextRequest) {
  return (handlers.GET as any)(req);
}

export async function POST(req: NextRequest) {
  return (handlers.POST as any)(req);
}
