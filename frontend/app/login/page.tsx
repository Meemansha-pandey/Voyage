'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../hooks/useAuth';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      const redirect = sessionStorage.getItem('redirect_after_login') || '/plan';
      sessionStorage.removeItem('redirect_after_login');
      router.push(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const destinations = ['Tokyo', 'Paris', 'Bali', 'Rome', 'New York', 'Kyoto', 'Dubai', 'Barcelona'];

  return (
    <div style={{ minHeight: '100vh', background: '#1C1810', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* Animated background destinations */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {destinations.map((d, i) => (
          <div key={d} style={{
            position: 'absolute',
            fontFamily: 'Georgia, serif',
            fontSize: `${2 + (i % 3)}rem`,
            color: 'rgba(159,225,203,0.04)',
            top: `${10 + (i * 11) % 80}%`,
            left: `${5 + (i * 13) % 85}%`,
            transform: 'rotate(-15deg)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>{d}</div>
        ))}
      </div>

      {/* Left side — branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', position: 'relative' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '3rem', color: '#FAF7F2', lineHeight: 1, marginBottom: '.5rem' }}>
            Voya<span style={{ color: '#9FE1CB' }}>ge</span>
          </div>
          <div style={{ color: '#7A7060', fontSize: '.95rem', letterSpacing: '.05em' }}>AI-powered travel planning</div>
        </div>

        <div style={{ maxWidth: '420px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', color: '#FAF7F2', lineHeight: 1.3, marginBottom: '1.5rem' }}>
            Your next adventure,<br />
            <span style={{ color: '#9FE1CB' }}>planned in seconds.</span>
          </h1>
          <p style={{ color: '#7A7060', fontSize: '.95rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Tell us where you want to go. Our AI builds a complete day-by-day itinerary, estimates your budget, suggests hotels, and even packs your bag.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
            {['📅 Day-by-day itinerary', '💰 Budget estimates', '🏨 Hotel suggestions', '🎒 Smart packing list', '✈️ Route-aware planning'].map(f => (
              <div key={f} style={{ padding: '.4rem .9rem', background: '#2C2C2A', border: '1px solid #4A4035', borderRadius: '20px', color: '#B4B2A9', fontSize: '.78rem' }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Bottom destination strip */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', display: 'flex', gap: '1.5rem' }}>
          {['🗼 Paris', '🗻 Tokyo', '🏛️ Rome', '🌴 Bali'].map(d => (
            <div key={d} style={{ color: '#4A4035', fontSize: '.82rem' }}>{d}</div>
          ))}
        </div>
      </div>

      {/* Right side — auth form */}
      <div style={{ width: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(44,44,42,0.5)', backdropFilter: 'blur(10px)', borderLeft: '1px solid #2C2C2A' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#FAF7F2', marginBottom: '.3rem' }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ color: '#7A7060', fontSize: '.85rem' }}>
              {isRegister ? 'Start planning your dream trip' : 'Sign in to your travel dashboard'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#1C1810', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
            <button onClick={() => setIsRegister(false)}
              style={{ flex: 1, padding: '.6rem', border: 'none', borderRadius: '8px', background: !isRegister ? '#2C2C2A' : 'transparent', color: !isRegister ? '#FAF7F2' : '#7A7060', fontSize: '.85rem', cursor: 'pointer', transition: '.2s' }}>
              Sign in
            </button>
            <button onClick={() => setIsRegister(true)}
              style={{ flex: 1, padding: '.6rem', border: 'none', borderRadius: '8px', background: isRegister ? '#2C2C2A' : 'transparent', color: isRegister ? '#FAF7F2' : '#7A7060', fontSize: '.85rem', cursor: 'pointer', transition: '.2s' }}>
              Register
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {isRegister && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                style={{ width: '100%', padding: '.8rem 1rem', background: '#1C1810', border: '1px solid #4A4035', borderRadius: '10px', color: '#FAF7F2', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' as const }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
              style={{ width: '100%', padding: '.8rem 1rem', background: '#1C1810', border: '1px solid #4A4035', borderRadius: '10px', color: '#FAF7F2', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' as const }} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', padding: '.8rem 1rem', background: '#1C1810', border: '1px solid #4A4035', borderRadius: '10px', color: '#FAF7F2', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' as const }} />

            {error && (
              <div style={{ padding: '.65rem 1rem', background: '#FAECE7', border: '1px solid #F0997B', borderRadius: '8px', color: '#993C1D', fontSize: '.82rem' }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '.9rem', background: loading ? '#4A4035' : '#9FE1CB', color: '#1C1810', border: 'none', borderRadius: '10px', fontSize: '.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: '.2s', marginTop: '.25rem' }}>
              {loading ? 'Please wait...' : isRegister ? 'Create account →' : 'Sign in →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#4A4035', fontSize: '.75rem', marginTop: '1.5rem' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#9FE1CB', cursor: 'pointer' }}>
              {isRegister ? 'Sign in' : 'Register'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}