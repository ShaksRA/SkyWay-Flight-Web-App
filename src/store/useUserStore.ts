import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Booking } from '@/types';
import type { Session, User } from '@supabase/supabase-js';

interface UserState {
  session: Session | null;
  user: User | null;
  cachedBookings: Booking[];
  isLoadingBookings: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setCachedBookings: (bookings: Booking[]) => void;
  updateBookingInCache: (bookingId: string, updates: Partial<Booking>) => void;
  setLoadingBookings: (loading: boolean) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      cachedBookings: [],
      isLoadingBookings: false,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      updateBookingInCache: (bookingId, updates) => {
        const updated = get().cachedBookings.map((b) =>
          b.id === bookingId ? { ...b, ...updates } : b
        );
        set({ cachedBookings: updated });
      },
      setLoadingBookings: (loading) => set({ isLoadingBookings: loading }),
      resetUser: () =>
        set({ session: null, user: null, cachedBookings: [], isLoadingBookings: false }),
    }),
    {
      name: 'skyway-user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session
          ? {
              access_token: state.session.access_token,
              refresh_token: state.session.refresh_token,
              expires_at: state.session.expires_at,
            }
          : null,
      }),
    }
  )
);