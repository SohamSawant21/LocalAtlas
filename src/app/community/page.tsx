import { fetchCommunityPosts } from "@/actions/community";
import { auth } from "@/auth";
import { CreatePostForm } from "@/components/community/CreatePostForm";
import { PostList } from "@/components/community/PostList";
import { Users, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const posts = await fetchCommunityPosts();
  const session = await auth();
  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="bg-background border-b">
        <div className="container mx-auto max-w-5xl pt-12 pb-8 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Community Hub</h1>
          <p className="text-lg text-muted-foreground">
            Connect with fellow explorers, share your experiences, ask questions, and join discussions.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl pt-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CreatePostForm currentUserId={currentUserId} />
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Community Feed
              </h2>
              <PostList initialPosts={posts} currentUserId={currentUserId} />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4 text-muted-foreground">
                <ul className="space-y-2 list-disc pl-4">
                  <li><strong>Stay on topic:</strong> Keep discussions focused on travel, exploration, and locations.</li>
                  <li><strong>Be respectful:</strong> No abusive, offensive, or hateful language will be tolerated.</li>
                  <li><strong>No spam:</strong> Avoid purely promotional content or self-promotion without context.</li>
                  <li><strong>Help each other:</strong> Share your knowledge and experiences to help fellow travelers.</li>
                  <li><strong>Protect privacy:</strong> Do not share personal information of others.</li>
                </ul>
                <p className="pt-2 text-xs border-t border-border/50">
                  By participating in this community, you agree to follow these guidelines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
