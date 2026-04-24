import Hero from '../components/Hero';
import CommentForm from '../components/CommentForm';
import { createSupabaseServer } from '../lib/supabaseServer';

async function getHomeData() {
  const supabase = await createSupabaseServer();

  const [{ data: stories }, { data: posts }, { data: events }, { data: reels }, { data: comments }] = await Promise.all([
    supabase.from('stories').select('*').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(8),
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(12),
    supabase.from('events').select('*').order('event_date', { ascending: true }).limit(6),
    supabase.from('reels').select('*').order('created_at', { ascending: false }).limit(4),
    supabase.from('comments').select('*').order('created_at', { ascending: false })
  ]);

  return { stories: stories || [], posts: posts || [], events: events || [], reels: reels || [], comments: comments || [] };
}

export default async function HomePage() {
  const { stories, posts, events, reels, comments } = await getHomeData();

  return (
    <>
      <Hero />

      <h2 className="section-title">Live Stories</h2>
      {stories.length ? (
        <div className="story-row">
          {stories.map((story) => (
            <div className="story-bubble" key={story.id}>
              {story.media_type === 'image' ? (
                <img src={story.media_url} alt="story" />
              ) : (
                <video src={story.media_url} controls />
              )}
              <div className="meta">24h update</div>
            </div>
          ))}
        </div>
      ) : <div className="empty">No active stories right now</div>}

      <div className="split" style={{ marginTop: 20 }}>
        <section>
          <h2 className="section-title">Latest Posts</h2>
          <div className="grid cards-3">
            {posts.map((post) => {
              const postComments = comments.filter((c) => c.target_type === 'post' && c.target_id === post.id);
              return (
                <article className="card" key={post.id}>
                  {post.media_type === 'image' ? (
                    <img src={post.media_url} alt={post.caption || 'post'} />
                  ) : (
                    <video src={post.media_url} controls />
                  )}
                  {post.slogan && <span className="badge">{post.slogan}</span>}
                  <p>{post.caption}</p>
                  <div className="meta">{new Date(post.created_at).toLocaleString()}</div>
                  <div className="comment-box">
                    <h4>Comments</h4>
                    {postComments.slice(0, 4).map((item) => (
                      <p key={item.id} className="muted">• {item.content}</p>
                    ))}
                    <CommentForm targetType="post" targetId={post.id} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside>
          <h2 className="section-title">Upcoming Events</h2>
          <div className="grid">
            {events.map((event) => (
              <article className="card" key={event.id}>
                {event.banner_url && <img src={event.banner_url} alt={event.title} />}
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="meta">📍 {event.location || 'TBA'}</div>
                <div className="meta">🗓 {new Date(event.event_date).toLocaleString()}</div>
              </article>
            ))}
          </div>

          <h2 className="section-title">Hot Reels</h2>
          <div className="grid">
            {reels.map((reel) => (
              <article className="card" key={reel.id}>
                <video src={reel.video_url} controls />
                <h4>{reel.title}</h4>
                <p className="muted">{reel.caption}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
