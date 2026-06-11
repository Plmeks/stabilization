export {
	TASK_STATUSES,
	PRIORITIES,
	TAB_ROUTES,
	PRIORITY_COLORS,
	STATUS_COLORS,
} from './constants';
export type { TaskStatus, Priority } from './constants';

import type { TaskStatus, Priority } from './constants';

export type MetricsSnapshot = {
	in_progress: number;
	in_testing: number;
};

export type Period = {
	id: string;
	start_date: string;
	end_date: string;
	metrics_snapshot: MetricsSnapshot | null;
	metrics_locked_at: string | null;
	created_at: string;
};

export type Task = {
	id: string;
	title: string;
	period_id: string;
	assignee: string | null;
	priority: Priority | null;
	status: TaskStatus;
	created_at: string;
	taken_into_work_at: string | null;
	completed_at: string | null;
};

export type CreatePeriodInput = {
	start_date: string;
	end_date: string;
};

export type CreateTaskInput = {
	title: string;
	period_id: string;
};

export type TakeIntoWorkInput = {
	assignee?: string;
	priority?: Priority;
	status?: TaskStatus;
};

export type UpdateTaskInput = {
	assignee?: string;
	priority?: Priority | null;
	status?: TaskStatus;
};

export type CompletionInput = {
	period_id: string;
};
