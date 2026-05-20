'use client';
import Navbar from '@/components/ui/Navbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';

interface Seat {
  id: string;
  seat_number: string;
  class: string;
  is_available: boolean;
  extra_fee: number;
  flight_id?: string; // ✅ add this
}

const COLS_FIRST = ['A', 'B', '', 'C', 'D'];
const COLS_REST  = ['A', 'B', 'C', '', 'D', 'E', 'F'];
const FIRST_ROWS    = [1, 2, 3];
const BUSINESS_ROWS = [4, 5, 6, 7, 8, 9];
const ECONOMY_ROWS  = Array.from({ length: 21 }, (_, i) => i + 10);

export default function SeatsPage() {
  const router = useRouter();
  const { selectedFlight, setSelectedSeat, setOptimisticSeat } = useFlightStore();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [selectedSeatObj, setSelectedSeatObj] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedFlight) { router.push('/search'); return; }
    fetch(`/api/seats?flight_id=${selectedFlight.id}`)
      .then(r => r.json())
      .then(data => { setSeats(data.seats || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedFlight, router]);

  function getSeat(row: number, col: string): Seat | undefined {
    return seats.find(s => s.seat_number === `${row}${col}`);
  }

  function handleSeatClick(seat: Seat) {
  if (!seat.is_available) return;
  setSelectedSeatId(seat.id);
  setSelectedSeatObj(seat);
  setOptimisticSeat(seat.id);
  setSelectedSeat({ ...seat, flight_id: selectedFlight!.id }); // ✅ add flight_id here
}

  function getSeatStyle(seat: Seat): React.CSSProperties {
    if (seat.id === selectedSeatId) {
      return { background: '#1A6DBF', borderColor: '#1A6DBF', color: '#fff', transform: 'scale(1.08)' };
    }
    if (!seat.is_available) {
      return { background: '#F5D5D5', borderColor: '#B83232', color: '#B83232', cursor: 'not-allowed', opacity: 0.7 };
    }
    return { background: '#D4EDDA', borderColor: '#1A7A4A', color: '#1A7A4A', cursor: 'pointer' };
  }

  const seatBase: React.CSSProperties = {
    width: '36px', height: '36px', borderRadius: '6px', border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.62rem', fontWeight: 600, flexShrink: 0, transition: 'all 0.15s',
    position: 'relative',
  };

  function renderSection(label: string, rows: number[], cols: string[]) {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#5A6A78', background: '#F4F7FA', padding: '3px 10px', borderRadius: '6px', marginBottom: '8px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {rows.map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '22px', fontSize: '0.72rem', color: '#8A9BAA', textAlign: 'right', flexShrink: 0 }}>{row}</span>
              {cols.map((col, idx) => {
                if (!col) return <div key={`aisle-${idx}`} style={{ width: '18px', flexShrink: 0 }} />;
                const seat = getSeat(row, col);
                if (!seat) return <div key={`${row}${col}`} style={{ width: '36px' }} />;
                return (
                  <div
                    key={seat.id}
                    style={{ ...seatBase, ...getSeatStyle(seat) }}
                    onClick={() => handleSeatClick(seat)}
                    title={`${seat.class}${seat.extra_fee > 0 ? ` · +₹${seat.extra_fee}` : ''}`}
                  >
                    {seat.seat_number}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedFlight) return null;

  const total = selectedFlight.base_price + (selectedSeatObj?.extra_fee || 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA' }}>
      <Navbar />

      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '2rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '1.5rem', boxShadow: '0 1px 6px rgba(10,79,140,0.07)' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE5EE' }}>
            Select Your Seat
          </h3>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { label: 'Available', bg: '#D4EDDA', border: '#1A7A4A' },
              { label: 'Occupied',  bg: '#F5D5D5', border: '#B83232' },
              { label: 'Selected',  bg: '#1A6DBF', border: '#1A6DBF' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#5A6A78' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: l.bg, border: `2px solid ${l.border}` }} />
                {l.label}
              </div>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#5A6A78', padding: '2rem' }}>Loading seat map...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {renderSection('First Class', FIRST_ROWS, COLS_FIRST)}
              {renderSection('Business Class', BUSINESS_ROWS, COLS_REST)}
              {renderSection('Economy', ECONOMY_ROWS, COLS_REST)}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '1.5rem', boxShadow: '0 1px 6px rgba(10,79,140,0.07)' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE5EE' }}>
            Flight Summary
          </h3>
          {[
            { label: 'Flight',    val: selectedFlight.flight_no },
            { label: 'Route',     val: `${selectedFlight.origin} → ${selectedFlight.destination}` },
            { label: 'Aircraft',  val: selectedFlight.aircraft_type },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DDE5EE', fontSize: '0.9rem' }}>
              <span style={{ color: '#5A6A78' }}>{r.label}</span>
              <span style={{ fontWeight: 600 }}>{r.val}</span>
            </div>
          ))}

          {selectedSeatObj && (
            <div style={{ marginTop: '1rem', padding: '12px', background: '#E8F2FC', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: '#5A6A78' }}>Selected Seat</div>
              <div style={{ fontWeight: 700, color: '#0A4F8C', fontSize: '1.1rem' }}>Seat {selectedSeatObj.seat_number}</div>
              <div style={{ fontSize: '0.75rem', color: '#5A6A78' }}>{selectedSeatObj.class.charAt(0).toUpperCase() + selectedSeatObj.class.slice(1)} Class</div>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DDE5EE', fontSize: '0.9rem' }}>
              <span style={{ color: '#5A6A78' }}>Base Fare</span>
              <span style={{ fontWeight: 600 }}>₹{selectedFlight.base_price.toLocaleString()}</span>
            </div>
            {selectedSeatObj && selectedSeatObj.extra_fee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DDE5EE', fontSize: '0.9rem' }}>
                <span style={{ color: '#5A6A78' }}>Seat Fee</span>
                <span style={{ fontWeight: 600 }}>₹{selectedSeatObj.extra_fee.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '1rem', borderTop: '2px solid #DDE5EE', marginTop: '4px' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: '#C8922A', fontSize: '1.1rem' }}>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => { if (selectedSeatObj) router.push('/booking'); }}
            disabled={!selectedSeatObj}
            style={{
              width: '100%', marginTop: '1rem', background: selectedSeatObj ? '#0A4F8C' : '#ccc',
              color: '#fff', border: 'none', borderRadius: '8px', padding: '12px',
              fontWeight: 600, cursor: selectedSeatObj ? 'pointer' : 'not-allowed',
              fontSize: '0.88rem', fontFamily: 'inherit',
            }}
          >
            {selectedSeatObj ? 'Continue to Passenger Details' : 'Select a Seat First'}
          </button>
        </div>
      </div>
    </div>
  );
}
