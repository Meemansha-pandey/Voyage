'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('voyage_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleCTA = (path: string) => {
    const token = localStorage.getItem('voyage_token');
    if (token) {
      router.push(path);
    } else {
      // Store intended destination, redirect to login
      sessionStorage.setItem('redirect_after_login', path);
      router.push('/login');
    }
  };

  const features = [
    {
      icon: '📅',
      title: 'Plan a Trip',
      description: 'Get a full day-by-day itinerary for any destination, powered by AI. Add activities, regenerate days, and make it yours.',
      cta: 'Start planning',
      path: '/plan',
      accent: '#9FE1CB',
      bg: '#0F6E56',
    },
    {
      icon: '🗺️',
      title: 'My Trips',
      description: 'All your saved itineraries in one place. Revisit past trips, check your budget breakdown, and view hotel suggestions.',
      cta: 'View my trips',
      path: '/trips',
      accent: '#FAEEDA',
      bg: '#BA7517',
    },
    {
      icon: '🎒',
      title: 'Smart Packing',
      description: 'Never forget essentials again. Our AI builds a personalized packing list based on your destination, duration, and interests.',
      cta: 'Pack smarter',
      path: '/plan',
      accent: '#FAECE7',
      bg: '#993C1D',
    },
  ];

  const destinations = [
    { name: 'Tokyo', emoji: '🗻', desc: 'Culture & cuisine' },
    { name: 'Paris', emoji: '🗼', desc: 'Art & romance' },
    { name: 'Bali', emoji: '🌴', desc: 'Nature & serenity' },
    { name: 'Rome', emoji: '🏛️', desc: 'History & food' },
    { name: 'New York', emoji: '🗽', desc: 'Energy & culture' },
    { name: 'Dubai', emoji: '🌆', desc: 'Luxury & adventure' },
  ];

  return (
    <div style={{ background: '#1C1810', minHeight: '100vh', color: '#FAF7F2' }}>

      {/* Hero */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#2C2C2A', border: '1px solid #4A4035', borderRadius: '20px', padding: '.35rem 1rem', fontSize: '.78rem', color: '#9FE1CB', marginBottom: '2rem', letterSpacing: '.05em' }}>
          ✦ AI-powered travel planning
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15, marginBottom: '1.5rem', color: '#FAF7F2' }}>
          Your next adventure,<br />
          <span style={{ color: '#9FE1CB' }}>planned in seconds.</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#7A7060', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 2.5rem' }}>
          Tell us where you're going and we'll handle the rest — day-by-day itineraries, budget estimates, hotel picks, and a smart packing list tailored just for you.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => handleCTA('/plan')}
            style={{ padding: '.9rem 2rem', background: '#9FE1CB', color: '#1C1810', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: '.2s' }}>
            ✦ Plan a trip now
          </button>
          {isLoggedIn && (
            <button onClick={() => router.push('/trips')}
              style={{ padding: '.9rem 2rem', background: 'transparent', color: '#FAF7F2', border: '1px solid #4A4035', borderRadius: '10px', fontSize: '1rem', cursor: 'pointer', transition: '.2s' }}>
              My trips →
            </button>
          )}
          {!isLoggedIn && (
            <button onClick={() => router.push('/login')}
              style={{ padding: '.9rem 2rem', background: 'transparent', color: '#FAF7F2', border: '1px solid #4A4035', borderRadius: '10px', fontSize: '1rem', cursor: 'pointer', transition: '.2s' }}>
              Sign in →
            </button>
          )}
        </div>
      </div>

      {/* Destination strip */}
      <div style={{ borderTop: '1px solid #2C2C2A', borderBottom: '1px solid #2C2C2A', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', background: '#161410' }}>
        {destinations.map(d => (
          <div key={d.name} onClick={() => handleCTA('/plan')} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', opacity: .7 }}>
            <span style={{ fontSize: '1.3rem' }}>{d.emoji}</span>
            <div>
              <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#FAF7F2' }}>{d.name}</div>
              <div style={{ fontSize: '.7rem', color: '#4A4035' }}>{d.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '5rem 2rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', textAlign: 'center', marginBottom: '.75rem' }}>Everything you need for a perfect trip</h2>
        <p style={{ textAlign: 'center', color: '#7A7060', fontSize: '.9rem', marginBottom: '3rem' }}>From first idea to packed bag — Voyage has it all.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#2C2C2A', border: '1px solid #4A4035', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: f.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem', marginBottom: '.4rem' }}>{f.title}</div>
                <div style={{ fontSize: '.85rem', color: '#7A7060', lineHeight: 1.65 }}>{f.description}</div>
              </div>
              <button onClick={() => handleCTA(f.path)}
                style={{ marginTop: 'auto', padding: '.65rem 1.25rem', background: 'transparent', color: f.accent, border: `1px solid ${f.accent}40`, borderRadius: '8px', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: '.2s' }}>
                {f.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#161410', borderTop: '1px solid #2C2C2A', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', marginBottom: '.75rem' }}>How it works</h2>
          <p style={{ color: '#7A7060', fontSize: '.9rem', marginBottom: '3.5rem' }}>Three steps to your perfect trip</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { step: '01', title: 'Tell us your trip', desc: 'Enter your origin, destination, dates, budget and interests.' },
              { step: '02', title: 'AI builds your plan', desc: 'Get a full itinerary, budget breakdown, and hotel options in seconds.' },
              { step: '03', title: 'Customize & pack', desc: 'Edit any day, regenerate activities, and generate your packing list.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#9FE1CB', opacity: .4, marginBottom: '.75rem' }}>{s.step}</div>
                <div style={{ fontWeight: 600, fontSize: '.95rem', marginBottom: '.4rem' }}>{s.title}</div>
                <div style={{ fontSize: '.82rem', color: '#7A7060', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', marginBottom: '1rem' }}>Ready to go somewhere?</h2>
        <p style={{ color: '#7A7060', marginBottom: '2rem', fontSize: '.9rem' }}>Join thousands of travelers planning smarter with Voyage.</p>
        <button onClick={() => handleCTA('/plan')}
          style={{ padding: '1rem 2.5rem', background: '#9FE1CB', color: '#1C1810', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer' }}>
          ✦ Start planning for free
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #2C2C2A', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', color: '#4A4035' }}>Voya<span style={{ color: '#9FE1CB' }}>ge</span></div>
        <div style={{ fontSize: '.78rem', color: '#4A4035' }}>AI-powered travel planning</div>
      </div>
    </div>
  );
}