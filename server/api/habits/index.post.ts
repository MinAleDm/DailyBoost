import type { HabitCreateInput } from '~~/shared/types/tracker'
import { createHabitRecord } from '~~/server/utils/tracker-store'

function assertCreateInput(payload: Partial<HabitCreateInput>): HabitCreateInput {
  const title = `${payload.title || ''}`.trim()

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Название привычки обязательно'
    })
  }

  const frequency = payload.frequency === 'weekly' ? 'weekly' : 'daily'

  return {
    title,
    description: `${payload.description || ''}`.trim(),
    frequency,
    target: Math.max(1, Math.round(Number(payload.target) || 1)),
    unit: `${payload.unit || 'раз'}`.trim() || 'раз',
    color: `${payload.color || ''}`.trim()
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<HabitCreateInput>>(event)
  const input = assertCreateInput(body || {})

  const habits = await createHabitRecord(input)

  return {
    habits
  }
})
