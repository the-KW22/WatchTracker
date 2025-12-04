import axios from 'axios'
import { TMDBItem } from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

const convertToTMDBItem = (item: any, mediaType: 'movie' | 'tv'): TMDBItem => {
  return {
    id: item.id,
    title: mediaType === 'movie' ? item.title : undefined,
    name: mediaType === 'tv' ? item.name : undefined,
    media_type: mediaType,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    runtime: item.runtime ? item.runtime * 60 : undefined,
    episode_runtime: item.episode_run_time ? item.episode_run_time[0] * 60 : undefined,
    number_of_seasons: item.number_of_seasons,
    number_of_episodes: item.number_of_episodes,
  };
};

export const tmdbApi = {
  searchMulti: async (query: string): Promise<{ results: TMDBItem[] }> => {
    if (!TMDB_API_KEY) {
      console.error('TMDB API key is not configured');
      return { results: [] };
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page: 1,
          include_adult: false,
        },
      });

      const results = response.data.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => convertToTMDBItem(item, item.media_type));

      return { results };
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return { results: [] };
    }
  },

  getRecommendations: async (limit: number = 12): Promise<TMDBItem[]> => {
    if (!TMDB_API_KEY) {
      console.error('TMDB API key is not configured');
      return [];
    }

    try {
      const moviesResponse = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          page: 1,
        },
      });

      const tvResponse = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          page: 1,
        },
      });

      const movies = moviesResponse.data.results.slice(0, limit / 2).map((item: any) => 
        convertToTMDBItem(item, 'movie')
      );
      
      const tvShows = tvResponse.data.results.slice(0, limit / 2).map((item: any) => 
        convertToTMDBItem(item, 'tv')
      );

      const combined = [...movies, ...tvShows];
      return combined.sort(() => 0.5 - Math.random()).slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  getImageUrl: (path: string | null): string => {
    if (!path) {
      return 'https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Image';
    }
    return `${TMDB_IMAGE_BASE}${path}`;
  },

  getMovieDetails: async (tmdbId: number): Promise<TMDBItem | null> => {
    if (!TMDB_API_KEY) {
      console.error('TMDB API key is not configured');
      return null;
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      });

      return convertToTMDBItem(response.data, 'movie');
    } catch (error) {
      console.error('Error getting movie details:', error);
      return null;
    }
  },

  getTVDetails: async (tmdbId: number): Promise<TMDBItem | null> => {
    if (!TMDB_API_KEY) {
      console.error('TMDB API key is not configured');
      return null;
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      });

      return convertToTMDBItem(response.data, 'tv');
    } catch (error) {
      console.error('Error getting TV details:', error);
      return null;
    }
  },

  getTMDBItem: async (tmdbId: number, mediaType?: 'movie' | 'tv'): Promise<TMDBItem | null> => {
    if (mediaType === 'movie') {
      return await tmdbApi.getMovieDetails(tmdbId);
    } else if (mediaType === 'tv') {
      return await tmdbApi.getTVDetails(tmdbId);
    }

    const movie = await tmdbApi.getMovieDetails(tmdbId);
    if (movie) return movie;

    const tv = await tmdbApi.getTVDetails(tmdbId);
    return tv;
  },

  getItemDuration: async (tmdbId: number, mediaType: 'movie' | 'tv'): Promise<number | undefined> => {
    const item = await tmdbApi.getTMDBItem(tmdbId, mediaType);
    
    if (!item) return undefined;

    if (mediaType === 'movie') {
      return item.runtime;
    } else {
      return item.episode_runtime;
    }
  },

  getShowDetails: async (tmdbId: number): Promise<{ maxSeasons: number; maxEpisodes: number } | null> => {
    if (!TMDB_API_KEY) {
      console.error('TMDB API key is not configured');
      return null;
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      });

      const data = response.data;
      
      const totalEpisodes = data.seasons?.reduce((total: number, season: any) => {
        return total + (season.episode_count || 0);
      }, 0) || 0;

      return {
        maxSeasons: data.number_of_seasons || 10,
        maxEpisodes: totalEpisodes || 100,
      };
    } catch (error) {
      console.error('Error getting show details:', error);
      return { maxSeasons: 10, maxEpisodes: 100 };
    }
  },

  searchMovies: async (query: string): Promise<TMDBItem[]> => {
    if (!TMDB_API_KEY) return [];

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page: 1,
        },
      });

      return response.data.results.map((item: any) => convertToTMDBItem(item, 'movie'));
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  searchTV: async (query: string): Promise<TMDBItem[]> => {
    if (!TMDB_API_KEY) return [];

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page: 1,
        },
      });

      return response.data.results.map((item: any) => convertToTMDBItem(item, 'tv'));
    } catch (error) {
      console.error('Error searching TV shows:', error);
      return [];
    }
  },

  getTrending: async (timeWindow: 'day' | 'week' = 'week', limit: number = 12): Promise<TMDBItem[]> => {
    if (!TMDB_API_KEY) return [];

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/trending/all/${timeWindow}`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      });

      return response.data.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, limit)
        .map((item: any) => convertToTMDBItem(item, item.media_type));
    } catch (error) {
      console.error('Error getting trending:', error);
      return [];
    }
  },
};

export const tmdbMockApi = tmdbApi;