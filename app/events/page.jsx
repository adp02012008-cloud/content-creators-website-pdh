import { createSupabaseServer } from '../../lib/supabaseServer';

export default async function EventsPage() {
  const supabase = await createSupabaseServer();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  return (
    <div>
      <h1 className="section-title">Upcoming Events</h1>

      {!events?.length ? (
        <div className="empty">Currently no events are available.</div>
      ) : (
        <div className="grid cards-3">
          {events.map((event) => (
            <div className="card" key={event.id}>
              {event.banner_url && <img src={event.banner_url} alt={event.title} />}
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <div className="meta">📍 {event.location || 'TBA'}</div>
              <div className="meta">🗓 {new Date(event.event_date).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}