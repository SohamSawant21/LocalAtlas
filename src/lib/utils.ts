import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getCrowdLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    VERY_LOW: 'Very Low Crowd',
    LOW: 'Low Crowd',
    MEDIUM: 'Medium Crowd',
    HIGH: 'High Crowd',
    VERY_HIGH: 'Very High Crowd',
  };
  return labels[level] || level;
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    EASY: 'text-secondary',
    MODERATE: 'text-surface-tint',
    HARD: 'text-tertiary',
    EXPERT: 'text-error',
  };
  return colors[difficulty] || 'text-on-surface-variant';
}
