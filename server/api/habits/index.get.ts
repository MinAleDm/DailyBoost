import { listHabits } from '~~/server/utils/tracker-store'

export default defineEventHandler(async () => {
  const habits = await listHabits()

  return {
    habits
  }
})
