import Link from 'next/link';
import { createSupabaseServer } from '../lib/supabaseServer';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const supabase = await createSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="brand">
          <span className="brand-icon">🎬</span>
          <span>PDH NIJA</span>
        </Link>

        <nav className="nav-links">
          <Link className="nav-link" href="/">Home</Link>
          <Link className="nav-link" href="/stories">Stories</Link>
          <Link className="nav-link" href="/events">Events</Link>
          <Link className="nav-link" href="/reels">Reels</Link>
          <Link className="nav-link" href="/shortfilms">Films</Link>
          <Link className="nav-link highlight" href="/dashboard">Upload</Link>

          {user ? (
            <LogoutButton />
          ) : (
            <Link className="nav-link login-btn" href="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}