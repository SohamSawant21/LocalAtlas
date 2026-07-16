import { fetchCommunityPosts, fetchTrendingPlacesAction } from "@/actions/community";
import { auth } from "@/auth";
import { CreatePostForm } from "@/components/community/CreatePostForm";
import { PostList } from "@/components/community/PostList";
import { Users, Info, Flame, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { value: "ALL", label: "All" },
  { value: "QUESTION", label: "Questions" },
  { value: "PHOTO", label: "Photos" },
  { value: "TRAVEL_TIP", label: "Tips" },
  { value: "ROUTE_UPDATE", label: "Updates" },
  { value: "FESTIVAL", label: "Festivals" },
  { value: "FOOD", label: "Food" },
  { value: "HERITAGE", label: "Heritage" },
  { value: "PLACE_RECOMMENDATION", label: "Nearby" },
];

export default async function CommunityPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.category;
  
  const VALID_CATEGORIES = ['PLACE_RECOMMENDATION', 'QUESTION', 'PHOTO', 'TRAVEL_TIP', 'ALERT', 'FESTIVAL', 'ROUTE_UPDATE', 'FOOD', 'HERITAGE', 'MEETUP'];
  const isValidCategory = categoryFilter && VALID_CATEGORIES.includes(categoryFilter);
  
  // Note: we can just pass categoryFilter as any to fetchCommunityPosts
  const { posts, nextCursor } = await fetchCommunityPosts(undefined, 10, isValidCategory ? (categoryFilter as any) : undefined);
  const trendingRes = await fetchTrendingPlacesAction();
  const trendingPlaces = trendingRes.success ? trendingRes.data : [];
  
  const session = await auth();
  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="bg-background border-b">
        <div className="container mx-auto max-w-5xl pt-12 pb-6 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Community Hub</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Connect with fellow explorers, share your experiences, ask questions, and join discussions.
          </p>
          
          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = (cat.value === "ALL" && !isValidCategory) || cat.value === categoryFilter;
              return (
                <Link
                  key={cat.value}
                  href={cat.value === "ALL" ? "/community" : `/community?category=${cat.value}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                    isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
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
              <PostList 
                initialPosts={posts} 
                initialNextCursor={nextCursor} 
                currentUserId={currentUserId}
                categoryFilter={isValidCategory ? (categoryFilter as any) : undefined}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Places */}
            {trendingPlaces && trendingPlaces.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-primary font-bold">
                    <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                    Trending Places
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trendingPlaces.map((place: any) => (
                    <Link 
                      key={place.id} 
                      href={`/location/${place.slug}`}
                      className="group flex items-start justify-between p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {place.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {place._count.communityPosts} discussions
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

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
