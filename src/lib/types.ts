// ─── GOALS ────────────────────────────────────────────────────────────────────
export const GOAL_TYPES = ['annual', 'quarterly', 'monthly', 'weekly', 'longterm'] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';

export const GOAL_CATEGORIES = [
  'health',
  'finance',
  'travel',
  'learning',
  'projects',
  'relationships',
  'personal',
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  deadline: string;
  progress: number; // 0–100
  priority: number; // 1–10
  status: GoalStatus;
  xpReward: number;
  createdAt: string;
}

export type GoalInput = Omit<Goal, 'id' | 'createdAt'>;

// ─── HABITS ───────────────────────────────────────────────────────────────────
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: string;
  frequency: HabitFrequency;
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  successRate: number; // 0–100
  color: string;
  xpPerCompletion: number;
  completionHistory: string[]; // ISO date strings
  createdAt: string;
}

// ─── FINANCE ──────────────────────────────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  color: string;
}

// ─── LEARNING ─────────────────────────────────────────────────────────────────
export type LearningStatus = 'active' | 'completed' | 'wishlist' | 'paused' | 'not_started' | 'in_progress';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: LearningStatus;
  progress: number; // 0–100
  rating?: number;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  platform: string;
  status: LearningStatus;
  progress: number;
  hoursTotal: number;
  hoursCompleted: number;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  flag: string;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'fluent';
  progress: number;
  dailyMinutes: number;
  streak: number;
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
export interface HealthEntry {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  waterLiters?: number;
  sleepHours?: number;
  exercisedToday: boolean;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export type ProjectStatus = 'idea' | 'active' | 'paused' | 'completed' | 'archived';

export interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: 'app' | 'startup' | 'side_project' | 'idea' | 'other';
  status: ProjectStatus;
  progress: number;
  tasks: ProjectTask[];
  tags: string[];
  startedAt?: string;
  deadline?: string;
}

// ─── MEMORIES ─────────────────────────────────────────────────────────────────
export type MemoryType = 'travel' | 'achievement' | 'event' | 'milestone' | 'photo';

export interface Memory {
  id: string;
  title: string;
  description: string;
  type: MemoryType;
  date: string;
  imageUrl?: string;
  location?: string;
  emotion: '😊' | '🥹' | '🎉' | '🌟' | '❤️' | '🔥';
  tags: string[];
}

// ─── RELATIONSHIPS ─────────────────────────────────────────────────────────────
export type RelationshipType = 'family' | 'friend' | 'partner' | 'colleague' | 'mentor';

export interface Relationship {
  id: string;
  name: string;
  type: RelationshipType;
  avatar?: string;
  birthday?: string;
  lastInteraction?: string;
  notes: string;
  importanceLevel: number; // 1–10
  contactFrequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export const ACHIEVEMENT_CATEGORIES = [
  'general',
  'health',
  'learning',
  'travel',
  'finance',
  'habits',
  'projects',
  'custom',
] as const;

export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  customCategory?: string; // free-form category name when category === 'custom'
  unlockedAt?: string;
  xpReward: number;
  isUnlocked: boolean;
}

export type AchievementInput = Omit<Achievement, 'id' | 'isUnlocked'>;

// ─── DREAM BOARD ──────────────────────────────────────────────────────────────
export type DreamItemType =
  | 'destination'
  | 'goal'
  | 'quote'
  | 'image'
  | 'object'
  | 'experience';

export interface DreamItem {
  id: string;
  type: DreamItemType;
  title: string;
  imageUrl?: string;
  quote?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  linkedGoalId?: string;
  color?: string;
  tags?: string[];
}

// ─── BUCKET LIST ──────────────────────────────────────────────────────────────
export type BucketListItemType = 'country' | 'city' | 'experience' | 'other';
export type BucketListStatus = 'none' | 'curious' | 'want_to_visit' | 'dream' | 'visited' | 'living';
export type BucketListCost = 'economic' | 'comfortable' | 'premium';

export interface BucketListItem {
  id: string;
  title: string;
  type: BucketListItemType;
  priority: number; // 1-10
  status: BucketListStatus;
  cost: BucketListCost;
  continent?: string;
}

// ─── XP & LEVEL ──────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  totalXp: number;
  level: number;
  lifeScore: number; // 0–100 weighted average
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  height?: number;   // cm
  sex?: 'male' | 'female' | 'other';
  scores: {
    travel: number;
    finance: number;
    health: number;
    learning: number;
    goals: number;
    habits: number;
    projects: number;
  };
}

// ─── PLANNING ─────────────────────────────────────────────────────────────────
export interface PlanningEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'event' | 'calendar' | 'weekly_review' | 'monthly_review' | 'annual_review' | 'roadmap';
  completed: boolean;
  notes?: string;
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export interface PersonalDocument {
  id: string;
  title: string;
  type: 'passport' | 'cnh' | 'rg' | 'certificate' | 'contract' | 'warranty' | 'other';
  number?: string;
  expiryDate?: string;
  notes?: string;
  fileUrl?: string;
  fileData?: string;  // base64 for PDF/image uploads
  fileName?: string;
}

// ─── DAILY ROUTINE ────────────────────────────────────────────────────────────
export type DayType = 'weekday' | 'saturday' | 'sunday';
export type RoutineCategory = string;

export interface RoutineBlock {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
  category: RoutineCategory;
  dayTypes: DayType[];
  durationMin: number;
}

export interface DailyLog {
  date: string;
  completedIds: string[];
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

// ─── MOVIES ───────────────────────────────────────────────────────────────────
export type MovieStatus = 'watchlist' | 'watching' | 'watched';

export interface Movie {
  id: string;
  title: string;
  year?: number;
  director?: string;
  posterUrl?: string;   // external URL or base64
  rating?: number;      // 0.5 to 5 (half-star support)
  status: MovieStatus;
  review?: string;
  genres: string[];
  watchedAt?: string;
  isFavorite?: boolean;
}
