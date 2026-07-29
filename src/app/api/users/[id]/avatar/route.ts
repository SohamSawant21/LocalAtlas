import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { avatar: true },
    });

    if (!user || !user.avatar) {
      return new NextResponse(null, { status: 404 });
    }

    const avatar = user.avatar;

    // Check if it's a base64 data URI
    const dataUriMatch = avatar.match(/^data:(image\/\w+);base64,(.+)$/);
    if (dataUriMatch) {
      const mimeType = dataUriMatch[1];
      const base64Data = dataUriMatch[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      });
    }

    // If it's a regular URL, redirect to it
    if (avatar.startsWith('http')) {
      return NextResponse.redirect(avatar);
    }

    // Otherwise, maybe it's a relative path or something else
    return new NextResponse(null, { status: 400 });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return new NextResponse(null, { status: 500 });
  }
}
