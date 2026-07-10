import { getStories } from "@/services/story";
import { StoryCard } from "@/components/stories/StoryCard";
import { Compass } from "lucide-react";

export default async function StoriesPage() {
  const allStories = await getStories();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto py-16 px-4 max-w-6xl">
           <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Compass className="h-4 w-4" />
                Community Stories
             </div>
             <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
               Journey through the eyes of locals
             </h1>
             <p className="text-lg text-muted-foreground">
               Read inspiring travelogues, detailed itineraries, and untold stories from our community of passionate explorers.
             </p>
           </div>
        </div>
      </div>
      
      <div className="container mx-auto py-12 px-4 max-w-6xl">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {allStories.map((story, i) => (
             <StoryCard key={story.id} story={story as any} featured={i === 0} />
           ))}
         </div>
      </div>
    </div>
  )
}
