import { redirect } from 'next/navigation';
import UploadForm from '../../components/UploadForm';
import DeleteButton from '../../components/DeleteButton';
import { createSupabaseServer } from '../../lib/supabaseServer';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return (
      <div className="card">
        <h1>Dashboard</h1>
        <p className="muted">You are logged in, but this panel is only for admins.</p>
        <p className="muted">
          Go to Supabase → profiles table → change your role from <b>user</b> to <b>admin</b>.
        </p>
      </div>
    );
  }

  const [
    { data: posts },
    { data: stories },
    { data: events },
    { data: reels },
    { data: shortFilms }
  ] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('stories').select('*').order('created_at', { ascending: false }),
    supabase.from('events').select('*').order('event_date', { ascending: true }),
    supabase.from('reels').select('*').order('created_at', { ascending: false }),
    supabase.from('short_films').select('*').order('created_at', { ascending: false })
  ]);

  return (
    <div className="dashboard-stack">
      <section className="split">
        <section className="card">
          <h1>Admin Upload Dashboard</h1>
          <p className="muted">Welcome {profile?.full_name || 'Admin'}.</p>
          <UploadForm />
        </section>

        <aside className="card">
          <h2>Tips</h2>
          <ul>
            <li>Use image for photo posts and posters.</li>
            <li>Use video for reels and short films.</li>
            <li>Stories automatically disappear after 24 hours.</li>
            <li>Events appear on home page and events page.</li>
            <li>You can now delete content from the lists below.</li>
          </ul>
        </aside>
      </section>

      <section className="card">
        <h2>Manage Photo Posts</h2>
        <div className="grid cards-3">
          {(posts || []).map((item) => (
            <article className="card inner-card" key={item.id}>
              {item.media_type === 'image' ? (
                <img src={item.media_url} alt="post" />
              ) : (
                <video src={item.media_url} controls />
              )}
              {item.slogan && <span className="badge">{item.slogan}</span>}
              <p>{item.caption || 'No caption'}</p>
              <div className="meta">{new Date(item.created_at).toLocaleString()}</div>
              <DeleteButton section="post" id={item.id} label="Post" />
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Manage Stories</h2>
        <div className="grid cards-4">
          {(stories || []).map((item) => (
            <article className="card inner-card" key={item.id}>
              {item.media_type === 'image' ? (
                <img src={item.media_url} alt="story" />
              ) : (
                <video src={item.media_url} controls />
              )}
              <div className="meta">
                Expires: {new Date(item.expires_at).toLocaleString()}
              </div>
              <DeleteButton section="story" id={item.id} label="Story" />
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Manage Events</h2>
        <div className="grid cards-3">
          {(events || []).map((item) => (
            <article className="card inner-card" key={item.id}>
              {item.banner_url && <img src={item.banner_url} alt={item.title} />}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="meta">📍 {item.location || 'TBA'}</div>
              <div className="meta">
                🗓 {new Date(item.event_date).toLocaleString()}
              </div>
              <DeleteButton section="event" id={item.id} label="Event" />
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Manage Reels</h2>
        <div className="grid cards-3">
          {(reels || []).map((item) => (
            <article className="card inner-card" key={item.id}>
              <video src={item.video_url} controls />
              <h3>{item.title}</h3>
              {item.slogan && <span className="badge">{item.slogan}</span>}
              <p>{item.caption || 'No caption'}</p>
              <DeleteButton section="reel" id={item.id} label="Reel" />
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Manage Short Films</h2>
        <div className="grid cards-3">
          {(shortFilms || []).map((item) => (
            <article className="card inner-card" key={item.id}>
              <video src={item.video_url} controls />
              <h3>{item.title}</h3>
              {item.slogan && <span className="badge">{item.slogan}</span>}
              <p>{item.description || 'No description'}</p>
              <DeleteButton section="shortfilm" id={item.id} label="Short Film" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}