import { create } from 'zustand';
import { User, TrackedItem, TMDBItem } from '../types';

interface AppState{
    user: User | null;
    setUser: (user: User | null) => void;

    trackedItems: TrackedItem[];
    setTrackedItems: (items: TrackedItem[]) => void;
    addTrackedItem: (item: TrackedItem) => void;
    updateTrackedItem: (id: string, updates: Partial<TrackedItem>) => void;
    removeTrackedItem: (id: string) => void;

    searchResults: TMDBItem[];
    setSearchResults: (results: TMDBItem[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearching: boolean;
    setIsSearching: (isSearching: boolean) => void;

    isSidebarOpen: boolean;
    toggleSidebar: () => void;

    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;

    selectedItem: TrackedItem | null;
    setSelectedItem: (item: TrackedItem | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Tracked items
  trackedItems: [],
  setTrackedItems: (trackedItems) => set({ trackedItems }),
  
  addTrackedItem: (item) => 
    set((state) => ({ 
      trackedItems: [...state.trackedItems, item] 
    })),
  
  updateTrackedItem: (id, updates) =>
    set((state) => ({
      trackedItems: state.trackedItems.map((item) =>
        item.id === id 
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      ),
    })),
  
  removeTrackedItem: (id) =>
    set((state) => ({
      trackedItems: state.trackedItems.filter((item) => item.id !== id),
    })),
  
  // Search state
  searchResults: [],
  setSearchResults: (searchResults) => set({ searchResults }),
  
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  isSearching: false,
  setIsSearching: (isSearching) => set({ isSearching }),
  
  // UI state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  selectedItem: null,
  setSelectedItem: (selectedItem) => set({ selectedItem }),
}));