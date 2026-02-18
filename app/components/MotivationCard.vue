<script setup lang="ts">
defineProps<{
  message: string
  pending: number
  notificationsSupported: boolean
  permission: NotificationPermission
}>()

const emit = defineEmits<{
  request: []
}>()
</script>

<template>
  <section class="panel-card motivation-card">
    <div class="section-head">
      <h2>Мотивация</h2>
      <p>Простые напоминания, чтобы держать темп.</p>
    </div>

    <p class="motivation-copy">{{ message }}</p>
    <p class="motivation-meta">Осталось на сегодня: {{ pending }}</p>

    <button
      v-if="notificationsSupported && permission === 'default'"
      class="secondary-btn"
      @click="emit('request')"
    >
      Включить уведомления в браузере
    </button>

    <p v-else-if="notificationsSupported && permission === 'granted'" class="support-note">
      Уведомления включены.
    </p>

    <p v-else class="support-note">
      Уведомления недоступны или заблокированы в браузере.
    </p>
  </section>
</template>
