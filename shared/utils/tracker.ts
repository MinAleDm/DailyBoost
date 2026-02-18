import type {
  DailySeriesPoint,
  Habit,
  HabitCreateInput,
  TrackerState,
  TrackerStats
} from '../types/tracker'

export const HABIT_COLORS = ['#ff5c3d', '#0f7173', '#2f6fed', '#e67e22', '#198754', '#b33951']

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

export function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function getDueWeekday(habit: Habit): number {
  return new Date(habit.createdAt).getDay()
}

export function isHabitDueOnDate(habit: Habit, dateKey: string): boolean {
  if (habit.frequency === 'daily') {
    return true
  }

  // Для weekly привычки "день выполнения" фиксируем по дате создания.
  return parseDateKey(dateKey).getDay() === getDueWeekday(habit)
}

export function createHabit(input: HabitCreateInput, now = new Date()): Habit {
  const title = input.title.trim()

  if (!title) {
    throw new Error('Название привычки обязательно')
  }

  const unit = input.unit.trim() || 'раз'
  const color = HABIT_COLORS.includes(input.color) ? input.color : HABIT_COLORS[0]

  return {
    id: crypto.randomUUID(),
    title,
    description: (input.description || '').trim(),
    frequency: input.frequency,
    target: Number.isFinite(input.target) ? Math.max(1, Math.round(input.target)) : 1,
    unit,
    color,
    createdAt: now.toISOString(),
    completions: []
  }
}

export function normalizeState(state: TrackerState | null | undefined): TrackerState {
  if (!state || !Array.isArray(state.habits)) {
    return {
      habits: [],
      updatedAt: new Date().toISOString()
    }
  }

  // Нормализуем данные из localStorage/API, чтобы избежать падений UI.
  return {
    habits: state.habits.map((habit) => ({
      ...habit,
      title: `${habit.title || ''}`.trim(),
      description: `${habit.description || ''}`.trim(),
      unit: `${habit.unit || 'раз'}`.trim() || 'раз',
      target: Math.max(1, Math.round(habit.target || 1)),
      color: HABIT_COLORS.includes(habit.color) ? habit.color : HABIT_COLORS[0],
      completions: Array.from(new Set((habit.completions || []).filter((entry) => DATE_KEY_RE.test(entry)))).sort()
    })),
    updatedAt: state.updatedAt || new Date().toISOString()
  }
}

export function toggleCompletion(habit: Habit, dateKey: string): Habit {
  if (!DATE_KEY_RE.test(dateKey)) {
    throw new Error('Неверный формат даты')
  }

  const completions = new Set(habit.completions)

  if (completions.has(dateKey)) {
    completions.delete(dateKey)
  } else {
    completions.add(dateKey)
  }

  return {
    ...habit,
    completions: Array.from(completions).sort()
  }
}

export function lastNDays(length: number, endDate = new Date()): string[] {
  const keys: string[] = []
  const cursor = new Date(endDate)
  cursor.setHours(12, 0, 0, 0)

  for (let offset = length - 1; offset >= 0; offset -= 1) {
    const date = new Date(cursor)
    date.setDate(cursor.getDate() - offset)
    keys.push(getDateKey(date))
  }

  return keys
}

function summarizeRange(habits: Habit[], dateKeys: string[]): { expected: number; completed: number } {
  let expected = 0
  let completed = 0

  for (const dateKey of dateKeys) {
    for (const habit of habits) {
      if (!isHabitDueOnDate(habit, dateKey)) {
        continue
      }

      expected += 1

      if (habit.completions.includes(dateKey)) {
        completed += 1
      }
    }
  }

  return { expected, completed }
}

function getActiveStreak(habits: Habit[], now = new Date()): number {
  const horizon = lastNDays(365, now)
  let streak = 0

  for (let index = horizon.length - 1; index >= 0; index -= 1) {
    const dateKey = horizon[index]
    const hasAnyCompletion = habits.some((habit) => habit.completions.includes(dateKey))

    if (!hasAnyCompletion) {
      break
    }

    streak += 1
  }

  return streak
}

function getTopHabit(habits: Habit[], monthKeys: string[]): Habit | null {
  if (!habits.length) {
    return null
  }

  const scored = habits
    .map((habit) => {
      const dueCount = monthKeys.filter((dateKey) => isHabitDueOnDate(habit, dateKey)).length
      const completedCount = monthKeys.filter((dateKey) => habit.completions.includes(dateKey)).length
      const ratio = dueCount === 0 ? 0 : completedCount / dueCount

      return {
        habit,
        completedCount,
        ratio
      }
    })
    .sort((left, right) => {
      if (right.ratio !== left.ratio) {
        return right.ratio - left.ratio
      }

      return right.completedCount - left.completedCount
    })

  return scored[0]?.habit || null
}

function roundPercent(value: number): number {
  return Math.round(value * 100)
}

export function calculateStats(habits: Habit[], now = new Date()): TrackerStats {
  const weekKeys = lastNDays(7, now)
  const monthKeys = lastNDays(30, now)
  const heatmapKeys = lastNDays(28, now)

  const week = summarizeRange(habits, weekKeys)
  const month = summarizeRange(habits, monthKeys)

  const dailySeries: DailySeriesPoint[] = heatmapKeys.map((dateKey) => {
    const point = summarizeRange(habits, [dateKey])

    return {
      date: dateKey,
      expected: point.expected,
      completed: point.completed
    }
  })

  // Сводка для карточек аналитики и тепловой карты.
  return {
    weekCompletionRate: week.expected === 0 ? 0 : roundPercent(week.completed / week.expected),
    monthCompletionRate: month.expected === 0 ? 0 : roundPercent(month.completed / month.expected),
    weekCompleted: week.completed,
    weekExpected: week.expected,
    monthCompleted: month.completed,
    monthExpected: month.expected,
    activeStreak: getActiveStreak(habits, now),
    topHabit: getTopHabit(habits, monthKeys),
    dailySeries
  }
}
