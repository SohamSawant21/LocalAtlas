import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user || !user.avatar) {
      return new NextResponse(null, { status: 404 });
    }

    if (user.avatar.startsWith('data:image')) {
      // Extract the mime type and base64 data
      const matches = user.avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return new NextResponse('Invalid image format', { status: 400 });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      });
    }

    // If it's a regular URL (e.g. Google or S3), just redirect to it
    return NextResponse.redirect(user.avatar);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
