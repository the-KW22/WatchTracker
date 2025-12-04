import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
}

export function calculateProgress(current: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 30) {
    return date.toLocaleDateString();
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMins > 0) {
    return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'watching':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'on-hold':
      return 'bg-yellow-500';
    case 'plan-to-watch':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

export function formatStatus(status: string): string {
  switch (status) {
    case 'watching':
      return 'Watching';
    case 'completed':
      return 'Completed';
    case 'on-hold':
      return 'On Hold';
    case 'plan-to-watch':
      return 'Plan to Watch';
    default:
      return status;
  }
}