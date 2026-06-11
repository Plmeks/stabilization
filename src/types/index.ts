export {
	TASK_STATUSES,
	PRIORITIES,
	TAB_ROUTES,
	PRIORITY_COLORS,
	STATUS_COLORS,
} from './constants';
export type { TaskStatus, Priority } from './constants';

import type { TaskStatus, Priority } from './constants';

export type Period = {
	id: string;
	start_date: string;
	end_date: string;
	created_at: string;
};

export type PeriodStatistics = {
	id: string;
	period_id: string;
	added_to_backlog: number;
	added_critical: number;
	resolved_total: number;
	resolved_critical: number;
	in_progress: number;
	in_testing: number;
	locked_at: string;
	created_at: string;
};

export type Task = {
	id: string;
	title: string;
	period_id: string;
	assignee: string | null;
	priority: Priority | null;
	status: TaskStatus | null;
	created_at: string;
	taken_into_work_at: string | null;
	completed_at: string | null;
	link: string | null;
};

export type CreatePeriodInput = {
	start_date: string;
	end_date: string;
};

export type CreateTaskInput = {
	title: string;
	period_id: string;
	priority?: Priority;
	link?: string | null;
};

export type UpdateTaskInput = {
	title?: string;
	assignee?: string;
	priority?: Priority | null;
	status?: TaskStatus;
	link?: string | null;
};

export type CompletionInput = {
	period_id: string;
};
