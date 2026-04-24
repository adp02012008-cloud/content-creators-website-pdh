'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentForm({ targetType, targetId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, content })
    });

    if (response.ok) {
      setContent('');
      router.refresh();
    } else {
      alert('Login first to comment');
    }
    setLoading(false);
  }

  return (
    <form className="form comment-box" onSubmit={handleSubmit}>
      <textarea
        className="textarea"
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button className="button" disabled={loading}>
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}
