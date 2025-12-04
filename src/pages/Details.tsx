import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrackedItemById, updateTrackedItem, deleteTrackedItem } from '../lib/supabaseHelpers';
import { TrackedItem, WatchStatus } from '../types';
import { ArrowLeft, Play, Pause, Check, Trash2, Save, Film, Tv, Star, Calendar, TrendingUp, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { formatTime, calculateProgress, formatRelativeTime, formatStatus } from '../lib/utils';
import { tmdbApi } from '../lib/tmdb';

export const Details = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<TrackedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<WatchStatus>('watching');
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [maxSeasons, setMaxSeasons] = useState<number>(10);
  const [maxEpisodesPerSeason, setMaxEpisodesPerSeason] = useState<number>(100);
  const [episodeDuration, setEpisodeDuration] = useState<number>(0);
  
  const [tmdbRating, setTmdbRating] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    
    setLoading(true);
    const fetchedItem = await getTrackedItemById(id);
    
    if (fetchedItem) {
      setItem(fetchedItem);
      setStatus(fetchedItem.status);
      setCurrentSeason(fetchedItem.current_season || 1);
      setCurrentEpisode(fetchedItem.current_episode || 1);
      
      const totalSeconds = fetchedItem.timestamp_seconds;
      setHours(Math.floor(totalSeconds / 3600));
      setMinutes(Math.floor((totalSeconds % 3600) / 60));
      setSeconds(totalSeconds % 60);
      
      setNotes(fetchedItem.notes || '');
      
      const tmdbItem = await tmdbApi.getTMDBItem(fetchedItem.tmdb_id, fetchedItem.media_type);
      if (tmdbItem) {
        setTmdbRating(tmdbItem.vote_average || null);

        if(fetchedItem.media_type === 'tv'){
          const showDetails = await tmdbApi.getShowDetails(fetchedItem.tmdb_id);

          if(showDetails){
            setMaxSeasons(showDetails.maxSeasons);

            const avgEpisodesPerSeason = Math.ceil(showDetails.maxEpisodes / showDetails.maxSeasons);
            setMaxEpisodesPerSeason(avgEpisodesPerSeason);
          }

          if(tmdbItem.episode_runtime){
            setEpisodeDuration(tmdbItem.episode_runtime);
          }
        }

        if (!fetchedItem.total_duration_seconds) {
          const duration = await tmdbApi.getItemDuration(fetchedItem.tmdb_id, fetchedItem.media_type);
          if (duration) {
            await updateTrackedItem(fetchedItem.id, { total_duration_seconds: duration });
            setItem({ ...fetchedItem, total_duration_seconds: duration });
          }
        }
      }
    } else {
      alert('Item not found');
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!item) return;

    setSaving(true);
    try {
      const timestampSeconds = hours * 3600 + minutes * 60 + seconds;

      const updates: Partial<TrackedItem> = {
        status,
        timestamp_seconds: timestampSeconds,
        notes,
        last_watched_date: new Date().toISOString(),
      };

      if (item.media_type === 'tv') {
        updates.current_season = Math.min(currentSeason, maxSeasons);
        updates.current_episode = Math.min(currentEpisode, maxEpisodesPerSeason);
      }

      await updateTrackedItem(item.id, updates);
      navigate('/');
    } catch (error) {
      alert('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this item?')) return;

    const success = await deleteTrackedItem(item.id);
    if (success) {
      navigate('/');
    } else {
      alert('Failed to delete item');
    }
  };

  const handleQuickUpdate = (secondsToAdd: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds + secondsToAdd;
    const newSeconds = Math.max(0, totalSeconds);
    
    setHours(Math.floor(newSeconds / 3600));
    setMinutes(Math.floor((newSeconds % 3600) / 60));
    setSeconds(newSeconds % 60);
  };

  const handleSliderChange = (value: number[]) => {
    const totalSeconds = value[0];
    setHours(Math.floor(totalSeconds / 3600));
    setMinutes(Math.floor((totalSeconds % 3600) / 60));
    setSeconds(totalSeconds % 60);
  }

  const handleHoursChange = (value: string) => {
    const num = parseInt(value) || 0;
    setHours(Math.max(0, Math.min(99, num)));
  };

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value) || 0;
    setMinutes(Math.max(0, Math.min(59, num)));
  };

  const handleSecondsChange = (value: string) => {
    const num = parseInt(value) || 0;
    setSeconds(Math.max(0, Math.min(59, num)));
  };

  const handleSeasonChange = (value: string) => {
    const num = parseInt(value) || 1;
    setCurrentSeason(Math.max(1, Math.min(maxSeasons, num)));
  };

  const handleEpisodeChange = (value: string) => {
    const num = parseInt(value) || 1;
    setCurrentEpisode(Math.max(1, Math.min(maxEpisodesPerSeason, num)));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-12 w-48"></div>
        <div className="skeleton h-96"></div>
      </div>
    );
  }

  if (!item) return null;

  const currentTimestamp = hours * 3600 + minutes * 60 + seconds;
  const maxDuration = item.total_duration_seconds || 7200;
  const progress = item.total_duration_seconds
    ? calculateProgress(currentTimestamp, item.total_duration_seconds)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      {/* Header Card */}
      <Card className="card-base border border-[hsl(var(--border))] overflow-hidden animate-slide-up">
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Poster */}
          <div className="relative aspect-[2/3] md:aspect-auto bg-[hsl(var(--accent))]">
            <img
              src={item.poster_url || ''}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Image';
              }}
            />
            <div className="absolute top-4 left-4">
              {item.media_type === 'movie' ? (
                <Film className="w-6 h-6 text-white drop-shadow-lg" />
              ) : (
                <Tv className="w-6 h-6 text-white drop-shadow-lg" />
              )}
            </div>
          </div>

          {/* Info */}
          <CardContent className="p-6 space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-3">{item.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge className={`badge-base status-${status}`}>
                  {formatStatus(status)}
                </Badge>
                <Badge className="badge-base bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))]">
                  {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </Badge>
                {tmdbRating && (
                  <Badge className="badge-base bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[hsl(var(--text-secondary))]" />
                    {tmdbRating.toFixed(1)} TMDB
                  </Badge>
                )}
              </div>
            </div>

            {item.last_watched_date && (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-muted))]">
                <Calendar className="w-4 h-4" />
                <span>Last watched {formatRelativeTime(item.last_watched_date)}</span>
              </div>
            )}

            {progress > 0 && (
              <div>
                <div className="flex justify-between text-sm text-[hsl(var(--text-secondary))] mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-[hsl(var(--accent))]" />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setStatus('watching')}
                size="sm"
                className={`btn-base ${
                  status === 'watching'
                    ? 'bg-[hsl(var(--info))] text-white hover:bg-[hsl(var(--info))]'
                    : 'bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-hover))]'
                }`}
              >
                <Play className="w-4 h-4 mr-1" />
                Watching
              </Button>
              <Button
                onClick={() => setStatus('completed')}
                size="sm"
                className={`btn-base ${
                  status === 'completed'
                    ? 'bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success))]'
                    : 'bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-hover))]'
                }`}
              >
                <Check className="w-4 h-4 mr-1" />
                Completed
              </Button>
              <Button
                onClick={() => setStatus('on-hold')}
                size="sm"
                className={`btn-base ${
                  status === 'on-hold'
                    ? 'bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]'
                    : 'bg-[hsl(var(--accent))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-hover))]'
                }`}
              >
                <Pause className="w-4 h-4 mr-1" />
                On Hold
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Progress Tracker */}
      <Card className="card-base border border-[hsl(var(--border))] animate-slide-up" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle className="text-[hsl(var(--text-primary))] flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Track Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {item.media_type === 'tv' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">
                    Season (Max: {maxSeasons})
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={maxSeasons}
                    value={currentSeason}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="input-base text-[hsl(var(--text-primary))]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">
                    Episode (Max: {maxEpisodesPerSeason})
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={maxEpisodesPerSeason}
                    value={currentEpisode}
                    onChange={(e) => handleEpisodeChange(e.target.value)}
                    className="input-base text-[hsl(var(--text-primary))]"
                  />
                </div>
              </div>
              {episodeDuration > 0 && (
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-muted))] bg-[hsl(var(--accent))] p-3 rounded-lg">
                  <Info className="w-4 h-4" />
                  <span>Average episode length: {formatTime(episodeDuration)}</span>
                </div>
              )}
            </>
          )}

          {/* Slider for timestamp */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">
              Current Timestamp (Slider)
            </label>
            <Slider
              value={[currentTimestamp]}
              onValueChange={handleSliderChange}
              max={maxDuration}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[hsl(var(--text-muted))]">
              <span>0:00</span>
              <span className="text-[hsl(var(--text-primary))]">{formatTime(currentTimestamp)}</span>
              <span>{formatTime(maxDuration)}</span>
            </div>
          </div>

          {/* Manual time inputs */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">
              Or Enter Manually
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[hsl(var(--text-muted))]">Hours</label>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  className="input-base text-[hsl(var(--text-primary))] text-center"
                  placeholder="00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[hsl(var(--text-muted))]">Minutes</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  className="input-base text-[hsl(var(--text-primary))] text-center"
                  placeholder="00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[hsl(var(--text-muted))]">Seconds</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => handleSecondsChange(e.target.value)}
                  className="input-base text-[hsl(var(--text-primary))] text-center"
                  placeholder="00"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleQuickUpdate(-30)}
                variant="outline"
                size="sm"
                className="btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
              >
                -30s
              </Button>
              <Button
                onClick={() => handleQuickUpdate(30)}
                variant="outline"
                size="sm"
                className="btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
              >
                +30s
              </Button>
              <Button
                onClick={() => handleQuickUpdate(-60)}
                variant="outline"
                size="sm"
                className="btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
              >
                -1min
              </Button>
              <Button
                onClick={() => handleQuickUpdate(60)}
                variant="outline"
                size="sm"
                className="btn-base border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
              >
                +1min
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as WatchStatus)}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Notes (Optional)</label>
            <Textarea
              placeholder="Add your thoughts, reminders, or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              className="input-base text-[hsl(var(--text-primary))] min-h-[100px]"
            />
            <p className="text-xs text-[hsl(var(--text-muted))]">{notes.length}/500 characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-base bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-[hsl(var(--text-primary))]"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Return
                </>
              )}
            </Button>
            <Button
              onClick={handleDelete}
              className="btn-base bg-[hsl(var(--error))] hover:bg-[hsl(var(--error))] text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};