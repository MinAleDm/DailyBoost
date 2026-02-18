import type { HabitCreateInput, TrackerState } from '~~/shared/types/tracker'
import { createHabit, getDateKey, normalizeState, toggleCompletion } from '~~/shared/utils/tracker'

const STORAGE_KEY = 'tracker:state'

async function readState(): Promise<TrackerState> {
  const storage = useStorage('data')
  const raw = await storage.getItem<TrackerState>(STORAGE_KEY)
  return normalizeState(raw)
}

async function writeState(state: TrackerState): Promise<TrackerState> {
  const normalized = normalizeState(state)
  normalized.updatedAt = new Date().toISOString()

  const storage = useStorage('data')
  await storage.setItem(STORAGE_KEY, normalized)

  return normalized
}

export async function listHabits() {
  const state = await readState()
  return state.habits
}

export async function createHabitRecord(input: HabitCreateInput) {
  const state = await readState()
  const nextHabit = createHabit(input)
  const nextState = await writeState({
    habits: [nextHabit, ...state.habits],
    updatedAt: new Date().toISOString()
  })

  return nextState.habits
}

export async function deleteHabitRecord(habitId: string) {
  const state = await readState()
  const nextState = await writeState({
    habits: state.habits.filter((habit) => habit.id !== habitId),
    updatedAt: new Date().toISOString()
  })

  return nextState.habits
}

export async function toggleHabitRecord(habitId: string, date?: string) {
  const state = await readState()
  const dateKey = date || getDateKey(new Date())

  // Переключаем отметку выполнения за выбранный день.
  const nextState = await writeState({
    habits: state.habits.map((habit) => {
      if (habit.id !== habitId) {
        return habit
      }

      return toggleCompletion(habit, dateKey)
    }),
    updatedAt: new Date().toISOString()
  })

  return nextState.habits
}
