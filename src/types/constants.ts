export const TASK_STATUSES = ['В работе', 'В тесте', 'Завершена', 'Блокер'] as const;

export const PRIORITIES = ['Критический', 'Нормальный', 'Некритичный'] as const;

export const TAB_ROUTES = {
	qa: '/qa',
	current: '/current',
	completed: '/completed',
	stats: '/stats',
} as const;

export type TaskStatus = typeof TASK_STATUSES[number];
export type Priority = typeof PRIORITIES[number];

// Бейджи выводятся из фирменных токенов навбара (см. .tag-* в globals.css):
// danger (красный) · wip (синий) · warn (оранжевый) · success (зелёный) · neutral.
export const PRIORITY_COLORS: Record<Priority, string> = {
	'Критический': 'tag-danger',
	'Нормальный': 'tag-wip',
	'Некритичный': 'tag-neutral',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
	'В работе': 'tag-wip',
	'В тесте': 'tag-warn',
	'Завершена': 'tag-success',
	'Блокер': 'tag-danger',
};

// Статус null отображается как «Бэклог»: задача заведена, но ещё не взята в работу.
export const BACKLOG_STATUS_LABEL = 'Бэклог';
export const BACKLOG_STATUS_COLOR = 'tag-neutral';
// Select не принимает null как значение — используем sentinel (по аналогии с '__none__' для приоритета).
export const BACKLOG_SELECT_VALUE = '__backlog__';
