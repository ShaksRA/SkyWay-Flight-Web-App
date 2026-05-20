'use client';
import Navbar from '@/components/ui/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConfirmationData {
  pnr: string;
  flight: { flight_no: string; origin: string; destination: string; departs_at: string; arrives_at: string; aircraft_type: string };
  seat: { seat_number: string; class: string };
  passenger: { full_name: string; nationality: string };
  email: string;
  total: number;
  date: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [data, setData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('skyway_confirmation');
    if (!raw) { router.push('/search'); return; }
    setData(JSON.parse(raw));
  }, [router]);

  if (!data) return null;

  function formatTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }); }
    catch { return iso; }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA' }}>
      <Navbar />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#1A7A4A' }}>Booking Confirmed!</h2>
          <p style={{ color: '#5A6A78', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            A confirmation has been sent to {data.email}
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0A3666, #1A6DBF)', borderRadius: '12px', padding: '2rem', color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1px' }}>Booking Reference (PNR)</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '4px', margin: '0.5rem 0' }}>{data.pnr}</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>Keep this code safe for check-in</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '2px dashed #DDE5EE', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#5A6A78', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Boarding Pass</span>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: '#E6F7ED', color: '#1A7A4A' }}>CONFIRMED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem' }}>{data.flight.origin}</div>
              <div style={{ fontSize: '0.75rem', color: '#5A6A78' }}>{formatTime(data.flight.departs_at)}</div>
            </div>
            <div style={{ textAlign: 'center', color: '#5A6A78', fontSize: '0.8rem' }}>
              <div>──── ✈ ────</div>
              <div>Non-stop</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem' }}>{data.flight.destination}</div>
              <div style={{ fontSize: '0.75rem', color: '#5A6A78' }}>{formatTime(data.flight.arrives_at)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #DDE5EE' }}>
            {[
              { label: 'Flight',    val: data.flight.flight_no },
              { label: 'Seat',      val: data.seat.seat_number },
              { label: 'Class',     val: data.seat.class.charAt(0).toUpperCase() + data.seat.class.slice(1) },
              { label: 'Passenger', val: data.passenger.full_name },
              { label: 'Date',      val: data.date },
              { label: 'Total',     val: `₹${data.total.toLocaleString()}` },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#8A9BAA' }}>{f.label}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '2px' }}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={() => router.push('/search')} style={{ background: '#fff', border: '1.5px solid #0A4F8C', color: '#0A4F8C', borderRadius: '8px', padding: '10px 22px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
            Book Another Flight
          </button>
          <button onClick={() => router.push('/bookings')} style={{ background: '#0A4F8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
            View My Bookings
          </button>
        </div>

      </div>
    </div>
  );
}
