# Data Migration Analysis

## Periods Found

| # | Period | Start Date | End Date |
|---|--------|------------|----------|
| 1 | 16.01 – 22.01.2026 | 2026-01-16 | 2026-01-22 |
| 2 | 23.01 – 29.01.2026 | 2026-01-23 | 2026-01-29 |

Note: HTML document contains many more periods (up to 29.05.2026), but the user specified focusing on first two.

## Tasks Extracted

### Period 1 — Added to Backlog (16.01–22.01): 18 tasks, 10 critical

| # | Title | Link | Priority |
|---|-------|------|----------|
| 1 | МП: В рисенте МП иногда зависает уже завершённый звонок | http://jabber.bx/view.php?id=238245 | Критический |
| 2 | Не дизейблятся элементы контекстного меню при переключении между табами в списке звонков | http://jabber.bx/view.php?id=238223 | Нормальный |
| 3 | Бек: Старая схема Wrong mediaserver response 404 Not Found при старте фоллоуапа | http://jabber.bx/view.php?id=238130 | Нормальный |
| 4 | Медиа: При реконнекте юзера, временно пропадает карточка пользователя в звонке (participantLeft) | http://jabber.bx/view.php?id=238124 | Нормальный |
| 5 | МП: Шаринг пропадает у юзера МП в звонках на 2-х, при реконнекте шарящего | http://jabber.bx/view.php?id=237983 | Критический |
| 6 | callmobile: 0238343: Шаринг. При рекконекте заблокированного телефона не восстановится поток активного шаринга | http://jabber.bx/view.php?id=238343 | Критический |
| 7 | callmobile: 0238374: Follow-up. В 1на1 невозможно выключить анализ из МП | http://jabber.bx/view.php?id=238374 | Нормальный |
| 8 | callmobile: 0238402: Веб+МП. При реконнекте с длительным разрывом peerConnect - реконнекта не происходит | http://jabber.bx/view.php?id=238402 | Критический |
| 9 | call: 0238434: PHP: При проблеме скачивания файлов облачной записи агентами - запись не придёт в чат | http://jabber.bx/view.php?id=238434 | Критический |
| 10 | Бек: callcontroller: 0235776: ОБЛАЧКА При паузе облачной записи - нет склейки записи до паузы и после паузы | N/A (inline) | Критический |
| 11 | Медиа: ОБЛАЧКА Если текущий спикер вырубит камеру - на записи фокус перейдет на прошлого спикера | http://jabber.bx/view.php?id=238468 | Нормальный |
| 12 | callmobile: 238520: Проблемы с установлением соединения в звонке 1-1 между Android и iOS | http://jabber.bx/view.php?id=238520 | Критический |
| 13 | mobile.ios: 0238562: Звонки. 1на1. При быстром "выкл-вкл" камеры - у собеседника камера будет считаться выключенной | http://jabber.bx/view.php?id=238562 | Нормальный |
| 14 | call: 0238580: Облачная запись пришла в чат несколько раз | http://jabber.bx/view.php?id=238580 | Нормальный |
| 15 | desktop: 238609: В звонке в десктопном приложение некорректно отображаются кнопки звонка | http://jabber.bx/view.php?id=238609 | Нормальный |
| 16 | callmobile: 0238639: Android. 1на1. Если закрыть МП и ответить на звонок из заблокированного экрана - откроет рисент чатов | http://jabber.bx/view.php?id=238639 | Критический |
| 17 | call: 0238641: На Маке не работает автооткрытие PiP при смене фокуса в десктопе | http://jabber.bx/view.php?id=238641 | Критический |
| 18 | callmobile: 0238691: Отображается завершенный звонок в рисенте после отказа от звонка из заблокированного экрана | http://jabber.bx/view.php?id=238691 | Критический |

### Period 2 — Added to Backlog (23.01–29.01): 8 tasks, 3 critical

| # | Title | Link | Priority |
|---|-------|------|----------|
| 1 | DEV-media: 0238721: Не доходит сигнал recordingReady для облачной аудиозаписи на КК с медиасервера | http://jabber.bx/view.php?id=238721 | Нормальный |
| 2 | call: 0238792: В вебе у шаринга сбрасывает закрепление, если у шарящего юзера был рекконект | http://jabber.bx/view.php?id=238792 | Критический |
| 3 | call: 0238806: Не открывается чат активного звонка при его сворачивании (кнопка "чат") | http://jabber.bx/view.php?id=238806 | Критический |
| 4 | callmobile: 0238828: При реконнекте смены сети в 1-1, вместо аватарки собеседника - чёрный экран (пустой поток) | http://jabber.bx/view.php?id=238828 | Критический |
| 5 | callmobile: 0239053: 1на1. При быстрой отмене вызова в МП остается карточка звонка | http://jabber.bx/view.php?id=239053 | Нормальный |
| 6 | call: 0239038: 1на1. При отмене вызова отображается не соответствующий сценарию статус | http://jabber.bx/view.php?id=239038 | Нормальный |
| 7 | call: 0239063: Подвисает уведомление о говорящем участнике после реконнектов | http://jabber.bx/view.php?id=239063 | Нормальный |
| 8 | callcontroller: 0239102: Облачная запись - рассинхрон смены фокуса пользователя и аудиодорожки | http://jabber.bx/view.php?id=239102 | Нормальный |

## Statistics Verification

### Period 1 (16.01–22.01.2026)

| Metric | User Provided | HTML Document | Match |
|--------|--------------|---------------|-------|
| Добавлено в бэклог | 18 | 18 | ✅ |
| Из них критических | 10 | 10 | ✅ |
| Решено всего | 7 | 7 | ✅ |
| Решено критических | 5 | 5 | ✅ |
| В работе | 16 | 16 | ✅ |
| В тесте | 7 | 7 | ✅ |
| В блоке | (not specified) | (not mentioned) | ✅ (0) |
| Всего проблем (cumulative) | 107 | 107 | ✅ |
| Выполнено | 9 | 9 | ✅ |
| Незавершённых | 98 | 98 | ✅ |
| Незавершённых критических | 47 | 47 | ✅ |
| Незавершённых некритических | 51 | 51 | ✅ |

**Derived values:**
- added_non_critical = 18 - 10 = 8 ✅ (HTML: "Некритические: 8")
- resolved_non_critical = 7 - 5 = 2 ✅ (HTML: "Некритические: 2")
- wip_total = 16 + 7 = 23 ✅ (HTML: "Work In Progress (23)")

### Period 2 (23.01–29.01.2026)

| Metric | User Provided | HTML Document | Match |
|--------|--------------|---------------|-------|
| Добавлено в бэклог | 8 | 8 | ✅ |
| Из них критических | 3 | 3 | ✅ |
| Решено всего | 15 | 15 | ✅ |
| Решено критических | 10 | 10 | ✅ |
| В работе | 10 | 10 | ✅ |
| В тесте | 8 | 8 | ✅ |
| В блоке | 8 | 8 | ✅ |
| Всего проблем (cumulative) | 115 | 115 | ✅ |
| Выполнено | 24 | 24 | ✅ |
| Незавершённых | 91 | 91 | ✅ |
| Незавершённых критических | 40 | 40 | ✅ |
| Незавершённых некритических | 51 | 51 | ✅ |

**Derived values:**
- added_non_critical = 8 - 3 = 5 ✅ (HTML: "Некритические: 5")
- resolved_non_critical = 15 - 10 = 5 ✅ (HTML: "Некритические: 5")
- wip_total = 10 + 8 = 18 ✅ (HTML: "Work In Progress (18)" — excludes "В блоке")

**All user-provided statistics match the HTML document exactly.**

## Chart Validation

HTML document includes the following charts for Period 1 and 2:

1. **CFD с линией WIP.png** (Period 1) — Shows cumulative flow with WIP line at 23
2. **cfd.png** (Period 2) — Shows flow reversal: resolution > incoming, backlog decreasing
3. **Monosnap ChatGPT 2026-01-29 18-15-21.png** — Critical task classification breakdown

Expected values from charts:
- Period 1: Total problems 107, Done 9, WIP 23 — matches statistics ✅
- Period 2: Total problems 115, Done 24, WIP 18 — matches statistics ✅
- Critical trend: 47 → 40 (decreasing) — matches ✅
- Non-critical: 51 → 51 (stable) — matches ✅
