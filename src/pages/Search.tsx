import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { tmdbApi } from '../lib/tmdb';
import { TMDBItem } from '../types';
import { Search as SearchIcon, Film, Tv, Loader2, Plus, Star, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { addTrackedItem } from '../lib/supabaseHelpers';
import { useAuth } from '../hooks/useAuth';

export const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching, setIsSearching } = useStore();
  const [selectedItem, setSelectedItem] = useState<TMDBItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [recommendations, setRecommendations] = useState<TMDBItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null> (null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    const recs = await tmdbApi.getRecommendations(12);
    setRecommendations(recs);
    setLoadingRecommendations(false);
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { results } = await tmdbApi.searchMulti(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleCardClick = (item: TMDBItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedItem || !user) return;

    setIsAdding(true);
    try {
      let duration = undefined;
      if (selectedItem.media_type === 'movie') {
        duration = await tmdbApi.getItemDuration(selectedItem.id, 'movie');
      } else if (selectedItem.media_type === 'tv') {
        duration = await tmdbApi.getItemDuration(selectedItem.id, 'tv');
      }

      const newItem = await addTrackedItem({
        user_id: user.id,
        tmdb_id: selectedItem.id,
        title: selectedItem.title || selectedItem.name || 'Unknown',
        poster_url: tmdbApi.getImageUrl(selectedItem.poster_path),
        backdrop_url: tmdbApi.getImageUrl(selectedItem.backdrop_path),
        media_type: selectedItem.media_type,
        timestamp_seconds: 0,
        status: 'plan-to-watch',
        current_season: selectedItem.media_type === 'tv' ? 1 : undefined,
        current_episode: selectedItem.media_type === 'tv' ? 1 : undefined,
        total_duration_seconds: duration,
      });

      if (newItem) {
        setIsDialogOpen(false);
        setSelectedItem(null);
        navigate(`/details/${newItem.id}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="card-base border border-[hsl(var(--border))] animate-slide-up">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
            <SearchIcon className="w-6 h-6" />
            Search Movies & TV Shows
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-muted))]" />
              <Input
                type="text"
                placeholder="Start typing to search... (e.g., 'inception', 'breaking bad')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base text-[hsl(var(--text-primary))] pl-12 h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="btn-base h-12 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-[hsl(var(--text-primary))] px-8"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                </>
              ) : (
                'Search'
              )}
            </Button>
          </form>
          {searchQuery && (
            <p className="text-xs text-[hsl(var(--text-muted))] mt-2">
              {isSearching ? 'Searching...' : searchResults.length > 0 ? `Found ${searchResults.length} results` : 'Type to see results instantly'}
            </p>
          )}
        </CardContent>
      </Card>

      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton h-96 animate-pulse-subtle"></div>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <SearchIcon className="w-5 h-5 text-[hsl(var(--text-primary))]" />
            <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))]">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((item, index) => (
              <SearchResultCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                onClick={() => handleCardClick(item)}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      ) : searchQuery ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex p-6 rounded-full bg-[hsl(var(--accent))] mb-6">
            <SearchIcon className="w-12 h-12 text-[hsl(var(--text-muted))]" />
          </div>
          <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))] mb-2">
            No results found for "{searchQuery}"
          </h3>
          <p className="text-[hsl(var(--text-secondary))]">Try a different search term</p>
        </div>
      ) : (
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[hsl(var(--text-primary))]" />
            <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))]">
              Recommended for You
            </h3>
          </div>
          {loadingRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="skeleton h-96 animate-pulse-subtle"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((item, index) => (
                <SearchResultCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  onClick={() => handleCardClick(item)}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] rounded-2xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--text-primary))]">Add to Your Library</DialogTitle>
            <DialogDescription className="text-[hsl(var(--text-secondary))]">
              Add "{selectedItem?.title || selectedItem?.name}" to your watchlist?
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-5">
              <div className="flex gap-4">
                <img
                  src={tmdbApi.getImageUrl(selectedItem.poster_path)}
                  alt={selectedItem.title || selectedItem.name}
                  className="w-24 h-36 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[hsl(var(--text-primary))] mb-2">
                    {selectedItem.title || selectedItem.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="badge-base bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))]">
                      {selectedItem.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    </Badge>
                    {selectedItem.vote_average && (
                      <Badge className="badge-base bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[hsl(var(--text-secondary))]" />
                        {selectedItem.vote_average.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[hsl(var(--text-muted))] line-clamp-3">
                    {selectedItem.overview}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAdd}
                  className="flex-1 btn-base bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-[hsl(var(--text-primary))]"
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Library
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface SearchResultCardProps {
  item: TMDBItem;
  onClick: () => void;
  delay: number;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ item, onClick, delay }) => {
  const title = item.title || item.name || 'Unknown';
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div 
      className="stagger-item card-base overflow-hidden hover-lift group cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-[hsl(var(--accent))]">
        <img
          src={tmdbApi.getImageUrl(item.poster_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute top-3 left-3">
          {item.media_type === 'movie' ? (
            <Film className="w-4 h-4 text-white drop-shadow-lg" />
          ) : (
            <Tv className="w-4 h-4 text-white drop-shadow-lg" />
          )}
        </div>
        {item.vote_average && (
          <div className="absolute top-3 right-3">
            <Badge className="badge-base bg-black/50 text-white backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              {item.vote_average.toFixed(1)}
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white rounded-full p-3">
            <Plus className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-1 truncate">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm text-[hsl(var(--text-secondary))] mb-3">
          <span>{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
          {year && <span>{year}</span>}
        </div>
        <div className="text-xs text-[hsl(var(--text-muted))] text-center py-2 bg-[hsl(var(--accent))] rounded-lg">
          Click to add to library
        </div>
      </CardContent>
    </div>
  );
};