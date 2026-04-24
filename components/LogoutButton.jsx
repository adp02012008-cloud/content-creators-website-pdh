'use client';

import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '../lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  }

  return <button className="button secondary" onClick={handleLogout}>Logout</button>;
}
