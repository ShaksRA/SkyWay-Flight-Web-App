import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BookingStep = 1 | 2 | 3 | 4;

interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: string;
  base_price: number;
}

interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: string;
  is_available: boolean;
  extra_fee: number;
}

interface PassengerFormData {
  full_name: string;
  nationality: string;
  dob: string;
}

interface FlightState {
  searchQuery: SearchQuery;
  searchResults: Flight[];
  selectedFlight: Flight | null;
  selectedClass: 'economy' | 'business' | 'first';
  selectedSeat: Seat | null;
  optimisticSeatId: string | null;
  currentStep: BookingStep;
  passengerData: PassengerFormData[];
  setSearchQuery: (q: SearchQuery) => void;
  setSearchResults: (results: Flight[]) => void;
  setSelectedFlight: (flight: Flight, cls?: 'economy' | 'business' | 'first') => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setOptimisticSeat: (seatId: string | null) => void;
  setCurrentStep: (step: BookingStep) => void;
  setPassengerData: (data: PassengerFormData[]) => void;
  resetBookingFlow: () => void;
}

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchQuery: { origin: '', destination: '', date: '', passengers: 1 },
      searchResults: [],
      selectedFlight: null,
      selectedClass: 'economy',
      selectedSeat: null,
      optimisticSeatId: null,
      currentStep: 1,
      passengerData: [],
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSelectedFlight: (flight, cls = 'economy') =>
        set({ selectedFlight: flight, selectedClass: cls, selectedSeat: null, optimisticSeatId: null }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setOptimisticSeat: (seatId) => set({ optimisticSeatId: seatId }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setPassengerData: (data) => set({ passengerData: data }),
      resetBookingFlow: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          optimisticSeatId: null,
          currentStep: 1,
          passengerData: [],
        }),
    }),
    {
      name: 'skyway-flight-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedClass: state.selectedClass,
        selectedSeat: state.selectedSeat,
        currentStep: state.currentStep,
        passengerData: state.passengerData,
      }),
    }
  )
);