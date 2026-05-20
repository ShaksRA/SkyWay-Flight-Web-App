import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: result, error } = await supabase.rpc('cancel_booking', {
    p_booking_id: params.id,
    p_user_id: user.id,
  });

  if (error || !result?.success) {
    return NextResponse.json(
      { error: result?.error ?? error?.message ?? 'Cancellation failed' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
