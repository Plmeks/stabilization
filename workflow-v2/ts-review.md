# TS Review: Рефакторинг приложения управления задачами

**Date:** 2026-06-11
**Reviewer:** AI Agent
**Status:** APPROVED WITH COMMENTS

## Overall Assessment

Ревизия устраняет все блокирующие проблемы первого ревью. Приоритеты, миграция данных, семантика метрик и legacy-поля статистики согласованы с существующим проектом. Спецификация готова к передаче архитектору. Остаётся одно уточнение по UC-4 (сброс `completed_at`) — не блокирует архитектуру.

## Resolution of Previous Issues

| # | Issue | Status |
|---|-------|--------|
| 1 | Priority values unified to `'Авария'` | ✅ Resolved — UC-1, UC-2, UC-6, раздел 4 |
| 2 | Data migration `'Бэклог'` → `null` | ✅ Resolved — раздел 5, SQL + пояснение |
| 3 | Metrics calculation clarified | ✅ Resolved — UC-6 явно по `period_id`, не по date range |
| 4 | Full field reset for «Вернуть в QA» | ⚠️ Mostly resolved — см. Major #1 |
| 5 | «описание» field removed | ✅ Resolved — UC-2: только название и флаг |
| 6 | `metrics_locked_at` handling | ✅ Resolved — DROP в миграции, перенос в `locked_at` |

## Critical Issues (🔴 BLOCKING)

None.

## Major Issues (🟡 MAJOR)

### 1. UC-4: не указан сброс `completed_at`

**Location:** UC-4, шаг 2

**Problem:**
Для задач из таба «Выполненные» при возврате в QA необходимо обнулить `completed_at`. Текущий DAL это делает; в UC-4 поле не упомянуто. Без сброса останется неконсистентное состояние (`status = null`, `completed_at` заполнен).

**Recommendation:**
Добавить `completed_at = null` в список сбрасываемых полей UC-4 и в критерии приёмки.

## Minor Issues (🟢 MINOR)

### 1. Раздел 4: список приоритетов без `'Некритичный'`

**Location:** Раздел 4

**Recommendation:**
Добавить `'Некритичный'` в допустимые приоритеты (используется в `EditTaskModal` и CHECK constraint БД) или явно указать его удаление.

### 2. Противоречие разделов 6 и 7

**Location:** Разделы 6 и 7

**Recommendation:**
Перенести вопросы из раздела 7 в Open Questions или удалить раздел 7.

## Final Recommendation

**APPROVE WITH COMMENTS** — передавать архитектору. Дополнить UC-4 полем `completed_at` по желанию до или во время разработки.
