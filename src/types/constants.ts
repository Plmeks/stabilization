export const TASK_STATUSES = ['Бэклог', 'В работе', 'В тесте', 'Завершена', 'Блокер'] as const;

export const PRIORITIES = ['Авария', 'Нормальный', 'Некритичный'] as const;

export const TAB_ROUTES = {
	qa: '/qa',
	current: '/current',
	completed: '/completed',
	stats: '/stats',
} as const;

export type TaskStatus = typeof TASK_STATUSES[number];
export type Priority = typeof PRIORITIES[number];

export const PRIORITY_COLORS: Record<Priority, string> = {
	'Авария': 'bg-red-100 text-red-800 border-red-200',
	'Нормальный': 'bg-blue-100 text-blue-800 border-blue-200',
	'Некритичный': 'bg-gray-100 text-gray-700 border-gray-200',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
	'Бэклог': 'bg-slate-100 text-slate-700 border-slate-200',
	'В работе': 'bg-yellow-100 text-yellow-800 border-yellow-200',
	'В тесте': 'bg-purple-100 text-purple-800 border-purple-200',
	'Завершена': 'bg-green-100 text-green-800 border-green-200',
	'Блокер': 'bg-red-100 text-red-800 border-red-200',
};
