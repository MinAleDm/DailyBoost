# DailyBoost

DailyBoost — современный трекер задач и привычек на Nuxt 4.

## Возможности
- Ежедневные и еженедельные привычки/задачи
- Отметка выполнения в один клик
- Статистика выполнения за неделю и месяц
- Тепловая карта активности за 4 недели
- Мотивационные уведомления в браузере
- Два режима данных:
  - `local` (по умолчанию): `localStorage`, работает на GitHub Pages
  - `server`: серверные API-эндпоинты Nuxt в `/api/habits`

## Стек
- Nuxt 4
- Vue 3 + Composition API
- Nitro API routes для серверного режима
- Чистый CSS (адаптив для desktop/mobile)

## Локальный запуск
```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
```

## Статическая генерация (GitHub Pages)
```bash
npm run generate
```

Для GitHub Pages держи `NUXT_PUBLIC_USE_SERVER_API=false`.

## Серверный API-режим
Чтобы принудительно включить серверный режим локально:

```bash
NUXT_PUBLIC_USE_SERVER_API=true npm run dev
```

Доступные эндпоинты:
- `GET /api/habits`
- `POST /api/habits`
- `PATCH /api/habits/:id/toggle`
- `DELETE /api/habits/:id`

## Деплой на GitHub Pages
Workflow уже настроен: `.github/workflows/pages.yml`.

Он автоматически определяет правильный `baseURL`:
- `/` для `<user>.github.io`
- `/<repo>/` для project pages

После этого выполняется статическая генерация и публикация `.output/public`.
