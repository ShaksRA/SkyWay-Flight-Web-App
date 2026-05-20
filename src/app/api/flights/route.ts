import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin      = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch ALL upcoming flights on this route
    // No date filtering here — we filter on the client by selected date
    const { data: flights, error } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', origin)
      .eq('destination', destination)
      .neq('status', 'cancelled')
      .gte('departs_at', new Date().toISOString()) // only future flights
      .order('departs_at', { ascending: true });

    if (error) {
      console.error('Supabase flights error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${flights?.length ?? 0} flights for ${origin}→${destination}`);

    return NextResponse.json({ flights: flights ?? [] });

  } catch (err) {
    console.error('Flights API unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
