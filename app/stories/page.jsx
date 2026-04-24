import { createSupabaseServer } from '../../lib/supabaseServer';

export default async function StoriesPage() {
  const supabase = await createSupabaseServer();

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="section-title">Stories</h1>

      {!stories?.length ? (
        <div className="empty">Currently no active stories are available.</div>
      ) : (
        <div className="grid cards-4">
          {stories.map((story) => (
            <div className="card" key={story.id}>
              {story.media_type === 'image' ? (
                <img src={story.media_url} alt="story" />
              ) : (
                <video src={story.media_url} controls />
              )}

              <div className="meta">
                Expires: {new Date(story.expires_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}