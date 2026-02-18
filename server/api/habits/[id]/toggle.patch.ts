import { toggleHabitRecord } from '~~/server/utils/tracker-store'

interface TogglePayload {
  date?: string
}

export default defineEventHandler(async (event) => {
  const habitId = getRouterParam(event, 'id')

  if (!habitId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Требуется id привычки'
    })
  }

  const body = await readBody<TogglePayload>(event)
  const habits = await toggleHabitRecord(habitId, body?.date)

  return {
    habits
  }
})
