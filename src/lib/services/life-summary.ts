import { safeAverage, safePercentage, safeSum } from '@/lib/calculations';
import type {
  BucketListItem,
  FinancialGoal,
  Goal,
  Habit,
  HealthEntry,
  Book,
  Course,
  Project,
} from '@/lib/types';

export interface LifeSummaryInput {
  goals: Goal[];
  habits: Habit[];
  financialGoals: FinancialGoal[];
  bucketListItems: BucketListItem[];
  healthEntries: HealthEntry[];
  books: Book[];
  courses: Course[];
  projects: Project[];
}

export function computeLifeSummary(input: LifeSummaryInput) {
  const travelScore = safePercentage(
    input.bucketListItems.filter((item) => item.status === 'visited').length,
    input.bucketListItems.length
  );

  const goalsScore = safePercentage(
    input.goals.filter((goal) => goal.status === 'completed').length,
    input.goals.length
  );

  const habitsScore = Math.round(safeAverage(input.habits.map((habit) => habit.successRate)));
  const projectsScore = Math.round(safeAverage(input.projects.map((project) => project.progress)));
  const healthScore = safePercentage(
    input.healthEntries.filter((entry) => entry.exercisedToday).length,
    input.healthEntries.length
  );

  const learningScore = Math.round(
    safeAverage([
      ...input.books.map((book) => book.progress),
      ...input.courses.map((course) => course.progress),
    ])
  );

  const financeScore = Math.round(
    safeAverage(
      input.financialGoals.map((goal) => safePercentage(goal.current, goal.target))
    )
  );

  const scores = {
    travel: travelScore,
    finance: financeScore,
    health: healthScore,
    learning: learningScore,
    goals: goalsScore,
    habits: habitsScore,
    projects: projectsScore,
  };

  return {
    scores,
    lifeScore: Math.round(safeAverage(Object.values(scores))),
    totals: {
      goals: input.goals.length,
      completedGoals: input.goals.filter((goal) => goal.status === 'completed').length,
      financeTarget: safeSum(input.financialGoals.map((goal) => goal.target)),
      financeCurrent: safeSum(input.financialGoals.map((goal) => goal.current)),
    },
  };
}

