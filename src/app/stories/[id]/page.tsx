/* eslint-disable @next/next/no-img-element */
import { getStoryById } from "@/services/story";

import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Heart, Share2, MessageCircle, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";



interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    notFound();
  }

  const location = (story as any).location;

  return (
    <article className="min-h-screen bg-background pb-20">
      <div className="relative w-full h-[50vh] md:h-[70vh] min-h-[400px]">
        <img src={story.coverImage || '/placeholder.jpg'} alt={story.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/20" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-16">
           <div className="container mx-auto max-w-4xl">
             {location && (
                <Link href={`/location/${location.slug}`}>
                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors text-primary-foreground backdrop-blur-md text-sm font-medium mb-6">
                      <MapPin className="h-4 w-4" />
                      {location.name}, {location.district}
                   </span>
                </Link>
             )}
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-8 leading-tight tracking-tight shadow-sm">
               {story.title}
             </h1>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                   <AvatarImage src={story.user?.avatar || undefined} />
                   <AvatarFallback>{(story.user?.name || 'U').charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                   <p className="font-bold text-foreground text-lg">{story.user?.name || 'Unknown User'}</p>
                   <p className="text-muted-foreground font-medium">
                     Published {formatDistanceToNow(story.createdAt, { addSuffix: true })}
                   </p>
                 </div>
               </div>
               
               <div className="hidden md:flex gap-3">
                 <Button variant="secondary" size="icon" className="rounded-full shadow-sm bg-background/50 backdrop-blur hover:bg-background/80">
                   <Bookmark className="h-5 w-5" />
                 </Button>
                 <Button variant="secondary" size="icon" className="rounded-full shadow-sm bg-background/50 backdrop-blur hover:bg-background/80">
                   <Share2 className="h-5 w-5" />
                 </Button>
               </div>
             </div>
           </div>
        </div>
      </div>
      
      <div className="container mx-auto max-w-3xl px-6 pt-16 -mt-8 relative z-10 bg-background rounded-t-3xl">
        <div className="flex justify-between items-center mb-12 py-4 border-y border-border/50">
           <div className="flex gap-6">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                 <Heart className="h-6 w-6" />
                 <span className="font-semibold text-lg">124</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                 <MessageCircle className="h-6 w-6" />
                 <span className="font-semibold text-lg">24</span>
              </div>
           </div>
           <div className="flex md:hidden gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                 <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                 <Share2 className="h-5 w-5" />
              </Button>
           </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-loose">
          {story.content.split('\n').map((paragraph, i) => (
             paragraph.trim() ? <p key={i} className="mb-8 text-lg">{paragraph}</p> : null
          ))}
        </div>
        
        <div className="mt-16 pt-12 border-t border-border/50 mb-12">
          <h3 className="text-2xl font-bold mb-8">Author</h3>
          <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-2xl">
             <Avatar className="h-20 w-20 border-2 border-primary/20">
               <AvatarImage src={story.user?.avatar || undefined} />
               <AvatarFallback>{(story.user?.name || 'U').charAt(0)}</AvatarFallback>
             </Avatar>
             <div>
                <h4 className="font-bold text-xl mb-2">{story.user?.name || 'Unknown User'}</h4>
                <p className="text-muted-foreground mb-4">An avid traveler exploring the hidden wonders of the Konkan coast. Always seeking the road less traveled.</p>
                <Button variant="outline" size="sm" className="rounded-full">View Profile</Button>
             </div>
          </div>
        </div>
      </div>
    </article>
  )
}
