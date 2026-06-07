'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('voyage_token');
    setIsLoggedIn(!!token);
  }, [pathname]); // re-check on every route change

  const handleLogout = () => {
    localStorage.removeItem('voyage_token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  // Don't show navbar on login page or landing page
  if (pathname === '/login' || pathname === '/') return null;

  return (
    <nav style={{ background: '#1C1810', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <a href="/" style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#FAF7F2', textDecoration: 'none' }}>
        Voya<span style={{ color: '#9FE1CB' }}>ge</span>
      </a>

      {isLoggedIn && (
        <div style={{ display: 'flex', gap: '.25rem' }}>
          <a href="/plan" style={{ padding: '0 1rem', height: '56px', display: 'flex', alignItems: 'center', color: pathname === '/plan' ? '#9FE1CB' : '#7A7060', fontSize: '.85rem', textDecoration: 'none', borderBottom: pathname === '/plan' ? '2px solid #9FE1CB' : '2px solid transparent', transition: '.15s' }}>
            Plan a trip
          </a>
          <a href="/trips" style={{ padding: '0 1rem', height: '56px', display: 'flex', alignItems: 'center', color: pathname === '/trips' ? '#9FE1CB' : '#7A7060', fontSize: '.85rem', textDecoration: 'none', borderBottom: pathname === '/trips' ? '2px solid #9FE1CB' : '2px solid transparent', transition: '.15s' }}>
            My trips
          </a>
        </div>
      )}

      {isLoggedIn ? (
        <button onClick={handleLogout} style={{ fontSize: '.82rem', color: '#7A7060', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sign out
        </button>
      ) : (
        <a href="/login" style={{ fontSize: '.82rem', color: '#9FE1CB', textDecoration: 'none' }}>Sign in</a>
      )}
    </nav>
  );
}