<script setup lang="ts">
import type { HabitCreateInput } from '~~/shared/types/tracker'
import { HABIT_COLORS } from '~~/shared/utils/tracker'

const emit = defineEmits<{
  create: [payload: HabitCreateInput]
}>()

const form = reactive({
  title: '',
  description: '',
  frequency: 'daily' as const,
  target: 1,
  unit: 'раз',
  color: HABIT_COLORS[0]
})

function submit() {
  const title = form.title.trim()

  if (!title) {
    return
  }

  emit('create', {
    title,
    description: form.description,
    frequency: form.frequency,
    target: form.target,
    unit: form.unit,
    color: form.color
  })

  form.title = ''
  form.description = ''
  form.target = 1
}
</script>

<template>
  <section class="panel-card">
    <div class="section-head">
      <h2>Добавить привычку</h2>
      <p>Создай новую ежедневную или еженедельную цель.</p>
    </div>

    <form class="habit-form" @submit.prevent="submit">
      <label>
        Название привычки
        <input v-model="form.title" placeholder="Читать 30 минут" maxlength="80" required />
      </label>

      <label>
        Описание
        <textarea v-model="form.description" rows="2" placeholder="Необязательно" maxlength="160" />
      </label>

      <div class="inline-grid">
        <label>
          Частота
          <select v-model="form.frequency">
            <option value="daily">Каждый день</option>
            <option value="weekly">Раз в неделю</option>
          </select>
        </label>

        <label>
          Цель
          <input v-model.number="form.target" type="number" min="1" max="100" />
        </label>

        <label>
          Единица
          <input v-model="form.unit" placeholder="раз" maxlength="20" />
        </label>
      </div>

      <div class="color-picker-row">
        <span class="color-picker-label">Цвет</span>
        <div class="color-picker" role="radiogroup" aria-label="Выбор цвета привычки">
          <button
            v-for="color in HABIT_COLORS"
            :key="color"
            type="button"
            :aria-label="`Выбрать цвет ${color}`"
            :class="['color-dot', { selected: form.color === color }]"
            :style="{ backgroundColor: color }"
            @click="form.color = color"
          />
        </div>
      </div>

      <button type="submit" class="primary-btn">Добавить в трекер</button>
    </form>
  </section>
</template>
