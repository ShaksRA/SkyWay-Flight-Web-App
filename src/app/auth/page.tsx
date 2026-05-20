'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function getUsers(): User[] {
    try { return JSON.parse(localStorage.getItem('skyway_users') || '[]'); }
    catch { return []; }
  }

  function saveUser(user: User) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('skyway_users', JSON.stringify(users));
  }

  function setLoggedInUser(user: { firstName: string; lastName: string; email: string }) {
    localStorage.setItem('skyway_current_user', JSON.stringify(user));
  }

  function handleLogin() {
    setError('');
    if (!email) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    // Check demo user
    if (email === 'demo@skyway.com' && password === 'password123') {
      setLoggedInUser({ firstName: 'Demo', lastName: 'User', email });
      showWelcomeToast('Demo');
      router.push('/search');
      return;
    }

    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) { setError('Invalid email or password.'); return; }

    setLoggedInUser({ firstName: found.firstName, lastName: found.lastName, email: found.email });
    showWelcomeToast(found.firstName);
    router.push('/search');
  }

  function handleSignup() {
    setError('');
    if (!firstName.trim()) { setError('Please enter your first name.'); return; }
    if (!lastName.trim()) { setError('Please enter your last name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    const users = getUsers();
    if (users.find(u => u.email === email)) { setError('An account with this email already exists.'); return; }

    saveUser({ firstName, lastName, email, password });
    setLoggedInUser({ firstName, lastName, email });
    showWelcomeToast(firstName);
    router.push('/search');
  }

  function handleDemoLogin() {
    setLoggedInUser({ firstName: 'Demo', lastName: 'User', email: 'demo@skyway.com' });
    showWelcomeToast('Demo');
    router.push('/search');
  }

  function showWelcomeToast(name: string) {
    sessionStorage.setItem('skyway_welcome', name);
  }

  const inputStyle = {
    border: '1.5px solid #DDE5EE', borderRadius: '8px', padding: '11px 14px',
    fontSize: '0.92rem', outline: 'none', background: '#fff', width: '100%',
    fontFamily: 'inherit', color: '#0F1923',
  };

  const labelStyle = {
    fontSize: '0.72rem', fontWeight: 600 as const, color: '#5A6A78',
    textTransform: 'uppercase' as const, letterSpacing: '0.6px',
    marginBottom: '5px', display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FA', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: '#0A4F8C', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div onClick={() => router.push('/search')} style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '1.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✈ SkyWay
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => router.push('/search')} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.32)', color: '#fff', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>Search</button>
          <button onClick={() => router.push('/bookings')} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.32)', color: '#fff', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>My Bookings</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #DDE5EE', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 4px 24px rgba(10,79,140,0.10)' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '1.6rem', color: '#0A4F8C', fontFamily: 'Georgia, serif', fontWeight: 500 }}>✈ SkyWay</div>
            <p style={{ color: '#5A6A78', fontSize: '0.88rem', marginTop: '4px' }}>Sign in to manage your bookings</p>
          </div>

          {error && (
            <div style={{ background: '#FDF0F0', border: '1px solid #f5c6cb', color: '#B83232', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {isLogin ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#5A6A78' }}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button onClick={handleLogin} style={{ width: '100%', background: '#0A4F8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit', marginBottom: '1rem' }}>
                Sign In
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0.75rem 0', color: '#8A9BAA', fontSize: '0.8rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#DDE5EE' }} />
                or
                <div style={{ flex: 1, height: '1px', background: '#DDE5EE' }} />
              </div>
              <button onClick={handleDemoLogin} style={{ width: '100%', background: '#fff', color: '#0A4F8C', border: '1.5px solid #0A4F8C', borderRadius: '8px', padding: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit', marginBottom: '1rem' }}>
                Continue as Demo User
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#5A6A78' }}>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setIsLogin(false); setError(''); }} style={{ background: 'none', border: 'none', color: '#0A4F8C', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', textDecoration: 'underline' }}>
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#5A6A78' }}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p style={{ color: '#B83232', fontSize: '0.75rem', marginTop: '4px' }}>Password must be at least 8 characters</p>
                )}
              </div>
              <button onClick={handleSignup} style={{ width: '100%', background: '#0A4F8C', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit', marginBottom: '1rem' }}>
                Create Account
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#5A6A78' }}>
                Already have an account?{' '}
                <button onClick={() => { setIsLogin(true); setError(''); }} style={{ background: 'none', border: 'none', color: '#0A4F8C', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', textDecoration: 'underline' }}>
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
