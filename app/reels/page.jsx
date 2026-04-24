import { createSupabaseServer } from '../../lib/supabaseServer';

export default async function ReelsPage() {
  const supabase = await createSupabaseServer();
  const { data: reels } = await supabase
    .from('reels')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="section-title">Reels</h1>

      {!reels?.length ? (
        <div className="empty">Currently no reels are available.</div>
      ) : (
        <div className="reels-page">
          {reels.map((reel) => (
            <article className="reel-card" key={reel.id}>
              <video src={reel.video_url} controls playsInline />

              <div className="reel-info">
                <h3>{reel.title}</h3>
                <p>{reel.caption}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}