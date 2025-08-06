'use client';

import { useRouter } from 'next/router';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/logout', {
        method: 'POST',
      });
      router.replace('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200 shadow"
      disabled={loading}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
