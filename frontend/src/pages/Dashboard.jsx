import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
        if (res.status === 401) { window.location.href = '/login'; return; }
        const data = await res.json();
        setMe(data);
      } catch {
        setError('Network error');
      }
    })();
  }, []);

  async function handleLogout() {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  }

  if (error) return <p style={{ color: '#ff7b7b', padding: 24 }}>{error}</p>;
  if (!me) return <p style={{ color: '#ccc', padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Welcome, <b>{me.email}</b></p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
``