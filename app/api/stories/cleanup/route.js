import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST() {
  const { error } = await supabaseAdmin
    .from('stories')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
