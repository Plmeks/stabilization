import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
	public: {
		Tables: {
			periods: {
				Row: {
					id: string;
					start_date: string;
					end_date: string;
					created_at: string;
				};
			};
			period_statistics: {
				Row: {
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
			};
			tasks: {
				Row: {
					id: string;
					title: string;
					creation_period_id: string;
					active_period_id: string;
					assignee: string | null;
					priority: string | null;
					status: string | null;
					created_at: string;
					taken_into_work_at: string | null;
					completed_at: string | null;
				};
			};
		};
	};
};
