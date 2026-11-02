import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/supabase-api';

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedSupabase(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_paid, plan_tier')
      .eq('id', user.id)
      .maybeSingle();

    const newIsPaid = !(profile?.is_paid ?? false);
    const newTier = newIsPaid ? 'paid' : 'free';

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        is_paid: newIsPaid,
        plan_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      is_paid: newIsPaid,
      plan_tier: newTier,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
