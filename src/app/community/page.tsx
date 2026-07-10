import { getRecentReviews } from "@/services/review";
import { FeedItem } from "@/components/community/FeedItem";
import { Users, Sparkles, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const recentReviews = await getRecentReviews();
  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="bg-background border-b">
        <div className="container mx-auto max-w-3xl pt-12 pb-8 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Community Hub</h1>
          <p className="text-lg text-muted-foreground">
            Connect with fellow explorers, share your experiences, and discover new hidden gems.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl pt-8 px-4">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-background border shadow-sm h-12">
            <TabsTrigger value="feed" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Recent Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="top" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6 mt-0">
            {recentReviews.map((review) => {
              return <FeedItem key={review.id} item={review as any} location={(review as any).location || review.locationId} />;
            })}
            
            {/* Adding one more fake review for display since mockReviews only has one */}
            <FeedItem 
              key="fake-1" 
              item={{
                id: 'fake-1',
                content: 'Found this incredible spot thanks to LocalAtlas! The sunrise views were unmatched and the path was practically empty. Highly recommend wearing good trekking shoes as the final ascent is steep.',
                rating: 5,
                createdAt: new Date('2026-07-09T14:00:00Z'), // 1 hour ago
                user: { id: 'u4', name: 'Arjun M.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
              } as any} 
              location={recentReviews[0]?.location || null} 
            />
          </TabsContent>
          
          <TabsContent value="trending" className="mt-0">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trending discussions</h3>
              <p className="text-muted-foreground max-w-sm">No trending discussions at the moment. Be the first to start a conversation!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="top" className="mt-0">
             <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Top rated places</h3>
              <p className="text-muted-foreground max-w-sm">Discover places that have received the highest praise from our community.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
