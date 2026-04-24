import { NextResponse } from 'next/server';
import { createSupabaseServer } from '../../../lib/supabaseServer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function getTableName(section) {
  switch (section) {
    case 'post':
      return 'posts';
    case 'story':
      return 'stories';
    case 'event':
      return 'events';
    case 'reel':
      return 'reels';
    case 'shortfilm':
      return 'short_films';
    default:
      return null;
  }
}

function getSelectColumns(section) {
  switch (section) {
    case 'post':
      return 'id, public_id';
    case 'story':
      return 'id, public_id, media_type';
    case 'event':
      return 'id, thumbnail_public_id';
    case 'reel':
      return 'id, public_id, thumbnail_public_id';
    case 'shortfilm':
      return 'id, public_id, thumbnail_public_id';
    default:
      return 'id, public_id';
  }
}

async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
  }
}

export async function POST(req) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const {
      section,
      title,
      caption,
      slogan,
      description,
      location,
      eventDate,
      mediaType,
      mediaUrl,
      mediaPublicId,
      thumbnailUrl,
      thumbnailPublicId
    } = body;

    let query;

    switch (section) {
      case 'post':
        query = supabase.from('posts').insert({
          user_id: user.id,
          caption,
          slogan,
          media_url: mediaUrl,
          media_type: mediaType,
          public_id: mediaPublicId || null
        });
        break;

      case 'story':
        query = supabase.from('stories').insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          public_id: mediaPublicId || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
        break;

      case 'event':
        query = supabase.from('events').insert({
          user_id: user.id,
          title,
          description,
          location,
          banner_url: thumbnailUrl,
          event_date: new Date(eventDate).toISOString(),
          public_id: null,
          thumbnail_public_id: thumbnailPublicId || null
        });
        break;

      case 'reel':
        query = supabase.from('reels').insert({
          user_id: user.id,
          title,
          caption,
          slogan,
          video_url: mediaUrl,
          thumbnail_url: thumbnailUrl || null,
          public_id: mediaPublicId || null,
          thumbnail_public_id: thumbnailPublicId || null
        });
        break;

      case 'shortfilm':
        query = supabase.from('short_films').insert({
          user_id: user.id,
          title,
          description,
          slogan,
          video_url: mediaUrl,
          thumbnail_url: thumbnailUrl || null,
          public_id: mediaPublicId || null,
          thumbnail_public_id: thumbnailPublicId || null
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { section, id } = body;

    if (!section || !id) {
      return NextResponse.json(
        { error: 'section and id are required' },
        { status: 400 }
      );
    }

    const tableName = getTableName(section);

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const { data: item, error: fetchError } = await supabase
      .from(tableName)
      .select(getSelectColumns(section))
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (section === 'post') {
      await deleteCloudinaryAsset(item.public_id, 'image');
    }

    if (section === 'story') {
      const storyType = item.media_type === 'video' ? 'video' : 'image';
      await deleteCloudinaryAsset(item.public_id, storyType);
    }

    if (section === 'event') {
      await deleteCloudinaryAsset(item.thumbnail_public_id, 'image');
    }

    if (section === 'reel') {
      await deleteCloudinaryAsset(item.public_id, 'video');
      await deleteCloudinaryAsset(item.thumbnail_public_id, 'image');
    }

    if (section === 'shortfilm') {
      await deleteCloudinaryAsset(item.public_id, 'video');
      await deleteCloudinaryAsset(item.thumbnail_public_id, 'image');
    }

    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Deleted from website, database, and Cloudinary'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}