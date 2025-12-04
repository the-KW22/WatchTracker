// ============================================
// FILE: src/pages/Home.tsx (FIXED - Consistent Heights & Progress)
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fetchTrackedItems, updateTrackedItem } from '../lib/supabaseHelpers';
import { TrackedItem, WatchStatus } from '../types';
import { Clock, Film, Tv, Check, TrendingUp, Filter, Play, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { formatTime, calculateProgress, formatRelativeTime, formatStatus } from '../lib/utils';

type FilterType = 'all' | 'watching' | 'completed' | 'on-hold';

// Status color mapping
const getStatusBadgeClass = (status: WatchStatus): string => {
  switch (status) {
    case 'watching':
      return 'bg-[hsl(var(--info-muted))] text-[hsl(var(--info))]';
    case 'completed':
      return 'bg-[hsl(var(--success-muted))] text-[hsl(var(--success))]';
    case 'on-hold':
      return 'bg-[hsl(var(--warning-muted))] text-[hsl(var(--warning))]';
    case 'plan-to-watch':
      return 'bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))]';
    default:
      return 'bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))]';
  }
};

export const Home = () => {
  const navigate = useNavigate();
  const { trackedItems, setTrackedItems } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Quick edit dialog
  const [quickEditItem, setQuickEditItem] = useState<TrackedItem | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [quickEditSeason, setQuickEditSeason] = useState(1);
  const [quickEditEpisode, setQuickEditEpisode] = useState(1);
  const [quickEditStatus, setQuickEditStatus] = useState<WatchStatus>('watching');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTrackedItems();
  }, []);

  const loadTrackedItems = async () => {
    setLoading(true);
    const items = await fetchTrackedItems();
    setTrackedItems(items);
    setLoading(false);
  };

  const handleQuickEdit = (item: TrackedItem) => {
    setQuickEditItem(item);
    setQuickEditSeason(item.current_season || 1);
    setQuickEditEpisode(item.current_episode || 1);
    setQuickEditStatus(item.status);
    setIsQuickEditOpen(true);
  };

  const handleSaveQuickEdit = async () => {
    if (!quickEditItem) return;

    setSaving(true);
    const updates: Partial<TrackedItem> = {
      status: quickEditStatus,
      last_watched_date: new Date().toISOString(),
    };

    if (quickEditItem.media_type === 'tv') {
      updates.current_season = quickEditSeason;
      updates.current_episode = quickEditEpisode;
    }

    const updated = await updateTrackedItem(quickEditItem.id, updates);
    if (updated) {
      setTrackedItems(trackedItems.map(item => 
        item.id === updated.id ? updated : item
      ));
    }

    setSaving(false);
    setIsQuickEditOpen(false);
  };

  const handleItemClick = (item: TrackedItem, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
      if (item.status !== 'completed' && item.status !== 'plan-to-watch') {
        handleQuickEdit(item);
      } else {
        navigate(`/details/${item.id}`);
      }
    }
  };

  const getFilteredItems = () => {
    switch (activeFilter) {
      case 'watching':
        return trackedItems.filter(item => item.status === 'watching');
      case 'completed':
        return trackedItems.filter(item => item.status === 'completed');
      case 'on-hold':
        return trackedItems.filter(item => item.status === 'on-hold');
      default:
        return trackedItems;
    }
  };

  const filteredItems = getFilteredItems();
  const continueWatching = trackedItems.filter(
    (item) => item.status === 'watching' && item.timestamp_seconds > 0
  );

  const totalTracked = trackedItems.length;
  const totalCompleted = trackedItems.filter(item => item.status === 'completed').length;
  const totalHoursWatched = Math.floor(
    trackedItems.reduce((acc, item) => acc + (item.timestamp_seconds || 0), 0) / 3600
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 animate-pulse-subtle"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-96 animate-pulse-subtle"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Tracked"
          value={totalTracked}
          subtitle="Movies & Shows"
          icon={<Film className="w-5 h-5" />}
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          delay={0}
        />
        <StatCard
          title="Completed"
          value={totalCompleted}
          subtitle="Finished watching"
          icon={<Check className="w-5 h-5" />}
          active={activeFilter === 'completed'}
          onClick={() => setActiveFilter('completed')}
          delay={0.1}
        />
        <StatCard
          title="Hours Watched"
          value={totalHoursWatched}
          subtitle="Time invested"
          icon={<Clock className="w-5 h-5" />}
          delay={0.2}
        />
      </section>

      {/* Active Filter Indicator */}
      {activeFilter !== 'all' && (
        <div className="flex items-center gap-3 animate-slide-down">
          <Filter className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
          <span className="text-sm text-[hsl(var(--text-secondary))]">Filtered by:</span>
          <Badge className="badge-base bg-[hsl(var(--accent))] text-[hsl(var(--text-primary))]">
            {formatStatus(activeFilter)}
          </Badge>
          <button
            onClick={() => setActiveFilter('all')}
            className="text-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Continue Watching */}
      {activeFilter === 'all' && continueWatching.length > 0 && (
        <section className="animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Play className="w-5 h-5 text-[hsl(var(--text-primary))]" />
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Continue Watching</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueWatching.map((item, index) => (
              <MovieCard 
                key={item.id} 
                item={item} 
                onClick={(e) => handleItemClick(item, e)}
                onDetailClick={() => navigate(`/details/${item.id}`)}
                delay={index * 0.05}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Items */}
      {filteredItems.length > 0 ? (
        <section className="animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-5 h-5 text-[hsl(var(--text-primary))]" />
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
              {activeFilter === 'all' ? 'All Items' : formatStatus(activeFilter)}
            </h2>
            <span className="text-[hsl(var(--text-muted))]">({filteredItems.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <MovieCard 
                key={item.id} 
                item={item} 
                onClick={(e) => handleItemClick(item, e)}
                onDetailClick={() => navigate(`/details/${item.id}`)}
                delay={index * 0.05}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState onSearchClick={() => navigate('/search')} />
      )}

      {/* Quick Edit Dialog */}
      <Dialog open={isQuickEditOpen} onOpenChange={setIsQuickEditOpen}>
        <DialogContent className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] rounded-2xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--text-primary))]">Quick Update</DialogTitle>
          </DialogHeader>
          
          {quickEditItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={quickEditItem.poster_url || ''}
                  alt={quickEditItem.title}
                  className="w-16 h-24 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-semibold text-[hsl(var(--text-primary))]">{quickEditItem.title}</h3>
                  <Badge className={`badge-base ${getStatusBadgeClass(quickEditItem.status)} mt-1`}>
                    {formatStatus(quickEditItem.status)}
                  </Badge>
                </div>
              </div>

              {quickEditItem.media_type === 'tv' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--text-secondary))]">Season</label>
                    <Input
                      type="number"
                      min="1"
                      value={quickEditSeason}
                      onChange={(e) => setQuickEditSeason(parseInt(e.target.value) || 1)}
                      className="input-base text-[hsl(var(--text-primary))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--text-secondary))]">Episode</label>
                    <Input
                      type="number"
                      min="1"
                      value={quickEditEpisode}
                      onChange={(e) => setQuickEditEpisode(parseInt(e.target.value) || 1)}
                      className="input-base text-[hsl(var(--text-primary))]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--text-secondary))]">Status</label>
                <Select value={quickEditStatus} onValueChange={(val) => setQuickEditStatus(val as WatchStatus)}>
                  <SelectTrigger className="input-base text-[hsl(var(--text-primary))]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--surface))] border-[hsl(var(--border))] rounded-xl">
                    <SelectItem value="watching" className="text-[hsl(var(--text-primary))] rounded-lg">Watching</SelectItem>
                    <SelectItem value="completed" className="text-[hsl(var(--text-primary))] rounded-lg">Completed</SelectItem>
                    <SelectItem value="on-hold" className="text-[hsl(var(--text-primary))] rounded-lg">On Hold</SelectItem>
                    <SelectItem value="plan-to-watch" className="text-[hsl(var(--text-primary))] rounded-lg">Plan to Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/details/${quickEditItem.id}`)}
                  className="flex-1 btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
                >
                  Full Details
                </Button>
                <Button
                  onClick={handleSaveQuickEdit}
                  disabled={saving}
                  className="flex-1 btn-base bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-[hsl(var(--text-primary))]"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, active, onClick, delay }) => (
  <div 
    className={`
      card-base p-6 cursor-pointer transition-all duration-300 hover-lift
      ${active ? 'ring-2 ring-[hsl(var(--accent-hover))]' : ''}
    `}
    onClick={onClick}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-[hsl(var(--text-secondary))]">{title}</span>
      <div className="text-[hsl(var(--text-muted))]">{icon}</div>
    </div>
    <p className="text-4xl font-bold text-[hsl(var(--text-primary))] mb-2">{value}</p>
    <p className="text-xs text-[hsl(var(--text-muted))]">{subtitle}</p>
  </div>
);

// Movie Card Component - FIXED with consistent heights
interface MovieCardProps {
  item: TrackedItem;
  onClick: (e: React.MouseEvent) => void;
  onDetailClick: () => void;
  delay: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ item, onClick, onDetailClick, delay }) => {
  const progress = item.total_duration_seconds
    ? calculateProgress(item.timestamp_seconds, item.total_duration_seconds)
    : 0;

  return (
    <div
      className="stagger-item card-base overflow-hidden cursor-pointer hover-lift group flex flex-col"
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Poster */}
      <div className="aspect-video relative overflow-hidden bg-[hsl(var(--accent))]">
        <img
          src={item.poster_url || ''}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-3 right-3">
          <Badge className={`badge-base ${getStatusBadgeClass(item.status)}`}>
            {formatStatus(item.status)}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          {item.media_type === 'movie' ? (
            <Film className="w-4 h-4 text-white drop-shadow-lg" />
          ) : (
            <Tv className="w-4 h-4 text-white drop-shadow-lg" />
          )}
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-2 truncate">
          {item.title}
        </h3>

        {/* Episode Info */}
        {item.media_type === 'tv' && item.current_season && item.current_episode && (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] mb-3">
            <span>S{item.current_season} E{item.current_episode}</span>
            {item.total_duration_seconds && (
              <>
                <span>•</span>
                <span>{formatTime(item.timestamp_seconds)}</span>
              </>
            )}
          </div>
        )}

        {/* Progress Bar - ALWAYS SHOW for consistent height */}
        <div className="mb-3">
          <Progress 
            value={progress} 
            className="h-1.5 bg-[hsl(var(--accent))]" 
          />
          <p className="text-xs text-[hsl(var(--text-muted))] mt-1.5">
            {progress > 0 ? `${progress}% complete` : 'Not started'}
          </p>
        </div>

        {/* Last Watched - ALWAYS SHOW for consistent height */}
        <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))] mb-3">
          <Calendar className="w-3 h-3" />
          <span>
            {item.last_watched_date 
              ? formatRelativeTime(item.last_watched_date)
              : 'Never watched'
            }
          </span>
        </div>

        {/* Button at bottom */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDetailClick();
          }}
          variant="outline"
          size="sm"
          className="w-full btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))] mt-auto"
        >
          View Details
        </Button>
      </CardContent>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ onSearchClick: () => void }> = ({ onSearchClick }) => (
  <div className="text-center py-20 animate-fade-in">
    <div className="inline-flex p-6 rounded-full bg-[hsl(var(--accent))] mb-6">
      <Film className="w-12 h-12 text-[hsl(var(--text-muted))]" />
    </div>
    <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">No items tracked yet</h2>
    <p className="text-[hsl(var(--text-secondary))] mb-8 max-w-md mx-auto">
      Start tracking your favorite movies and shows to keep track of your progress
    </p>
    <Button
      onClick={onSearchClick}
      className="btn-base bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-[hsl(var(--text-primary))] px-8"
    >
      <Film className="w-4 h-4 mr-2" />
      Search Movies & Shows
    </Button>
  </div>
);