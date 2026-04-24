'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ section, id, label }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const ok = window.confirm(`Delete this ${label}?`);
    if (!ok) return;

    try {
      setLoading(true);

      const response = await fetch('/api/content', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ section, id })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Delete failed');
        setLoading(false);
        return;
      }

      alert('Deleted successfully');
      router.refresh();
    } catch (error) {
      alert('Something went wrong while deleting');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="danger-button"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'Deleting...' : `Delete ${label}`}
    </button>
  );
}