import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flight_id = searchParams.get('flight_id');

    if (!flight_id) {
      return NextResponse.json({ error: 'Missing flight_id' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: seats, error } = await supabase
      .from('seats')
      .select('*')
      .eq('flight_id', flight_id)
      .order('seat_number');

    if (error) {
      console.error('Supabase seats error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ seats: seats ?? [] });

  } catch (err) {
    console.error('Seats API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
