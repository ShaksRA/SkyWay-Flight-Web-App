export type FlightStatus = 'scheduled' | 'delayed' | 'cancelled' | 'completed';
export type SeatClass = 'economy' | 'business' | 'first';
export type BookingStatus = 'confirmed' | 'rescheduled' | 'cancelled';

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
  created_at?: string;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string | null;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  created_at?: string;
  flight?: Flight;
  seat?: Seat;
  passengers?: Passenger[];
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string | null;
  nationality: string;
  dob: string | null;
  created_at?: string;
}

export interface Reschedule {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  requested_at: string;
  fee_charged: number;
}

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface BookingStep {
  step: 1 | 2 | 3 | 4;
  label: string;
}

export interface PassengerFormData {
  full_name: string;
  nationality: string;
  dob: string;
}

export interface ReserveSeartRPCResponse {
  success: boolean;
  booking_id?: string;
  pnr_code?: string;
  error?: string;
}

export interface CancelBookingRPCResponse {
  success: boolean;
  booking_id?: string;
  error?: string;
}

export interface RescheduleBookingRPCResponse {
  success: boolean;
  fee_charged?: number;
  error?: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Record<string, Airport> = {
  BOM: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'India' },
  DEL: { code: 'DEL', name: 'Indira Gandhi Intl', city: 'Delhi', country: 'India' },
  BLR: { code: 'BLR', name: 'Kempegowda Intl', city: 'Bengaluru', country: 'India' },
  HYD: { code: 'HYD', name: 'Rajiv Gandhi Intl', city: 'Hyderabad', country: 'India' },
  MAA: { code: 'MAA', name: 'Chennai Intl', city: 'Chennai', country: 'India' },
  CCU: { code: 'CCU', name: 'Netaji Subhas Chandra Bose Intl', city: 'Kolkata', country: 'India' },
  SXR: { code: 'SXR', name: 'Sheikh ul-Alam Intl', city: 'Srinagar', country: 'India' },
};