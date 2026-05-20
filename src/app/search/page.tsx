'use client';
import Navbar from '@/components/ui/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { useEffect } from 'react';

const AIRPORTS = [
  { code: 'BOM', label: 'Mumbai (BOM)' },
  { code: 'DEL', label: 'Delhi (DEL)' },
  { code: 'BLR', label: 'Bengaluru (BLR)' },
  { code: 'HYD', label: 'Hyderabad (HYD)' },
  { code: 'MAA', label: 'Chennai (MAA)' },
  { code: 'CCU', label: 'Kolkata (CCU)' },
  { code: 'SXR', label: 'Srinagar (SXR)' },
];

const QUICK_ROUTES = [
  { origin: 'BOM', destination: 'DEL', label: 'Mumbai → Delhi' },
  { origin: 'DEL', destination: 'BLR', label: 'Delhi → Bengaluru' },
  { origin: 'BOM', destination: 'MAA', label: 'Mumbai → Chennai' },
  { origin: 'HYD', destination: 'CCU', label: 'Hyderabad → Kolkata' },
];

export default function SearchPage() {
  const router = useRouter();
  const { setSearchQuery } = useFlightStore();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState('');

  const [showInstallBanner, setShowInstallBanner] = useState(false);
const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallBanner(true);
  };
  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);

async function handleInstall() {
  if (!deferredPrompt) return;
  // @ts-ignore
  deferredPrompt.prompt();
  // @ts-ignore
  await deferredPrompt.userChoice;
  setDeferredPrompt(null);
  setShowInstallBanner(false);
}

  function handleSearch() {
  if (!origin) { setError('Please select an origin airport.'); return; }
  if (!destination) { setError('Please select a destination airport.'); return; }
  if (origin === destination) { setError('Origin and destination cannot be the same.'); return; }
  setError('');
  // Pass date as-is — results page handles empty date gracefully
  setSearchQuery({ origin, destination, date, passengers });
  router.push('/results');
}

  function applyQuickRoute(o: string, d: string) {
    setOrigin(o);
    setDestination(d);
    setError('');
  }

  const inputStyle = {
    border: '1.5px solid #DDE5EE',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.92rem',
    outline: 'none',
    background: '#fff',
    width: '100%',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    fontSize: '0.72rem',
    fontWeight: 600 as const,
    color: '#5A6A78',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.6px',
    marginBottom: '5px',
    display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A3666 0%, #1A6DBF 60%, #0A7A8C 100%)' }}>

      <Navbar active="search" />

      <div style={{ padding: '4rem 1.5rem 6rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '0.5rem' }}>
          Discover the world from the sky
        </p>
        <h1 style={{
          color: '#fff',
          fontFamily: 'Georgia, serif',
          fontSize: '2.4rem',
          lineHeight: 1.2,
          marginBottom: '2rem',
        }}>
          Where are you<br />headed today?
        </h1>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        }}>
          {error && (
            <div style={{
              background: '#FDF0F0',
              border: '1px solid #f5c6cb',
              color: '#B83232',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.88rem',
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
            gap: '12px',
            alignItems: 'end',
          }}>
            <div>
              <label style={labelStyle}>From</label>
              <select value={origin} onChange={e => setOrigin(e.target.value)} style={inputStyle}>
                <option value="">Select origin</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>To</label>
              <select value={destination} onChange={e => setDestination(e.target.value)} style={inputStyle}>
                <option value="">Select destination</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Passengers</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} style={inputStyle}>
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              style={{
                background: '#0A4F8C',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '11px 28px',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              Search Flights
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>Popular:</span>
          {QUICK_ROUTES.map(r => (
            <button
              key={r.label}
              onClick={() => applyQuickRoute(r.origin, r.destination)}
              style={{
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.28)',
                color: '#fff',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {showInstallBanner && (
  <div style={{
    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    background: '#0A4F8C', color: '#fff', borderRadius: '12px',
    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 100, maxWidth: '380px', width: '90%',
  }}>
    <span style={{ fontSize: '1.5rem' }}>✈</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Install SkyWay</div>
      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Add to home screen for quick access</div>
    </div>
    <button onClick={handleInstall} style={{ background: '#fff', color: '#0A4F8C', border: 'none', borderRadius: '6px', padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', flexShrink: 0 }}>
      Install
    </button>
    <button onClick={() => setShowInstallBanner(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', lineHeight: 1 }}>
      ×
    </button>
  </div>
)}
    </div>
  );
}
