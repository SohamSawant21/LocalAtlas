import { create } from 'zustand';
import type { SearchFilters, User } from '@/types';



interface SearchState {
  filters: SearchFilters;
  isSearching: boolean;
  query: string;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setQuery: (query: string) => void;
  setSearching: (searching: boolean) => void;
}

const defaultFilters: SearchFilters = {
  sortBy: 'relevance',
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  isSearching: false,
  query: '',
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setQuery: (query) => set({ query }),
  setSearching: (isSearching) => set({ isSearching }),
}));

interface UIState {
  isMobileMenuOpen: boolean;
  isNotificationPanelOpen: boolean;
  activeTab: string;
  setMobileMenuOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isNotificationPanelOpen: false,
  activeTab: 'all',
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  setNotificationPanelOpen: (isNotificationPanelOpen) =>
    set({ isNotificationPanelOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));

interface MapState {
  center: [number, number];
  zoom: number;
  selectedLocationId: string | null;
  isDrawerOpen: boolean;
  mapStyle: 'terrain' | 'satellite';
  filters: SearchFilters;
  visibleBounds: [[number, number], [number, number]] | null;
  currentLocation: [number, number] | null;
  routeLocationIds: string[];
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  selectLocation: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setMapStyle: (style: 'terrain' | 'satellite') => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setVisibleBounds: (bounds: [[number, number], [number, number]] | null) => void;
  setCurrentLocation: (location: [number, number] | null) => void;
  toggleRouteLocation: (id: string) => void;
  clearRoute: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [16.5, 73.3],
  zoom: 9,
  selectedLocationId: null,
  isDrawerOpen: false,
  mapStyle: 'terrain',
  filters: {},
  visibleBounds: null,
  currentLocation: null,
  routeLocationIds: [],
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  selectLocation: (selectedLocationId) =>
    set({ selectedLocationId, isDrawerOpen: !!selectedLocationId }),
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  setMapStyle: (mapStyle) => set({ mapStyle }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setVisibleBounds: (visibleBounds) => set({ visibleBounds }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  toggleRouteLocation: (id) => set((state) => {
    const routeLocationIds = state.routeLocationIds.includes(id) 
      ? state.routeLocationIds.filter(locId => locId !== id)
      : [...state.routeLocationIds, id];
    return { routeLocationIds };
  }),
  clearRoute: () => set({ routeLocationIds: [] })
}));
