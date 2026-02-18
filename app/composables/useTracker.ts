import type { Habit, HabitCreateInput } from '~~/shared/types/tracker'
import { calculateStats, createHabit, getDateKey, isHabitDueOnDate, normalizeState, toggleCompletion } from '~~/shared/utils/tracker'

type DataSource = 'local' | 'server'

const LOCAL_STORAGE_KEY = 'dailyboost.tracker.v1'

interface HabitsResponse {
  habits: Habit[]
}

function loadLocalHabits(): Habit[] {
  if (!import.meta.client) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return normalizeState(parsed).habits
  } catch {
    return []
  }
}

function saveLocalHabits(habits: Habit[]): void {
  if (!import.meta.client) {
    return
  }

  const state = normalizeState({
    habits,
    updatedAt: new Date().toISOString()
  })

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
}

export function useTracker() {
  const config = useRuntimeConfig()

  const habits = useState<Habit[]>('tracker-habits', () => [])
  const source = useState<DataSource>('tracker-source', () => 'local')
  const loading = useState<boolean>('tracker-loading', () => false)
  const ready = useState<boolean>('tracker-ready', () => false)
  const errorMessage = useState<string | null>('tracker-error-message', () => null)

  const stats = computed(() => calculateStats(habits.value))
  const todayKey = computed(() => getDateKey(new Date()))

  // Текущий прогресс дня для хедера и напоминаний.
  const todayProgress = computed(() => {
    const todayPoint = stats.value.dailySeries[stats.value.dailySeries.length - 1]

    return {
      expected: todayPoint?.expected || 0,
      completed: todayPoint?.completed || 0,
      pending: Math.max(0, (todayPoint?.expected || 0) - (todayPoint?.completed || 0))
    }
  })

  const useServerApi = computed(() => Boolean(config.public.useServerApi))

  async function pullFromServer() {
    const response = await $fetch<HabitsResponse>('/api/habits')
    habits.value = normalizeState({ habits: response.habits, updatedAt: new Date().toISOString() }).habits
  }

  async function init() {
    if (!import.meta.client || ready.value || loading.value) {
      return
    }

    loading.value = true
    errorMessage.value = null

    // Сначала пробуем серверный режим, затем мягко откатываемся в локальный режим.
    if (useServerApi.value) {
      try {
        await pullFromServer()
        source.value = 'server'
        ready.value = true
        loading.value = false
        return
      } catch {
        source.value = 'local'
      }
    }

    habits.value = loadLocalHabits()
    ready.value = true
    loading.value = false
  }

  async function addHabit(input: HabitCreateInput) {
    errorMessage.value = null

    if (source.value === 'server') {
      try {
        const response = await $fetch<HabitsResponse>('/api/habits', {
          method: 'POST',
          body: input
        })

        habits.value = response.habits
        return
      } catch {
        errorMessage.value = 'Сервер недоступен. Сохраняю локально.'
        source.value = 'local'
      }
    }

    habits.value = [createHabit(input), ...habits.value]
    saveLocalHabits(habits.value)
  }

  async function deleteHabit(habitId: string) {
    errorMessage.value = null

    if (source.value === 'server') {
      try {
        const response = await $fetch<HabitsResponse>(`/api/habits/${habitId}`, {
          method: 'DELETE'
        })

        habits.value = response.habits
        return
      } catch {
        errorMessage.value = 'Не удалось синхронизироваться с сервером. Удаляю локально.'
        source.value = 'local'
      }
    }

    habits.value = habits.value.filter((habit) => habit.id !== habitId)
    saveLocalHabits(habits.value)
  }

  async function toggleHabit(habitId: string, dateKey = todayKey.value) {
    errorMessage.value = null

    if (source.value === 'server') {
      try {
        const response = await $fetch<HabitsResponse>(`/api/habits/${habitId}/toggle`, {
          method: 'PATCH',
          body: {
            date: dateKey
          }
        })

        habits.value = response.habits
        return
      } catch {
        errorMessage.value = 'Не удалось синхронизироваться с сервером. Обновляю локально.'
        source.value = 'local'
      }
    }

    habits.value = habits.value.map((habit) => {
      if (habit.id !== habitId) {
        return habit
      }

      return toggleCompletion(habit, dateKey)
    })

    saveLocalHabits(habits.value)
  }

  const dueTodayHabits = computed(() => habits.value.filter((habit) => isHabitDueOnDate(habit, todayKey.value)))

  return {
    habits,
    stats,
    source,
    loading,
    ready,
    errorMessage,
    todayKey,
    todayProgress,
    dueTodayHabits,
    init,
    addHabit,
    deleteHabit,
    toggleHabit
  }
}
