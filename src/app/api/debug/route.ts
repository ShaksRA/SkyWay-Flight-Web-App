import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check env vars exist
  if (!url || !key) {
    return NextResponse.json({
      status: 'error',
      problem: 'Missing environment variables',
      has_url: !!url,
      has_key: !!key,
    });
  }

  try {
    const supabase = createServerSupabaseClient();

    // Try a simple count query
    const { data, error, count } = await supabase
      .from('flights')
      .select('*', { count: 'exact' })
      .limit(3);

    if (error) {
      return NextResponse.json({
        status: 'error',
        problem: 'Supabase query failed',
        error_message: error.message,
        error_code: error.code,
        supabase_url: url?.substring(0, 30) + '...',
      });
    }

    return NextResponse.json({
      status: 'ok',
      flights_in_db: count,
      sample_flights: data?.map(f => ({
        flight_no: f.flight_no,
        origin: f.origin,
        destination: f.destination,
        departs_at: f.departs_at,
      })),
      supabase_url: url?.substring(0, 30) + '...',
    });

  } catch (err: unknown) {
    return NextResponse.json({
      status: 'error',
      problem: 'Unexpected error',
      error_message: err instanceof Error ? err.message : String(err),
    });
  }
}
