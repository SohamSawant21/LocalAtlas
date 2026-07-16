import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getLocationBySlug } from '@/services/location';
import { ReviewSection } from '@/components/location/ReviewSection';
import { SaveButton } from '@/components/location/SaveButton';
import { ShareButton } from '@/components/location/ShareButton';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Star, Share2, Bookmark, CheckCircle, Navigation, Info, Mountain, Calendar, AlertTriangle } from 'lucide-react';

interface LocationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const location = await getLocationBySlug(slug);
  const session = await auth();

  if (!location) {
    notFound();
  }

  const isSaved = session?.user?.id 
    ? await prisma.savedPlace.findFirst({
        where: { userId: session.user.id, locationId: location.id }
      }) !== null
    : false;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={location.images[0] || '/placeholder.jpg'} 
              alt={location.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <Badge className="mb-4 bg-primary/90 hover:bg-primary text-white border-none backdrop-blur-sm">{location.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                {location.name}
              </h1>
              <div className="flex items-center text-white/90 space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{location.district}</span>
                </div>
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="text-sm font-medium">{location.hiddenScore} Hidden Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 border">
              <Mountain className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</p>
                <p className="font-medium text-sm mt-1">{location.difficulty}</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 border">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Best Season</p>
                <p className="font-medium text-sm mt-1">{location.bestSeason}</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 border">
              <Info className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Crowd Level</p>
                <p className="font-medium text-sm mt-1">{location.crowdLevel.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 border">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Roads</p>
                <p className="font-medium text-sm mt-1">{location.roadCondition}</p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6 space-x-6">
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="tips"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
              >
                Local Tips
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3">About this hidden gem</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {location.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {location.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {location.images.length > 1 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {location.images.slice(1).map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img} 
                          alt={`${location.name} - Gallery image ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              <ReviewSection 
                locationId={location.id} 
                reviews={location.reviews as any || []} 
                isAuthenticated={!!session?.user} 
              />
            </TabsContent>
            
            <TabsContent value="tips">
              <div className="space-y-4">
                {location.safety && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Safety Tip</h4>
                      <p className="text-sm text-yellow-800/80 dark:text-yellow-400/80 mt-1 leading-relaxed">{location.safety}</p>
                    </div>
                  </div>
                )}
                {location.bestTime && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex gap-4">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400">Best Time to Visit</h4>
                      <p className="text-sm text-blue-800/80 dark:text-blue-400/80 mt-1 leading-relaxed">{location.bestTime}</p>
                    </div>
                  </div>
                )}
                {!location.safety && !location.bestTime && (
                  <p className="text-muted-foreground text-center py-8">No specific local tips available for this location yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card border rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <Button className="w-full text-base h-12 rounded-xl" size="lg" asChild>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Get Directions
                </a>
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <SaveButton 
                  locationId={location.id} 
                  initialSaved={isSaved} 
                  isAuthenticated={!!session?.user} 
                />
                <ShareButton location={location} />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t space-y-5">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Quick Facts</h4>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Entry Fee</span>
                <span className="font-medium">{location.entryFee || 'Free'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Parking</span>
                <span className="font-medium text-right">{location.parking || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Network Coverage</span>
                <span className="font-medium">{location.network || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Accessibility</span>
                <span className="font-medium text-right max-w-[150px] truncate" title={location.accessibility || 'Unknown'}>
                  {location.accessibility || 'Unknown'}
                </span>
              </div>
              {location.sunset && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sunset Time</span>
                  <span className="font-medium">{location.sunset}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
