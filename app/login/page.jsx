'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState('login');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const supabase = createBrowserSupabase();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) return alert(error.message);
      alert('Signup successful. You can login now.');
      setMode('login');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="split">
      <section className="card">
        <h1>{mode === 'login' ? 'Login' : 'Create account'}</h1>
        <p className="muted">Use email and password to enter your creator platform.</p>
        <form className="form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input className="input" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          )}
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="button">{mode === 'login' ? 'Login' : 'Sign up'}</button>
        </form>
        <div className="flex" style={{ marginTop: 12 }}>
          <button className="button secondary" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            Switch to {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </div>
      </section>

      <aside className="card">
        <h2>Admin panel features</h2>
        <p className="muted">Upload posts, stories, reels, short films, slogans and event updates from one place.</p>
        <ul>
          <li>Photo post publishing</li>
          <li>Story publishing</li>
          <li>Event creation</li>
          <li>Reel and short film uploads</li>
          <li>Comment-based engagement</li>
        </ul>
      </aside>
    </div>
  );
}
