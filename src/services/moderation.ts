import prisma from '@/lib/prisma';
import { Report } from '@prisma/client';

export type ReportWithContext = Report & {
  reporter: { name: string | null; email: string };
  context: {
    snippet: string;
    url: string | null;
    authorName?: string;
    isDeleted: boolean;
  };
};

export async function getPendingReportsWithContext(): Promise<ReportWithContext[]> {
  const reports = await prisma.report.findMany({
    where: { status: 'PENDING' },
    include: { reporter: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  if (!reports.length) return [];

  const targetIdsByType = {
    POST: [] as string[],
    COMMENT: [] as string[],
    REVIEW: [] as string[],
    STORY: [] as string[],
    LOCATION: [] as string[],
    USER: [] as string[],
  };

  reports.forEach((r) => {
    if (targetIdsByType[r.type]) {
      targetIdsByType[r.type].push(r.targetId);
    }
  });

  const [
    posts,
    comments,
    reviews,
    stories,
    locations,
    users
  ] = await Promise.all([
    targetIdsByType.POST.length ? prisma.communityPost.findMany({ where: { id: { in: targetIdsByType.POST } }, include: { user: true } }) : Promise.resolve([]),
    targetIdsByType.COMMENT.length ? prisma.comment.findMany({ where: { id: { in: targetIdsByType.COMMENT } }, include: { user: true, post: true, location: true } }) : Promise.resolve([]),
    targetIdsByType.REVIEW.length ? prisma.review.findMany({ where: { id: { in: targetIdsByType.REVIEW } }, include: { user: true, location: true } }) : Promise.resolve([]),
    targetIdsByType.STORY.length ? prisma.story.findMany({ where: { id: { in: targetIdsByType.STORY } }, include: { user: true } }) : Promise.resolve([]),
    targetIdsByType.LOCATION.length ? prisma.location.findMany({ where: { id: { in: targetIdsByType.LOCATION } }, include: { contributor: true } }) : Promise.resolve([]),
    targetIdsByType.USER.length ? prisma.user.findMany({ where: { id: { in: targetIdsByType.USER } } }) : Promise.resolve([]),
  ]);

  const postMap = new Map(posts.map(p => [p.id, p]));
  const commentMap = new Map(comments.map(c => [c.id, c]));
  const reviewMap = new Map(reviews.map(r => [r.id, r]));
  const storyMap = new Map(stories.map(s => [s.id, s]));
  const locationMap = new Map(locations.map(l => [l.id, l]));
  const userMap = new Map(users.map(u => [u.id, u]));

  return reports.map((report) => {
    let context = { snippet: 'Content not found or already deleted.', url: null as string | null, authorName: 'Unknown', isDeleted: true };

    if (report.type === 'POST') {
      const post = postMap.get(report.targetId);
      if (post) {
        context = {
          snippet: `${post.title}${post.content ? `\n\n${post.content.substring(0, 150)}...` : ''}`,
          url: `/community`, // Ideally to a specific post ID, but community doesn't have individual pages right now. Wait, we can link to profile or community.
          authorName: post.user?.name || 'Unknown',
          isDeleted: false
        };
      }
    } else if (report.type === 'COMMENT') {
      const comment = commentMap.get(report.targetId);
      if (comment) {
        context = {
          snippet: comment.content.length > 150 ? `${comment.content.substring(0, 150)}...` : comment.content,
          url: comment.post ? `/community` : (comment.location ? `/location/${comment.location.slug}` : null),
          authorName: comment.user?.name || 'Unknown',
          isDeleted: false
        };
      }
    } else if (report.type === 'REVIEW') {
      const review = reviewMap.get(report.targetId);
      if (review) {
        context = {
          snippet: `${review.rating} Stars: ${review.content.length > 150 ? `${review.content.substring(0, 150)}...` : review.content}`,
          url: review.location ? `/location/${review.location.slug}` : null,
          authorName: review.user?.name || 'Unknown',
          isDeleted: false
        };
      }
    } else if (report.type === 'STORY') {
      const story = storyMap.get(report.targetId);
      if (story) {
        context = {
          snippet: story.title,
          url: `/stories/${story.id}`,
          authorName: story.user?.name || 'Unknown',
          isDeleted: false
        };
      }
    } else if (report.type === 'LOCATION') {
      const location = locationMap.get(report.targetId);
      if (location) {
        context = {
          snippet: `${location.name}\n${location.description ? location.description.substring(0, 150) + '...' : ''}`,
          url: `/location/${location.slug}`,
          authorName: location.contributor?.name || 'Unknown',
          isDeleted: false
        };
      }
    } else if (report.type === 'USER') {
      const user = userMap.get(report.targetId);
      if (user) {
        context = {
          snippet: `User Profile: ${user.name} (${user.email})\nBio: ${user.bio || 'No bio provided.'}`,
          url: `/profile/${user.id}`,
          authorName: user.name || 'Unknown',
          isDeleted: false
        };
      }
    }

    return {
      ...report,
      context
    };
  });
}
