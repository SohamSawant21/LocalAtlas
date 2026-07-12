import { User, LocationData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Trophy, Navigation, Settings, Grid, Bookmark, Award, Calendar } from 'lucide-react';
import { GemCard } from '@/components/shared/GemCard';
import { FollowButton } from '@/components/profile/FollowButton';

interface ProfileViewProps {
  user: User;
  locations: LocationData[];
  currentUserId?: string | null;
  isFollowing?: boolean;
}

export function ProfileView({ user, locations, currentUserId, isFollowing = false }: ProfileViewProps) {
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-md">
          <AvatarImage src={user.avatar || undefined} alt={user.name || 'User'} />
          <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
            {user.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-muted-foreground">
                {user.location && (
                  <span className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {joinDate}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-end gap-3">
              {currentUserId !== user.id && (
                <FollowButton targetUserId={user.id} initialIsFollowing={isFollowing} />
              )}
              {currentUserId === user.id && (
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              {user.bio}
            </p>
          )}

          {user._count && (
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl font-bold">{user._count.locations}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Discoveries</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl font-bold">{user._count.followers}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl font-bold">{user._count.following}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Following</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="flex items-center text-xl font-bold text-yellow-500">
                  <Trophy className="w-5 h-5 mr-1" />
                  {user.reputation}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Reputation</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="discoveries" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger 
            value="discoveries"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            <Grid className="w-4 h-4 mr-2" />
            Discoveries
          </TabsTrigger>
          <TabsTrigger 
            value="saved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Saved
          </TabsTrigger>
          <TabsTrigger 
            value="badges"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            <Award className="w-4 h-4 mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discoveries" className="mt-6">
          {locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <GemCard key={loc.id} location={loc} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No discoveries yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                When you discover and add new places, they&apos;ll show up here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {(user as any).savedPlaces && (user as any).savedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(user as any).savedPlaces.map((sp: any) => (
                <GemCard key={sp.location.id} location={sp.location} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No saved places</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Start saving hidden gems you want to visit later.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No badges earned</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Contribute to the community to earn unique badges.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
