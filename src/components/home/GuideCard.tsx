import { MapPin, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  reputation: number;
  _count: {
    locations: number;
    followers: number;
  };
}

interface GuideCardProps {
  user: UserData;
}

export function GuideCard({ user }: GuideCardProps) {
  return (
    <Link href={`/profile/${user.id}`}>
      <Card className="group bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-2 -right-2 bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-background">
                <Award className="w-3 h-3 mr-1" />
                {user.reputation}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{user.location}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3 mb-5 line-clamp-2 italic">
              &quot;{user.bio}&quot;
            </p>
            <div className="flex w-full justify-between items-center pt-4 border-t border-border/50 text-sm">
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground">{user._count.locations}</span>
                <span className="text-xs text-muted-foreground">Gems</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground">{user._count.followers}</span>
                <span className="text-xs text-muted-foreground">Followers</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
