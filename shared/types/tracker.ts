export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  title: string
  description: string
  frequency: HabitFrequency
  target: number
  unit: string
  color: string
  createdAt: string
  completions: string[]
}

export interface HabitCreateInput {
  title: string
  description?: string
  frequency: HabitFrequency
  target: number
  unit: string
  color: string
}

export interface TrackerState {
  habits: Habit[]
  updatedAt: string
}

export interface DailySeriesPoint {
  date: string
  expected: number
  completed: number
}

export interface TrackerStats {
  weekCompletionRate: number
  monthCompletionRate: number
  weekCompleted: number
  weekExpected: number
  monthCompleted: number
  monthExpected: number
  activeStreak: number
  topHabit: Habit | null
  dailySeries: DailySeriesPoint[]
}
