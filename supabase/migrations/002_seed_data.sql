-- 002_seed_data.sql
-- Seed data for periods 16.01-22.01.2026 and 23.01-29.01.2026
-- Source: doc-data/Эпик_ Стабилизация звонков.html (verified)

-- Clean existing data (order matters due to FK constraints)
DELETE FROM period_statistics;
DELETE FROM tasks;
DELETE FROM periods;

-- ============================================================
-- PERIODS
-- ============================================================

INSERT INTO periods (id, start_date, end_date, created_at) VALUES
('a1b2c3d4-1111-4000-8000-000000000001', '2026-01-16', '2026-01-22', now()),
('a1b2c3d4-2222-4000-8000-000000000002', '2026-01-23', '2026-01-29', now());

-- ============================================================
-- TASKS — Period 1: Added to Backlog (16.01–22.01.2026)
-- Total: 18 tasks, 10 critical, 8 non-critical
-- ============================================================

INSERT INTO tasks (id, title, creation_period_id, active_period_id, priority, status, link, created_at) VALUES
-- Critical tasks (10)
(gen_random_uuid(), 'МП: В рисенте МП иногда зависает уже завершённый звонок',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'Завершена', 'http://jabber.bx/view.php?id=238245', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'МП: Шаринг пропадает у юзера МП в звонках на 2-х, при реконнекте шарящего',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'Завершена', 'http://jabber.bx/view.php?id=237983', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'callmobile: 0238343: Шаринг. При рекконекте заблокированного телефона не восстановится поток активного шаринга',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'Завершена', 'http://jabber.bx/view.php?id=238343', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'callmobile: 0238402: Веб+МП. При реконнекте с длительным разрывом peerConnect - реконнекта не происходит',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Критический', 'В работе', 'http://jabber.bx/view.php?id=238402', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'call: 0238434: PHP: При проблеме скачивания файлов облачной записи агентами - запись не придёт в чат',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'Завершена', 'http://jabber.bx/view.php?id=238434', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'Бек: callcontroller: 0235776: ОБЛАЧКА При паузе облачной записи - нет склейки записи до паузы и после паузы',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Критический', 'В работе', NULL, '2026-01-16'::timestamptz),

(gen_random_uuid(), 'callmobile: 238520: Проблемы с установлением соединения в звонке 1-1 между Android и iOS',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Критический', 'В работе', 'http://jabber.bx/view.php?id=238520', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'callmobile: 0238639: Android. 1на1. Если закрыть МП и ответить на звонок из заблокированного экрана - откроет рисент чатов',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Критический', 'В работе', 'http://jabber.bx/view.php?id=238639', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'call: 0238641: На Маке не работает автооткрытие PiP при смене фокуса в десктопе',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Критический', 'В работе', 'http://jabber.bx/view.php?id=238641', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'callmobile: 0238691: Отображается завершенный звонок в рисенте после отказа от звонка из заблокированного экрана',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Критический', 'В работе', 'http://jabber.bx/view.php?id=238691', '2026-01-16'::timestamptz),

-- Non-critical tasks (8)
(gen_random_uuid(), 'Не дизейблятся элементы контекстного меню при переключении между табами в списке звонков',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238223', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'Бек: Старая схема Wrong mediaserver response 404 Not Found при старте фоллоуапа',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238130', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'Медиа: При реконнекте юзера, временно пропадает карточка пользователя в звонке (participantLeft)',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238124', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'callmobile: 0238374: Follow-up. В 1на1 невозможно выключить анализ из МП',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Нормальный', 'Завершена', 'http://jabber.bx/view.php?id=238374', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'Медиа: ОБЛАЧКА Если текущий спикер вырубит камеру - на записи фокус перейдет на прошлого спикера',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238468', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'mobile.ios: 0238562: Звонки. 1на1. При быстром выкл-вкл камеры - у собеседника камера будет считаться выключенной',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238562', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'call: 0238580: Облачная запись пришла в чат несколько раз',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238580', '2026-01-16'::timestamptz),

(gen_random_uuid(), 'desktop: 238609: В звонке в десктопном приложении некорректно отображаются кнопки звонка',
 'a1b2c3d4-1111-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238609', '2026-01-16'::timestamptz);

-- ============================================================
-- TASKS — Period 2: Added to Backlog (23.01–29.01.2026)
-- Total: 8 tasks, 3 critical, 5 non-critical
-- ============================================================

INSERT INTO tasks (id, title, creation_period_id, active_period_id, priority, status, link, created_at) VALUES
-- Critical tasks (3)
(gen_random_uuid(), 'call: 0238792: В вебе у шаринга сбрасывает закрепление, если у шарящего юзера был рекконект',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'В работе', 'http://jabber.bx/view.php?id=238792', '2026-01-23'::timestamptz),

(gen_random_uuid(), 'call: 0238806: Не открывается чат активного звонка при его сворачивании (кнопка чат)',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'Завершена', 'http://jabber.bx/view.php?id=238806', '2026-01-23'::timestamptz),

(gen_random_uuid(), 'callmobile: 0238828: При реконнекте смены сети в 1-1, вместо аватарки собеседника - чёрный экран (пустой поток)',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Критический', 'Завершена', 'http://jabber.bx/view.php?id=238828', '2026-01-23'::timestamptz),

-- Non-critical tasks (5)
(gen_random_uuid(), 'DEV-media: 0238721: Не доходит сигнал recordingReady для облачной аудиозаписи на КК с медиасервера',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=238721', '2026-01-23'::timestamptz),

(gen_random_uuid(), 'callmobile: 0239053: 1на1. При быстрой отмене вызова в МП остается карточка звонка и будет бесконечное установление соединения',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=239053', '2026-01-23'::timestamptz),

(gen_random_uuid(), 'call: 0239038: 1на1. При отмене вызова отображается не соответствующий сценарию статус',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=239038', '2026-01-23'::timestamptz),

(gen_random_uuid(), 'call: 0239063: Подвисает уведомление о говорящем участнике после реконнектов',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=239063', '2026-01-23'::timestamptz),

(gen_random_uuid(), 'callcontroller: 0239102: Облачная запись - рассинхрон смены фокуса пользователя и аудиодорожки',
 'a1b2c3d4-2222-4000-8000-000000000002', 'a1b2c3d4-2222-4000-8000-000000000002',
 'Нормальный', 'В работе', 'http://jabber.bx/view.php?id=239102', '2026-01-23'::timestamptz);

-- ============================================================
-- PERIOD STATISTICS
-- Schema: period_id, added_to_backlog, added_critical, added_non_critical,
--         resolved_total, resolved_critical, resolved_non_critical,
--         in_progress, in_testing, in_block, wip_total,
--         total_problems_cumulative, completed_cumulative, uncompleted,
--         uncompleted_critical, uncompleted_non_critical, comment
-- ============================================================

INSERT INTO period_statistics (
  id, period_id,
  added_to_backlog, added_critical, added_non_critical,
  resolved_total, resolved_critical, resolved_non_critical,
  in_progress, in_testing, in_block, wip_total,
  total_problems_cumulative, completed_cumulative,
  uncompleted, uncompleted_critical, uncompleted_non_critical,
  comment, locked_at, created_at
) VALUES
-- Period 1: 16.01–22.01.2026
(
  gen_random_uuid(),
  'a1b2c3d4-1111-4000-8000-000000000001',
  18, 10, 8,       -- added: total, critical, non-critical
  7, 5, 2,         -- resolved: total, critical, non-critical
  16, 7, 0, 23,    -- WIP: in_progress, in_testing, in_block, wip_total
  107, 9,          -- cumulative: total_problems, completed
  98, 47, 51,      -- uncompleted: total, critical, non-critical
  'WIP превышает Done. Рост критических > решённых. Фокус следующей недели: снизить WIP, увеличить Done.',
  '2026-01-22T18:00:00+03:00'::timestamptz,
  '2026-01-22T18:00:00+03:00'::timestamptz
),
-- Period 2: 23.01–29.01.2026
(
  gen_random_uuid(),
  'a1b2c3d4-2222-4000-8000-000000000002',
  8, 3, 5,         -- added: total, critical, non-critical
  15, 10, 5,       -- resolved: total, critical, non-critical
  10, 8, 8, 18,    -- WIP: in_progress, in_testing, in_block, wip_total (wip = in_progress + in_testing)
  115, 24,         -- cumulative: total_problems, completed
  91, 40, 51,      -- uncompleted: total, critical, non-critical
  'Поток развернулся: скорость выполнения превысила входящий поток. Backlog и критические снизились. WIP стабилизировался.',
  '2026-01-29T18:00:00+03:00'::timestamptz,
  '2026-01-29T18:00:00+03:00'::timestamptz
);
