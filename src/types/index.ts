export type District = 'SINDHUDURG' | 'RATNAGIRI' | 'RAIGAD';
export type LocationCategory = 'BEACH' | 'WATERFALL' | 'FORT' | 'TEMPLE' | 'TRAIL' | 'VIEWPOINT' | 'EATERY' | 'HERITAGE' | 'HOMESTAY' | 'OTHER';
export type CrowdLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type Difficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
export type RoadCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'OFFROAD';
export type Season = 'MONSOON' | 'WINTER' | 'SUMMER' | 'ALL_YEAR';
export type LocationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'VERIFICATION' | 'APPROVAL' | 'WEATHER_ALERT' | 'ROAD_CLOSURE' | 'ACHIEVEMENT' | 'SYSTEM';
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  role: UserRole;
  reputation: number;
  createdAt: Date;
  _count?: {
    locations: number;
    followers: number;
    following: number;
    savedPlaces: number;
  };
}

export interface LocationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  district: District;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  hiddenScore: number;
  crowdLevel: CrowdLevel;
  difficulty: Difficulty;
  roadCondition: RoadCondition;
  bestSeason: Season;
  entryFee: string | null;
  parking: string | null;
  network: string | null;
  accessibility: string | null;
  bestTime: string | null;
  sunset: string | null;
  safety: string | null;
  verified: boolean;
  verificationCount: number;
  status: LocationStatus;
  tags: string[];
  images: string[];
  userId: string;
  contributor?: User;
  reviews?: ReviewData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  actorId: string | null;
  locationId: string | null;
  actor?: User;
  location?: LocationData;
  createdAt: Date;
}

export interface SavedPlaceData {
  id: string;
  userId: string;
  locationId: string;
  collectionName: string | null;
  location?: LocationData;
  createdAt: Date;
}

export interface TripData {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  locations: TripLocationData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TripLocationData {
  id: string;
  tripId: string;
  locationId: string;
  order: number;
  notes: string | null;
  location?: LocationData;
}

export interface ReviewData {
  id: string;
  content: string;
  rating: number;
  locationId: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

export interface CommentData {
  id: string;
  content: string;
  locationId: string;
  userId: string;
  parentId: string | null;
  user?: User;
  replies?: CommentData[];
  createdAt: Date;
}

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  unlockedAt: Date;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  district?: District;
  category?: LocationCategory;
  crowdLevel?: CrowdLevel;
  difficulty?: Difficulty;
  roadCondition?: RoadCondition;
  season?: Season;
  minHiddenScore?: number;
  verified?: boolean;
  tags?: string[];
  maxDistance?: number;
  sortBy?: 'relevance' | 'hiddenScore' | 'newest' | 'rating';
}

export interface ContributionFormData {
  name: string;
  district: District;
  category: LocationCategory;
  description: string;
  latitude: number;
  longitude: number;
  difficulty: Difficulty;
  crowdLevel: CrowdLevel;
  roadCondition: RoadCondition;
  bestSeason: Season;
  entryFee?: string;
  parking?: string;
  network?: string;
  accessibility?: string;
  tags: string[];
  images: File[];
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
