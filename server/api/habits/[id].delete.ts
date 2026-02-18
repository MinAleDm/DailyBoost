import { deleteHabitRecord } from '~~/server/utils/tracker-store'

export default defineEventHandler(async (event) => {
  const habitId = getRouterParam(event, 'id')

  if (!habitId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Требуется id привычки'
    })
  }

  const habits = await deleteHabitRecord(habitId)

  return {
    habits
  }
})
