import CommentForm from '../../components/CommentForm';
import { createSupabaseServer } from '../../lib/supabaseServer';

export default async function ShortFilmsPage() {
  const supabase = await createSupabaseServer();

  const [{ data: shortfilms }, { data: comments }] = await Promise.all([
    supabase.from('short_films').select('*').order('created_at', { ascending: false }),
    supabase.from('comments').select('*').eq('target_type', 'short_film').order('created_at', { ascending: false })
  ]);

  return (
    <div>
      <h1 className="section-title">Short Films</h1>

      {!shortfilms?.length ? (
        <div className="empty">Currently no short films are available.</div>
      ) : (
        <div className="grid cards-3">
          {shortfilms.map((film) => (
            <div className="card" key={film.id}>
              <video src={film.video_url} controls />
              <h3>{film.title}</h3>
              {film.slogan && <span className="badge">{film.slogan}</span>}
              <p>{film.description}</p>

              {(comments || [])
                .filter((c) => c.target_id === film.id)
                .slice(0, 5)
                .map((c) => (
                  <p key={c.id} className="muted">• {c.content}</p>
                ))}

              <CommentForm targetType="short_film" targetId={film.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}