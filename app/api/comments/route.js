import { NextResponse } from 'next/server';
import { createSupabaseServer } from '../../../lib/supabaseServer';

export async function POST(req) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetType, targetId, content } = await req.json();

    const normalized = targetType === 'short_film' ? 'short_film' : targetType;
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      target_type: normalized,
      target_id: targetId,
      content
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
