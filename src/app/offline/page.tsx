export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#0A4F8C', marginBottom: '0.75rem' }}>
          You&apos;re Offline
        </h1>
        <p style={{ color: '#5A6A78', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          No internet connection detected. Your previously viewed bookings are still available below.
        </p>
        <a href="/bookings" style={{ display: 'inline-block', background: '#0A4F8C', color: '#fff', borderRadius: '8px', padding: '12px 28px', fontWeight: 600, textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '0.92rem' }}>
          View Cached Bookings
        </a>
        <p style={{ color: '#8A9BAA', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          We&apos;ll reconnect automatically when your internet is back.
        </p>
      </div>
    </div>
  );
}
