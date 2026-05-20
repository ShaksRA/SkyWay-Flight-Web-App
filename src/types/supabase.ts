export type Database = {
  public: {
    Tables: {
      flights: { Row: Record<string, unknown> };
      seats: { Row: Record<string, unknown> };
      bookings: { Row: Record<string, unknown> };
      passengers: { Row: Record<string, unknown> };
      reschedules: { Row: Record<string, unknown> };
    };
  };
};