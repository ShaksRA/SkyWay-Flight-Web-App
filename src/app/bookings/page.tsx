'use client';
import Navbar from '@/components/ui/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Flight {
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  base_price: number;
}

interface BookingRecord {
  pnr: string;
  flight: Flight;
  seat: { seat_number: string; class: string; extra_fee: number };
  passenger: { full_name: string; nationality: string };
  email: string;
  total: number;
  date: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  bookedAt: string;
}

interface AltFlight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  base_price: number;
}

const AIRPORT_NAMES: Record<string, string> = {
  BOM: 'Mumbai', DEL: 'Delhi', BLR: 'Bengaluru',
  HYD: 'Hyderabad', MAA: 'Chennai', CCU: 'Kolkata', SXR: 'Srinagar',
};

type ModalType = 'cancel' | 'reschedule' | null;

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [targetPnr, setTargetPnr] = useState<string | null>(null);
  const [altFlights, setAltFlights] = useState<AltFlight[]>([]);
  const [selectedAlt, setSelectedAlt] = useState<AltFlight | null>(null);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [rescheduleFee, setRescheduleFee] = useState(0);
  const [detailsBooking, setDetailsBooking] = useState<BookingRecord | null>(null);

  useEffect(() => { loadBookings(); }, []);

  function loadBookings() {
    try {
      const raw = localStorage.getItem('skyway_bookings');
      const list: BookingRecord[] = raw ? JSON.parse(raw) : [];
      const latest = sessionStorage.getItem('skyway_confirmation');
      if (latest) {
        const parsed = JSON.parse(latest);
        if (!list.find(b => b.pnr === parsed.pnr)) {
          list.unshift({ ...parsed, status: 'confirmed', bookedAt: new Date().toISOString() });
          localStorage.setItem('skyway_bookings', JSON.stringify(list));
          sessionStorage.removeItem('skyway_confirmation');
        }
      }
      setBookings(list);
    } catch { setBookings([]); }
  }

  function saveBookings(updated: BookingRecord[]) {
    setBookings(updated);
    localStorage.setItem('skyway_bookings', JSON.stringify(updated));
  }

  function isWithin2Hours(booking: BookingRecord): boolean {
    try {
      const departs = new Date(booking.flight.departs_at);
      const now = new Date();
      const diffHours = (departs.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours < 2;
    } catch { return false; }
  }

  function promptCancel(pnr: string) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) return;
    if (isWithin2Hours(booking)) {
      alert('❌ Cancellations are not allowed within 2 hours of departure. This is enforced at the database level.');
      return;
    }
    setTargetPnr(pnr);
    setModalType('cancel');
  }

  function confirmCancel() {
    if (!targetPnr) return;
    const updated = bookings.map(b =>
      b.pnr === targetPnr ? { ...b, status: 'cancelled' as const } : b
    );
    saveBookings(updated);
    closeModal();
  }

  async function promptReschedule(pnr: string) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (!booking) return;
    setTargetPnr(pnr);
    setSelectedAlt(null);
    setRescheduleFee(0);
    setModalType('reschedule');
    setLoadingAlts(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const searchDate = booking.date || tomorrow.toISOString().split('T')[0];
      const res = await fetch(
        `/api/flights?origin=${booking.flight.origin}&destination=${booking.flight.destination}&date=${searchDate}`
      );
      const data = await res.json();
      const alts = (data.flights || []).filter(
        (f: AltFlight) => f.flight_no !== booking.flight.flight_no
      );
      setAltFlights(alts);
    } catch {
      setAltFlights([]);
    }
    setLoadingAlts(false);
  }

  function selectAltFlight(alt: AltFlight) {
    setSelectedAlt(alt);
    const booking = bookings.find(b => b.pnr === targetPnr);
    if (booking) {
      const fee = Math.max(0, alt.base_price - booking.flight.base_price);
      setRescheduleFee(fee);
    }
  }

  function confirmReschedule() {
    if (!targetPnr || !selectedAlt) return;
    const updated = bookings.map(b => {
      if (b.pnr !== targetPnr) return b;
      return {
        ...b,
        flight: { ...selectedAlt, base_price: selectedAlt.base_price },
        status: 'rescheduled' as const,
        total: b.total + rescheduleFee,
        date: selectedAlt.departs_at.split('T')[0],
      };
    });
    saveBookings(updated);
    closeModal();
  }

  function closeModal() {
    setModalType(null);
    setTargetPnr(null);
    setSelectedAlt(null);
    setAltFlights([]);
    setRescheduleFee(0);
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return iso; }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    confirmed:   { bg: '#E6F7ED', color: '#1A7A4A' },
    cancelled:   { bg: '#FDF0F0', color: '#B83232' },
    rescheduled: { bg: '#E8F2FC', color: '#0A4F8C' },
  };

  const targetBooking = bookings.find(b => b.pnr === targetPnr);

  const btnBase: React.CSSProperties = {
    borderRadius: '8px', padding: '9px 20px', cursor: 'pointer',
    fontWeight: 600, fontFamily: 'inherit', fontSize: '0.88rem', border: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA' }}>

      {/* ── CANCEL MODAL ── */}
      {modalType === 'cancel' && targetBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 16px 60px rgba(0,0,0,0.22)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Cancel Booking</h3>
            <p style={{ color: '#5A6A78', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              You are about to cancel booking <strong style={{ color: '#0A4F8C' }}>{targetBooking.pnr}</strong>
            </p>
            <div style={{ background: '#FDF0F0', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#B83232', marginBottom: '1.5rem' }}>
              ⚠️ This action cannot be undone. Refunds take 7–10 business days.
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ ...btnBase, background: '#fff', border: '1.5px solid #0A4F8C', color: '#0A4F8C' }}>
                Keep Booking
              </button>
              <button onClick={confirmCancel} style={{ ...btnBase, background: '#B83232', color: '#fff' }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESCHEDULE MODAL ── */}
      {modalType === 'reschedule' && targetBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 16px 60px rgba(0,0,0,0.22)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Reschedule Flight</h3>
            <p style={{ color: '#5A6A78', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Current: <strong>{targetBooking.flight.flight_no}</strong> at {formatTime(targetBooking.flight.departs_at)}
            </p>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5A6A78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              Available alternative flights:
            </p>
            {loadingAlts && (
              <p style={{ color: '#5A6A78', fontSize: '0.88rem', padding: '1rem 0' }}>Loading flights...</p>
            )}
            {!loadingAlts && altFlights.length === 0 && (
              <div style={{ background: '#F4F7FA', borderRadius: '8px', padding: '1rem', fontSize: '0.88rem', color: '#5A6A78', marginBottom: '1rem' }}>
                No alternative flights available on this route right now.
              </div>
            )}
            {altFlights.map(alt => {
              const fee = Math.max(0, alt.base_price - targetBooking.flight.base_price);
              const isSelected = selectedAlt?.flight_no === alt.flight_no;
              return (
                <div
                  key={alt.flight_no}
                  onClick={() => selectAltFlight(alt)}
                  style={{
                    border: `1.5px solid ${isSelected ? '#0A4F8C' : '#DDE5EE'}`,
                    background: isSelected ? '#E8F2FC' : '#fff',
                    borderRadius: '8px', padding: '12px 16px', cursor: 'pointer',
                    marginBottom: '8px', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0A4F8C' }}>{alt.flight_no}</div>
                      <div style={{ fontSize: '0.8rem', color: '#5A6A78', marginTop: '2px' }}>
                        {formatTime(alt.departs_at)} → {formatTime(alt.arrives_at)} · {alt.aircraft_type}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0A4F8C' }}>₹{alt.base_price.toLocaleString()}</div>
                      {fee > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#9A6800', background: '#FEF8E7', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                          +₹{fee.toLocaleString()} fee
                        </div>
                      )}
                      {fee === 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#1A7A4A', background: '#E6F7ED', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                          No extra fee
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {selectedAlt && (
              <div style={{ background: '#E8F2FC', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#0A4F8C', margin: '1rem 0' }}>
                {rescheduleFee > 0
                  ? `A fee of ₹${rescheduleFee.toLocaleString()} will be charged for the price difference.`
                  : '✓ No additional fee for this flight.'}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={closeModal} style={{ ...btnBase, background: '#fff', border: '1.5px solid #0A4F8C', color: '#0A4F8C' }}>
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!selectedAlt}
                style={{ ...btnBase, background: selectedAlt ? '#0A4F8C' : '#ccc', color: '#fff', cursor: selectedAlt ? 'pointer' : 'not-allowed' }}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ── */}
      {detailsBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 16px 60px rgba(0,0,0,0.22)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1.25rem' }}>Booking Details</h3>
            {[
              { label: 'PNR',        val: detailsBooking.pnr },
              { label: 'Status',     val: detailsBooking.status.charAt(0).toUpperCase() + detailsBooking.status.slice(1) },
              { label: 'Flight',     val: `${detailsBooking.flight.flight_no} (${detailsBooking.flight.aircraft_type})` },
              { label: 'Route',      val: `${detailsBooking.flight.origin} → ${detailsBooking.flight.destination}` },
              { label: 'Departs',    val: `${formatTime(detailsBooking.flight.departs_at)} · Arrives: ${formatTime(detailsBooking.flight.arrives_at)}` },
              { label: 'Seat',       val: `${detailsBooking.seat.seat_number} (${detailsBooking.seat.class})` },
              { label: 'Passenger',  val: detailsBooking.passenger.full_name },
              { label: 'Total Paid', val: `₹${detailsBooking.total.toLocaleString()}` },
              { label: 'Booked',     val: formatDate(detailsBooking.bookedAt) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DDE5EE', fontSize: '0.88rem' }}>
                <span style={{ color: '#5A6A78', fontWeight: 600 }}>{r.label}:</span>
                <span style={{ color: '#0F1923' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setDetailsBooking(null)}
                style={{ background: '#fff', border: '1.5px solid #0A4F8C', color: '#0A4F8C', borderRadius: '8px', padding: '9px 22px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <Navbar active="bookings" />

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', marginBottom: '1.5rem' }}>My Bookings</h2>

        {bookings.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '3rem', textAlign: 'center', color: '#5A6A78' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#0F1923', marginBottom: '0.5rem' }}>No bookings yet</p>
            <p style={{ fontSize: '0.88rem' }}>Search and book a flight to get started.</p>
            <button
              onClick={() => router.push('/search')}
              style={{ marginTop: '1rem', background: '#0A4F8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
            >
              Search Flights
            </button>
          </div>
        ) : (
          bookings.map((b) => {
            const sc = statusColors[b.status] || statusColors.confirmed;
            const within2h = isWithin2Hours(b);
            return (
              <div key={b.pnr} style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '1.25rem 1.5rem', marginBottom: '14px', boxShadow: '0 1px 6px rgba(10,79,140,0.07)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem' }}>
                    {AIRPORT_NAMES[b.flight.origin] || b.flight.origin} → {AIRPORT_NAMES[b.flight.destination] || b.flight.destination}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#5A6A78', marginBottom: '0.75rem' }}>
                  <span>✈ {b.flight.flight_no}</span>
                  <span>📅 {formatDate(b.date)}</span>
                  <span>🕐 {formatTime(b.flight.departs_at)} → {formatTime(b.flight.arrives_at)}</span>
                  <span>💺 Seat {b.seat.seat_number} ({b.seat.class})</span>
                  <span>🎫 PNR: <strong style={{ color: '#0A4F8C' }}>{b.pnr}</strong></span>
                </div>

                {within2h && b.status !== 'cancelled' && (
                  <div style={{ background: '#FEF8E7', border: '1px solid #E8C980', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', color: '#9A6800', marginBottom: '0.75rem' }}>
                    ⚠️ Departure in less than 2 hours — cancellation not permitted
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ background: '#FDF5E8', border: '1.5px solid #E8C980', borderRadius: '8px', padding: '6px 14px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C8922A' }}>₹{b.total.toLocaleString()}</span>
                  </div>

                  {/* ── ACTION BUTTONS — b is in scope here ── */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {b.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => promptReschedule(b.pnr)}
                          style={{ ...btnBase, background: '#C8922A', color: '#fff' }}
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => promptCancel(b.pnr)}
                          disabled={within2h}
                          style={{ ...btnBase, background: within2h ? '#ccc' : '#B83232', color: '#fff', cursor: within2h ? 'not-allowed' : 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {/* Details button — always visible, b is in scope */}
                    <button
                      onClick={() => setDetailsBooking(b)}
                      style={{ ...btnBase, background: '#fff', border: '1.5px solid #0A4F8C', color: '#0A4F8C' }}
                    >
                      Details
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
