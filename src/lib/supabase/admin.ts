import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
