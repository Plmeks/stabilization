# Отчёт: Миграция на pnpm

## Статус
✅ Миграция завершена успешно

## Внесённые изменения

### Удалённые файлы
- `package-lock.json` — удалён (заменён pnpm-lock.yaml)

### Новые файлы
- `pnpm-lock.yaml` — lockfile pnpm (637 пакетов)
- `pnpm-workspace.yaml` — конфигурация pnpm workspace (создан автоматически при `pnpm install`; одобрены build-скрипты для `sharp` и `unrs-resolver`)

### Изменённые файлы
- `README.md` — заменены все упоминания npm на pnpm:
  - `npm install` → `pnpm install`
  - `npm run dev` → `pnpm dev`
  - `npm run build` → `pnpm build`
  - `npm run start` → `pnpm start`
  - `npm run lint` → `pnpm lint`
  - В Prerequisites добавлено: `pnpm (npm install -g pnpm)`
  - Таблица "Available Scripts" обновлена
- `.gitignore` — добавлена строка `!pnpm-lock.yaml` (whitelist)

## Результат сборки

```
pnpm build → ✅ SUCCESS

▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 1784ms
✓ Generating static pages (8/8)

Routes: /, /_not-found, /completed, /current, /qa, /stats
```

## Примечания
- Все зависимости из `package.json` сохранены без изменений
- pnpm версия: 11.5.3
