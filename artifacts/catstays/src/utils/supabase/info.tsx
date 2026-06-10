export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] ?? '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
