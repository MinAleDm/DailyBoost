<script setup lang="ts">
import type { DailySeriesPoint } from '~~/shared/types/tracker'

const props = defineProps<{
  series: DailySeriesPoint[]
}>()

function intensity(point: DailySeriesPoint): string {
  if (!point.expected) {
    return 'i0'
  }

  const ratio = point.completed / point.expected

  if (ratio >= 1) {
    return 'i4'
  }

  if (ratio >= 0.66) {
    return 'i3'
  }

  if (ratio >= 0.33) {
    return 'i2'
  }

  return 'i1'
}

const rangeLabel = computed(() => {
  if (!props.series.length) {
    return 'Последние 4 недели'
  }

  const first = props.series[0]?.date
  const last = props.series[props.series.length - 1]?.date

  return `${first} — ${last}`
})
</script>

<template>
  <section class="panel-card">
    <div class="section-head">
      <h2>Дорожная карта за 4 недели</h2>
      <p>{{ rangeLabel }}</p>
    </div>

    <div class="heatmap-grid">
      <div
        v-for="point in series"
        :key="point.date"
        :class="['heat-cell', intensity(point)]"
        :title="`${point.date}: ${point.completed}/${point.expected}`"
      />
    </div>

    <div class="heat-legend">
      <span>Низко</span>
      <div class="legend-scale">
        <i class="heat-cell i1" />
        <i class="heat-cell i2" />
        <i class="heat-cell i3" />
        <i class="heat-cell i4" />
      </div>
      <span>Высоко</span>
    </div>
  </section>
</template>
