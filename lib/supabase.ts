import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Keep the unified client for simple client-side usage
export const supabase = createClient();

export type Profile = {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  full_name?: string;
};

export type GymMember = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plan?: string;
  status: "Active" | "Expiring Soon" | "Expired";
  expiry_date?: string;
  created_at?: string;
  created_by?: string;
};
