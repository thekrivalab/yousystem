import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { computeLifeSummary } from '@/lib/services/life-summary';
import { safePercentage } from '@/lib/calculations';
import { getLocalDateString } from '@/lib/date';
import { syncAllHabitsDailyState, syncHabitDailyState } from '@/lib/habit-daily';
import { 
  Goal, GoalInput, Habit, FinancialGoal, Transaction, Book, Course, 
  Language, HealthEntry, Project, Memory, Relationship, 
  Achievement, AchievementInput, DreamItem, UserProfile, PlanningEvent, PersonalDocument, Movie
} from './types';
import { BucketListItem } from './types';

const emptyUser: UserProfile = {
  id: '',
  name: '',
  totalXp: 0,
  level: 1,
  lifeScore: 0,
  scores: {
    travel: 0,
    finance: 0,
    health: 0,
    learning: 0,
    goals: 0,
    habits: 0,
    projects: 0,
  },
};

interface LifeOSState {
  user: UserProfile;
  goals: Goal[];
  habits: Habit[];
  financialGoals: FinancialGoal[];
  transactions: Transaction[];
  books: Book[];
  courses: Course[];
  languages: Language[];
  healthEntries: HealthEntry[];
  projects: Project[];
  memories: Memory[];
  relationships: Relationship[];
  achievements: Achievement[];
  dreamItems: DreamItem[];
  bucketListItems: BucketListItem[];
  planningEvents: PlanningEvent[];
  documents: PersonalDocument[];
  movies: Movie[];

  // Actions
  addXp: (amount: number) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  recalculateLifeScore: () => void;
  
  // Goals Actions
  addGoal: (goal: GoalInput) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  updateGoalStatus: (id: string, status: Goal['status']) => void;

  // Habits Actions
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'completedToday' | 'successRate' | 'completionHistory' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (id: string) => void;
  refreshDailyHabits: () => void;

  // Finance Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addFinancialGoal: (fg: Omit<FinancialGoal, 'id'>) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  updateFinancialGoalProgress: (id: string, current: number) => void;

  // Learning Actions
  addBook: (book: Omit<Book, 'id' | 'progress'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  updateBookProgress: (id: string, progress: number) => void;
  addCourse: (course: Omit<Course, 'id' | 'progress' | 'hoursCompleted'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  updateCourseProgress: (id: string, hoursCompleted: number) => void;
  addLanguage: (lang: Omit<Language, 'id' | 'progress' | 'streak'>) => void;
  updateLanguage: (id: string, updates: Partial<Language>) => void;
  updateLanguageProgress: (id: string, progress: number) => void;

  // Health Actions
  addHealthEntry: (entry: Omit<HealthEntry, 'id' | 'date'>) => void;
  updateHealthEntry: (id: string, updates: Partial<HealthEntry>) => void;

  // Projects Actions
  addProject: (project: Omit<Project, 'id' | 'progress'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addProjectTask: (projectId: string, title: string) => void;

  // Memories Actions
  addMemory: (memory: Omit<Memory, 'id' | 'date'>) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;

  // Relationships Actions
  addRelationship: (rel: Omit<Relationship, 'id' | 'lastInteraction'>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  logInteraction: (id: string) => void;

  // Dream Board Actions
  addDreamItem: (item: Omit<DreamItem, 'id'>) => void;
  updateDreamItem: (id: string, updates: Partial<DreamItem>) => void;

  // Bucket List Actions
  addBucketListItem: (item: Omit<BucketListItem, 'id'>) => void;
  updateBucketListItem: (id: string, updates: Partial<BucketListItem>) => void;
  removeBucketListItem: (id: string) => void;

  // Planning Actions
  addPlanningEvent: (event: Omit<PlanningEvent, 'id' | 'completed'>) => void;
  updatePlanningEvent: (id: string, updates: Partial<PlanningEvent>) => void;
  togglePlanningEvent: (id: string) => void;

  // Documents Actions
  addDocument: (doc: Omit<PersonalDocument, 'id'>) => void;
  updateDocument: (id: string, updates: Partial<PersonalDocument>) => void;
  removeDocument: (id: string) => void;

  // Movies Actions
  addMovie: (movie: Omit<Movie, 'id'>) => void;
  updateMovie: (id: string, updates: Partial<Movie>) => void;
  removeMovie: (id: string) => void;

  // Achievements Actions
  addAchievement: (achievement: AchievementInput) => void;
  updateAchievement: (id: string, updates: Partial<Achievement>) => void;
  toggleAchievement: (id: string) => void;

  // Deletion Actions
  removeGoal: (id: string) => void;
  removeHabit: (id: string) => void;
  removeTransaction: (id: string) => void;
  removeFinancialGoal: (id: string) => void;
  removeBook: (id: string) => void;
  removeCourse: (id: string) => void;
  removeLanguage: (id: string) => void;
  removeHealthEntry: (id: string) => void;
  removeProject: (id: string) => void;
  removeMemory: (id: string) => void;
  removeRelationship: (id: string) => void;
  removeDreamItem: (id: string) => void;
  removePlanningEvent: (id: string) => void;
  removeAchievement: (id: string) => void;
}

export const useLifeOSStore = create<LifeOSState>()(
  persist(
    (set, get) => ({
      user: emptyUser,
      goals: [],
      habits: [],
      financialGoals: [],
      transactions: [],
      books: [],
      courses: [],
      languages: [],
      healthEntries: [],
      projects: [],
      memories: [],
      relationships: [],
      achievements: [],
      dreamItems: [],
      bucketListItems: [],
      planningEvents: [],
      documents: [],
      movies: [],

      addXp: (amount) => {
        set((state) => {
          const newXp = Math.max(0, state.user.totalXp + amount);
          // sqrt-based leveling: level = floor(sqrt(xp/50)) + 1
          const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;
          const prevLevel = state.user.level;

          // Dispatch browser events for UI feedback (non-React)
          if (typeof window !== 'undefined') {
            if (amount > 0) {
              window.dispatchEvent(new CustomEvent('xp-gained', { detail: amount }));
            }
            if (newLevel > prevLevel) {
              window.dispatchEvent(new CustomEvent('level-up', { detail: newLevel }));
            }
          }

          return {
            user: {
              ...state.user,
              totalXp: newXp,
              level: newLevel
            }
          };
        });
        get().recalculateLifeScore();
      },

      updateUser: (updates) => {
        set((state) => ({
          user: {
            ...state.user,
            ...updates,
          },
        }));
      },

      recalculateLifeScore: () => {
        set((state) => {
          const { scores, lifeScore } = computeLifeSummary({
            goals: state.goals,
            habits: state.habits,
            financialGoals: state.financialGoals,
            bucketListItems: state.bucketListItems,
            healthEntries: state.healthEntries,
            books: state.books,
            courses: state.courses,
            projects: state.projects,
          });

          return {
            user: {
              ...state.user,
              lifeScore,
              scores,
            }
          };
        });
      },

      // Goals Actions
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: `g_${Date.now()}`,
          createdAt: getLocalDateString()
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
        get().addXp(50);
        get().recalculateLifeScore();
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
        }));
        get().recalculateLifeScore();
      },

      updateGoalProgress: (id, progress) => {
        set((state) => ({
          goals: state.goals.map(g => 
            g.id === id 
              ? { ...g, progress, status: progress === 100 ? 'completed' : g.status } 
              : g
          )
        }));
        if (progress === 100) {
          get().addXp(200);
        }
        get().recalculateLifeScore();
      },

      updateGoalStatus: (id, status) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, status, progress: status === 'completed' ? 100 : g.progress } : g)
        }));
        if (status === 'completed') {
          get().addXp(200);
        }
        get().recalculateLifeScore();
      },

      // Habits Actions
      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: `h_${Date.now()}`,
          streak: 0,
          longestStreak: 0,
          completedToday: false,
          successRate: 0,
          completionHistory: [],
          createdAt: getLocalDateString()
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        get().addXp(30);
        get().recalculateLifeScore();
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
        }));
        get().recalculateLifeScore();
      },

      toggleHabit: (id) => {
        const todayStr = getLocalDateString();
        const previous = get().habits.find((h) => h.id === id);
        const wasCompleted = previous?.completionHistory?.includes(todayStr) ?? false;

        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;

            const history = new Set(h.completionHistory || []);
            if (wasCompleted) {
              history.delete(todayStr);
            } else {
              history.add(todayStr);
            }

            return syncHabitDailyState(
              { ...h, completionHistory: Array.from(history) },
              todayStr
            );
          }),
        }));

        const targetHabit = get().habits.find((h) => h.id === id);
        if (!wasCompleted && targetHabit?.completedToday) {
          get().addXp(targetHabit.xpPerCompletion);
        } else if (wasCompleted && targetHabit && !targetHabit.completedToday) {
          get().addXp(-targetHabit.xpPerCompletion);
        }
        get().recalculateLifeScore();
      },

      refreshDailyHabits: () => {
        set((state) => ({
          habits: syncAllHabitsDailyState(state.habits),
        }));
      },

      // Finance Actions
      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `t_${Date.now()}`,
          date: getLocalDateString()
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions]
        }));
        get().recalculateLifeScore();
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
        get().recalculateLifeScore();
      },

      addFinancialGoal: (fg) => {
        const newFg: FinancialGoal = {
          ...fg,
          id: `fg_${Date.now()}`
        };
        set((state) => ({ financialGoals: [...state.financialGoals, newFg] }));
        get().addXp(50);
        get().recalculateLifeScore();
      },

      updateFinancialGoal: (id, updates) => {
        set((state) => ({
          financialGoals: state.financialGoals.map(g => g.id === id ? { ...g, ...updates } : g)
        }));
        get().recalculateLifeScore();
      },

      updateFinancialGoalProgress: (id, current) => {
        set((state) => ({
          financialGoals: state.financialGoals.map(fg => fg.id === id ? { ...fg, current } : fg)
        }));
        get().recalculateLifeScore();
      },

      // Learning Actions
      addBook: (book) => {
        const newBook: Book = {
          ...book,
          id: `b_${Date.now()}`,
          progress: book.status === 'completed' ? 100 : 0
        };
        set((state) => ({ books: [...state.books, newBook] }));
        get().addXp(40);
        get().recalculateLifeScore();
      },

      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
        get().recalculateLifeScore();
      },

      updateBookProgress: (id, progress) => {
        set((state) => ({
          books: state.books.map(b => b.id === id ? { ...b, progress, status: progress === 100 ? 'completed' : b.status } : b)
        }));
        if (progress === 100) get().addXp(150);
        get().recalculateLifeScore();
      },

      addCourse: (course) => {
        const newCourse: Course = {
          ...course,
          id: `c_${Date.now()}`,
          progress: course.status === 'completed' ? 100 : 0,
          hoursCompleted: course.status === 'completed' ? course.hoursTotal : 0
        };
        set((state) => ({ courses: [...state.courses, newCourse] }));
        get().addXp(60);
        get().recalculateLifeScore();
      },

      updateCourse: (id, updates) => {
        set((state) => ({
          courses: state.courses.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
        get().recalculateLifeScore();
      },

      updateCourseProgress: (id, hoursCompleted) => {
        set((state) => ({
          courses: state.courses.map(c => {
            if (c.id === id) {
              const progress = safePercentage(hoursCompleted, c.hoursTotal);
              return {
                ...c,
                hoursCompleted,
                progress,
                status: progress === 100 ? 'completed' : c.status
              };
            }
            return c;
          })
        }));
        get().recalculateLifeScore();
      },

      addLanguage: (lang) => {
        const newLang: Language = {
          ...lang,
          id: `l_${Date.now()}`,
          progress: 0,
          streak: 0
        };
        set((state) => ({ languages: [...state.languages, newLang] }));
        get().addXp(50);
        get().recalculateLifeScore();
      },

      updateLanguage: (id, updates) => {
        set((state) => ({
          languages: state.languages.map(l => l.id === id ? { ...l, ...updates } : l)
        }));
        get().recalculateLifeScore();
      },

      updateLanguageProgress: (id, progress) => {
        set((state) => ({
          languages: state.languages.map(l => l.id === id ? { ...l, progress } : l)
        }));
        get().recalculateLifeScore();
      },

      // Health Actions
      addHealthEntry: (entry) => {
        const newEntry: HealthEntry = {
          ...entry,
          id: `he_${Date.now()}`,
          date: getLocalDateString()
        };
        set((state) => ({
          healthEntries: [newEntry, ...state.healthEntries]
        }));
        get().addXp(20);
        get().recalculateLifeScore();
      },
      updateHealthEntry: (id, updates) => {
        set((state) => ({
          healthEntries: state.healthEntries.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
        get().recalculateLifeScore();
      },

      // Projects Actions
      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: `p_${Date.now()}`,
          progress: 0
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        get().addXp(100);
        get().recalculateLifeScore();
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
        get().recalculateLifeScore();
      },

      toggleProjectTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map(p => {
            if (p.id === projectId) {
              const tasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
              const doneCount = tasks.filter(t => t.done).length;
              const progress = safePercentage(doneCount, tasks.length);
              return { ...p, tasks, progress };
            }
            return p;
          })
        }));
        get().recalculateLifeScore();
      },

      addProjectTask: (projectId, title) => {
        set((state) => ({
          projects: state.projects.map(p => {
            if (p.id === projectId) {
              const tasks = [...p.tasks, { id: `pt_${Date.now()}`, title, done: false }];
              const doneCount = tasks.filter(t => t.done).length;
              const progress = safePercentage(doneCount, tasks.length);
              return { ...p, tasks, progress };
            }
            return p;
          })
        }));
        get().recalculateLifeScore();
      },

      // Memories Actions
      addMemory: (memory) => {
        const newMemory: Memory = {
          ...memory,
          id: `m_${Date.now()}`,
          date: getLocalDateString()
        };
        set((state) => ({ memories: [newMemory, ...state.memories] }));
        get().addXp(30);
      },
      updateMemory: (id, updates) => {
        set((state) => ({
          memories: state.memories.map(m => m.id === id ? { ...m, ...updates } : m)
        }));
      },

      // Relationships Actions
      addRelationship: (rel) => {
        const newRel: Relationship = {
          ...rel,
          id: `r_${Date.now()}`,
          lastInteraction: getLocalDateString()
        };
        set((state) => ({ relationships: [...state.relationships, newRel] }));
        get().addXp(20);
      },
      updateRelationship: (id, updates) => {
        set((state) => ({
          relationships: state.relationships.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
      },

      logInteraction: (id) => {
        set((state) => ({
          relationships: state.relationships.map(r => r.id === id ? { ...r, lastInteraction: getLocalDateString() } : r)
        }));
        get().addXp(10);
      },

      // Dream Board Actions
      addDreamItem: (item) => {
        const newItem: DreamItem = {
          ...item,
          id: `d_${Date.now()}`
        };
        set((state) => ({ dreamItems: [...state.dreamItems, newItem] }));
      },
      updateDreamItem: (id, updates) => {
        set((state) => ({
          dreamItems: state.dreamItems.map(d => d.id === id ? { ...d, ...updates } : d)
        }));
      },

      // Bucket List Actions
      addBucketListItem: (item) => {
        const newItem: BucketListItem = {
          ...item,
          id: `bl_${Date.now()}`
        };
        set((state) => ({ bucketListItems: [...state.bucketListItems, newItem] }));
        get().addXp(10);
        get().recalculateLifeScore();
      },
      updateBucketListItem: (id, updates) => {
        set((state) => ({
          bucketListItems: state.bucketListItems.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
        get().recalculateLifeScore();
      },
      removeBucketListItem: (id) => {
        set((state) => ({
          bucketListItems: state.bucketListItems.filter(b => b.id !== id)
        }));
        get().recalculateLifeScore();
      },

      // Planning Actions
      addPlanningEvent: (event) => {
        const newEvent: PlanningEvent = {
          ...event,
          id: `pe_${Date.now()}`,
          completed: false
        };
        set((state) => ({ planningEvents: [...state.planningEvents, newEvent] }));
        get().addXp(15);
      },
      updatePlanningEvent: (id, updates) => {
        set((state) => ({
          planningEvents: state.planningEvents.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
      },

      togglePlanningEvent: (id) => {
        set((state) => ({
          planningEvents: state.planningEvents.map(e => e.id === id ? { ...e, completed: !e.completed } : e)
        }));
        const target = get().planningEvents.find(e => e.id === id);
        if (target?.completed) {
          get().addXp(20);
        }
      },

      // Documents Actions
      addDocument: (doc) => {
        const newDoc: PersonalDocument = {
          ...doc,
          id: `doc_${Date.now()}`
        };
        set((state) => ({ documents: [...state.documents, newDoc] }));
        get().addXp(25);
      },

      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d)
        }));
      },

      removeDocument: (id) => {
        set((state) => ({ documents: state.documents.filter(d => d.id !== id) }));
      },

      // Movies Actions
      addMovie: (movie) => {
        const newMovie: Movie = {
          ...movie,
          id: `mv_${Date.now()}`
        };
        set((state) => ({ movies: [...state.movies, newMovie] }));
        get().addXp(10);
      },

      updateMovie: (id, updates) => {
        set((state) => ({
          movies: state.movies.map(m => m.id === id ? { ...m, ...updates } : m)
        }));
      },

      removeMovie: (id) => {
        set((state) => ({ movies: state.movies.filter(m => m.id !== id) }));
      },

      // Achievements Actions
      addAchievement: (achievement) => {
        const newAchievement: Achievement = {
          ...achievement,
          id: `ach_${Date.now()}`,
          isUnlocked: false
        };
        set((state) => ({ achievements: [...state.achievements, newAchievement] }));
      },

      updateAchievement: (id, updates) => {
        set((state) => ({
          achievements: state.achievements.map(a => a.id === id ? { ...a, ...updates } : a)
        }));
      },

      toggleAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map(a => {
            if (a.id === id) {
              const isUnlocked = !a.isUnlocked;
              return { ...a, isUnlocked };
            }
            return a;
          })
        }));
        
        // Add or remove XP based on the toggle
        const target = get().achievements.find(a => a.id === id);
        if (target) {
          // If unlocked, grant XP. If locked (revoked), we subtract XP (or you could choose not to penalize).
          // We will subtract if unchecking to maintain balance.
          const xpAmount = target.isUnlocked ? target.xpReward : -target.xpReward;
          get().addXp(xpAmount);
        }
      },

      // Deletion Implementations
      removeGoal: (id) => { set(state => ({ goals: state.goals.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeHabit: (id) => { set(state => ({ habits: state.habits.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeTransaction: (id) => { set(state => ({ transactions: state.transactions.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeFinancialGoal: (id) => { set(state => ({ financialGoals: state.financialGoals.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeBook: (id) => { set(state => ({ books: state.books.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeCourse: (id) => { set(state => ({ courses: state.courses.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeLanguage: (id) => { set(state => ({ languages: state.languages.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeHealthEntry: (id) => { set(state => ({ healthEntries: state.healthEntries.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeProject: (id) => { set(state => ({ projects: state.projects.filter(x => x.id !== id) })); get().recalculateLifeScore(); },
      removeMemory: (id) => { set(state => ({ memories: state.memories.filter(x => x.id !== id) })) },
      removeRelationship: (id) => { set(state => ({ relationships: state.relationships.filter(x => x.id !== id) })) },
      removeDreamItem: (id) => { set(state => ({ dreamItems: state.dreamItems.filter(x => x.id !== id) })) },
      removePlanningEvent: (id) => { set(state => ({ planningEvents: state.planningEvents.filter(x => x.id !== id) })) },
      removeAchievement: (id) => { set(state => ({ achievements: state.achievements.filter(x => x.id !== id) })) },
    }),
    {
      name: 'life-os-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.habits = syncAllHabitsDailyState(state.habits);
        }
      },
      partialize: (state) => ({
        user: state.user,
        goals: state.goals,
        habits: state.habits,
        financialGoals: state.financialGoals,
        transactions: state.transactions,
        books: state.books,
        courses: state.courses,
        languages: state.languages,
        healthEntries: state.healthEntries,
        projects: state.projects,
        memories: state.memories,
        relationships: state.relationships,
        achievements: state.achievements,
        dreamItems: state.dreamItems,
        bucketListItems: state.bucketListItems,
        planningEvents: state.planningEvents,
        documents: state.documents,
        movies: state.movies,
      }),
    }
  )
);
