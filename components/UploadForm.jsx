'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const sections = [
  { value: 'post', label: 'Photo Post' },
  { value: 'story', label: 'Story' },
  { value: 'event', label: 'Event' },
  { value: 'reel', label: 'Reel' },
  { value: 'shortfilm', label: 'Short Film' }
];

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 45 * 1024 * 1024; // 45MB

async function safeJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || 'Server returned invalid response');
  }
}

export default function UploadForm() {
  const [section, setSection] = useState('post');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);

  function validateFile(file) {
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      throw new Error(
        isVideo
          ? 'Video is too large. Please upload below 45MB.'
          : 'Image is too large. Please upload below 8MB.'
      );
    }
  }

  async function uploadSingleFile(file) {
    if (!file) return null;

    validateFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      let mediaUpload = null;
      let thumbnailUpload = null;

      if (
        section === 'post' ||
        section === 'story' ||
        section === 'reel' ||
        section === 'shortfilm'
      ) {
        if (!mediaFile) {
          alert('Please choose a media file');
          return;
        }

        mediaUpload = await uploadSingleFile(mediaFile);
      }

      if (
        section === 'event' ||
        section === 'reel' ||
        section === 'shortfilm'
      ) {
        if (thumbnailFile) {
          thumbnailUpload = await uploadSingleFile(thumbnailFile);
        }
      }

      const payload = {
        section,
        title,
        caption,
        slogan,
        description,
        location,
        eventDate,
        mediaType: mediaFile?.type?.startsWith('video/') ? 'video' : 'image',
        mediaUrl: mediaUpload?.url || null,
        mediaPublicId: mediaUpload?.public_id || null,
        thumbnailUrl: thumbnailUpload?.url || null,
        thumbnailPublicId: thumbnailUpload?.public_id || null
      };

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save content');
      }

      alert('Uploaded successfully');

      setTitle('');
      setCaption('');
      setSlogan('');
      setDescription('');
      setLocation('');
      setEventDate('');
      setMediaFile(null);
      setThumbnailFile(null);

      window.location.reload();
    } catch (error) {
      alert(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label>Section</label>
      <select value={section} onChange={(e) => setSection(e.target.value)}>
        {sections.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {(section === 'event' || section === 'reel' || section === 'shortfilm') && (
        <>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </>
      )}

      {(section === 'post' || section === 'reel') && (
        <>
          <label>Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter caption"
          />
        </>
      )}

      {(section === 'post' || section === 'reel' || section === 'shortfilm') && (
        <>
          <label>Slogan</label>
          <input
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="Enter slogan"
          />
        </>
      )}

      {(section === 'event' || section === 'shortfilm') && (
        <>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </>
      )}

      {section === 'event' && (
        <>
          <label>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />

          <label>Event Date</label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </>
      )}

      {(section === 'post' ||
        section === 'story' ||
        section === 'reel' ||
        section === 'shortfilm') && (
        <>
          <label>
            {section === 'post' || section === 'story'
              ? 'Media File'
              : 'Video File'}
          </label>
          <input
            type="file"
            accept={
              section === 'post' || section === 'story'
                ? 'image/*,video/*'
                : 'video/*'
            }
            onChange={(e) => setMediaFile(e.target.files[0])}
            required
          />
        </>
      )}

      {(section === 'event' || section === 'reel' || section === 'shortfilm') && (
        <>
          <label>Thumbnail / Poster</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
          />
        </>
      )}

      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </motion.div>
    </form>
  );
}