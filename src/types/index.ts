export type MediaType = 'movie' | 'tv';

export type WatchStatus = 'watching' | 'completed' | 'on-hold' | 'plan-to-watch';

export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  media_type: MediaType;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  runtime?: number; // Movie runtime in seconds
  episode_runtime?: number; // TV episode runtime in seconds
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TrackedItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  backdrop_url: string | null;
  media_type: MediaType;
  
  // Progress tracking
  current_season?: number;
  current_episode?: number;
  timestamp_seconds: number;
  total_duration_seconds?: number;
  
  // Status
  status: WatchStatus;
  
  // Metadata
  last_watched_date?: string;
  notes?: string;
  rating?: number;
  
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}