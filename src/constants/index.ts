export const SITE_CONFIG = {
  name: 'LocalAtlas',
  description: 'Discover the Konkan Only Locals Know - Hidden beaches, forgotten forts, secret waterfalls, and authentic local experiences.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.jpg',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Explore', href: '/explore', icon: 'explore' },
  { label: 'Map', href: '/map', icon: 'map' },
  { label: 'Community', href: '/community', icon: 'group' },
  { label: 'Stories', href: '/stories', icon: 'auto_stories' },
] as const;

export const BOTTOM_NAV_LINKS = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Explore', href: '/explore', icon: 'explore' },
  { label: 'Saved', href: '/saved', icon: 'favorite' },
  { label: 'Map', href: '/map', icon: 'map' },
  { label: 'Profile', href: '/profile', icon: 'person' },
] as const;

export const DISTRICTS = [
  { id: 'sindhudurg', label: 'Sindhudurg', value: 'SINDHUDURG' as const },
  { id: 'ratnagiri', label: 'Ratnagiri', value: 'RATNAGIRI' as const },
  { id: 'raigad', label: 'Raigad', value: 'RAIGAD' as const },
] as const;

export const CATEGORIES = [
  { id: 'beach', label: 'Beach', value: 'BEACH' as const, icon: 'beach_access' },
  { id: 'waterfall', label: 'Waterfall', value: 'WATERFALL' as const, icon: 'water_drop' },
  { id: 'fort', label: 'Fort', value: 'FORT' as const, icon: 'castle' },
  { id: 'temple', label: 'Temple', value: 'TEMPLE' as const, icon: 'temple_hindu' },
  { id: 'trail', label: 'Trail', value: 'TRAIL' as const, icon: 'hiking' },
  { id: 'viewpoint', label: 'Viewpoint', value: 'VIEWPOINT' as const, icon: 'landscape' },
  { id: 'eatery', label: 'Eatery', value: 'EATERY' as const, icon: 'restaurant' },
  { id: 'heritage', label: 'Heritage', value: 'HERITAGE' as const, icon: 'account_balance' },
  { id: 'homestay', label: 'Homestay', value: 'HOMESTAY' as const, icon: 'cottage' },
  { id: 'other', label: 'Other', value: 'OTHER' as const, icon: 'more_horiz' },
] as const;

export const CROWD_LEVELS = [
  { id: 'very_low', label: 'Very Low', value: 'VERY_LOW' as const },
  { id: 'low', label: 'Low', value: 'LOW' as const },
  { id: 'medium', label: 'Medium', value: 'MEDIUM' as const },
  { id: 'high', label: 'High', value: 'HIGH' as const },
  { id: 'very_high', label: 'Very High', value: 'VERY_HIGH' as const },
] as const;

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', value: 'EASY' as const },
  { id: 'moderate', label: 'Moderate', value: 'MODERATE' as const },
  { id: 'hard', label: 'Hard', value: 'HARD' as const },
  { id: 'expert', label: 'Expert', value: 'EXPERT' as const },
] as const;

export const ROAD_CONDITIONS = [
  { id: 'excellent', label: 'Excellent', value: 'EXCELLENT' as const },
  { id: 'good', label: 'Good', value: 'GOOD' as const },
  { id: 'fair', label: 'Fair', value: 'FAIR' as const },
  { id: 'poor', label: 'Poor', value: 'POOR' as const },
  { id: 'offroad', label: 'Off-road', value: 'OFFROAD' as const },
] as const;

export const SEASONS = [
  { id: 'monsoon', label: 'Monsoon', value: 'MONSOON' as const },
  { id: 'winter', label: 'Winter', value: 'WINTER' as const },
  { id: 'summer', label: 'Summer', value: 'SUMMER' as const },
  { id: 'all_year', label: 'All Year', value: 'ALL_YEAR' as const },
] as const;

export const FILTER_TABS = [
  { id: 'all', label: 'All Gems' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'trails', label: 'Trails' },
  { id: 'eateries', label: 'Eateries' },
  { id: 'culture', label: 'Culture' },
] as const;
