'use client';

// ============================================================
// SkyWay - SeatMap Component
// Visual cabin grid with Supabase Realtime live sync
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useFlightStore } from '@/store/useFlightStore';
import type { Seat, SeatClass } from '@/types';

interface SeatMapProps {
  flightId: string;
  initialSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  yourSeatId?: string;
}

type SeatStatus = 'available' | 'occupied' | 'selected' | 'yours';

const CLASS_CONFIG = {
  first:    { rows: [1, 2, 3],              cols: ['A', 'B', '', 'C', 'D'],          label: 'First Class' },
  business: { rows: [4, 5, 6, 7, 8, 9],    cols: ['A', 'B', 'C', '', 'D', 'E', 'F'], label: 'Business' },
  economy:  { rows: Array.from({ length: 21 }, (_, i) => i + 10),
              cols: ['A', 'B', 'C', '', 'D', 'E', 'F'], label: 'Economy' },
};

export default function SeatMap({ flightId, initialSeats, onSeatSelect, yourSeatId }: SeatMapProps) {
  const [seats, setSeats] = useState<Map<string, Seat>>(
    new Map(initialSeats.map((s) => [s.seat_number, s]))
  );
  const { optimisticSeatId, setOptimisticSeat } = useFlightStore();
  const [selectedSeatNo, setSelectedSeatNo] = useState<string | null>(null);
  const supabase = createClient();

  // ── Supabase Realtime subscription ──────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          const updated = payload.new as Seat;
          setSeats((prev) => {
            const next = new Map(prev);
            next.set(updated.seat_number, updated);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flightId, supabase]);

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (!seat.is_available) return;
      // Optimistic update: mark selected before DB write
      setOptimisticSeat(seat.id);
      setSelectedSeatNo(seat.seat_number);
      onSeatSelect(seat);
    },
    [onSeatSelect, setOptimisticSeat]
  );

  function getSeatStatus(seat: Seat): SeatStatus {
    if (seat.id === yourSeatId) return 'yours';
    if (seat.seat_number === selectedSeatNo || seat.id === optimisticSeatId) return 'selected';
    if (!seat.is_available) return 'occupied';
    return 'available';
  }

  const statusClasses: Record<SeatStatus, string> = {
    available: 'bg-green-100 border-green-600 text-green-800 hover:scale-110 cursor-pointer',
    occupied:  'bg-red-100 border-red-400 text-red-500 cursor-not-allowed opacity-70',
    selected:  'bg-blue-600 border-blue-600 text-white scale-105',
    yours:     'bg-amber-500 border-amber-500 text-white',
  };

  return (
    <div className="overflow-x-auto">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
        {[
          { status: 'available', label: 'Available', color: 'bg-green-100 border-green-600' },
          { status: 'occupied',  label: 'Occupied',  color: 'bg-red-100 border-red-400' },
          { status: 'selected',  label: 'Selected',  color: 'bg-blue-600' },
          { status: 'yours',     label: 'Your Seat', color: 'bg-amber-500' },
        ].map((l) => (
          <div key={l.status} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded border-2 ${l.color}`} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Cabin sections */}
      {(Object.entries(CLASS_CONFIG) as [SeatClass, typeof CLASS_CONFIG['economy']][]).map(
        ([cls, config]) => (
          <div key={cls} className="mb-6">
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-gray-400
                            bg-gray-50 px-3 py-1 rounded mb-3">
              {config.label}
            </div>
            <div className="flex flex-col gap-1.5">
              {config.rows.map((row) => (
                <div key={row} className="flex items-center gap-1.5">
                  <span className="w-6 text-xs text-gray-400 text-right shrink-0">{row}</span>
                  {config.cols.map((col, idx) => {
                    if (!col) {
                      return <div key={`aisle-${idx}`} className="w-5 shrink-0" />;
                    }
                    const seatNo = `${row}${col}`;
                    const seat = seats.get(seatNo);
                    if (!seat) return <div key={seatNo} className="w-9" />;
                    const status = getSeatStatus(seat);
                    return (
                      <div
                        key={seatNo}
                        className={`
                          w-9 h-9 rounded border-2 flex items-center justify-center
                          text-[0.65rem] font-semibold transition-all duration-150
                          shrink-0 relative group
                          ${statusClasses[status]}
                        `}
                        onClick={() => status === 'available' && handleSeatClick(seat)}
                        role={status === 'available' ? 'button' : undefined}
                        aria-label={`Seat ${seatNo} - ${status}`}
                      >
                        {seatNo}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
                                        bg-gray-900 text-white text-xs px-2 py-1 rounded
                                        whitespace-nowrap opacity-0 group-hover:opacity-100
                                        transition-opacity pointer-events-none z-10">
                          {cls.charAt(0).toUpperCase() + cls.slice(1)}
                          {seat.extra_fee > 0 && ` · +₹${seat.extra_fee}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
