import { createBrowserClient } from '@supabase/ssr';

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers || {});

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

