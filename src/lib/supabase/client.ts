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
					metrics_snapshot: Record<string, number> | null;
					metrics_locked_at: string | null;
					created_at: string;
				};
			};
			tasks: {
				Row: {
					id: string;
					title: string;
					period_id: string;
					assignee: string | null;
					priority: string | null;
					status: string;
					created_at: string;
					taken_into_work_at: string | null;
					completed_at: string | null;
				};
			};
		};
	};
};
