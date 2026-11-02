import { NextRequest } from 'next/server';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { createClient as createServerCookieClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Creates an authenticated Supabase client for API route handlers.
 * Supports both Bearer token header (from client session) and SSR cookies,
 * ensuring PostgREST RLS policies always receive the authenticated JWT.
 */
export async function getAuthenticatedSupabase(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null;

  if (bearerToken) {
    const supabase = createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
    return { supabase, user: error ? null : user };
  }

  // Fallback to SSR cookies
  const cookieStore = cookies();
  const cookieSupabase = createServerCookieClient(cookieStore);
  const { data: { session } } = await cookieSupabase.auth.getSession();

  if (session?.access_token) {
    const supabase = createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
    return { supabase, user: session.user };
  }

  const { data: { user } } = await cookieSupabase.auth.getUser();
  return { supabase: cookieSupabase, user };
}

