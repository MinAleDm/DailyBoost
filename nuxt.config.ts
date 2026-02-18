// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'DailyBoost',
      meta: [
        {
          name: 'description',
          content:
            'Трекер задач и привычек со статистикой за неделю и месяц, мотивационными напоминаниями и современным интерфейсом.'
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Sora:wght@500;600;700&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      useServerApi: process.env.NUXT_PUBLIC_USE_SERVER_API === 'true'
    }
  },
  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server'
  }
})
