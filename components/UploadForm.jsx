'use client';

import { useState } from 'react';
import { motion } from "framer-motion";

const sections = [
  { value: 'post', label: 'Photo Post' },
  { value: 'story', label: 'Story' },
  { value: 'event', label: 'Event' },
  { value: 'reel', label: 'Reel' },
  { value: 'shortfilm', label: 'Short Film' }
];

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

  async function uploadSingleFile(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

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
          setLoading(false);
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to save content');
        setLoading(false);
        return;
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

      {/* SECTION */}
      <label>Section</label>
      <select value={section} onChange={(e) => setSection(e.target.value)}>
        {sections.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {/* TITLE */}
      {(section === 'event' || section === 'reel' || section === 'shortfilm') && (
        <>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
          />
        </>
      )}

      {/* CAPTION */}
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

      {/* SLOGAN */}
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

      {/* DESCRIPTION */}
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

      {/* EVENT */}
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
          />
        </>
      )}

      {/* MEDIA */}
      {(section === 'post' || section === 'story' || section === 'reel' || section === 'shortfilm') && (
        <>
          <label>
            {section === 'post' || section === 'story'
              ? 'Media File'
              : 'Video File'}
          </label>
          <input
            type="file"
            accept={section === 'post' || section === 'story'
              ? 'image/*,video/*'
              : 'video/*'}
            onChange={(e) => setMediaFile(e.target.files[0])}
          />
        </>
      )}

      {/* THUMBNAIL */}
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

      {/* 🔥 ANIMATED BUTTON */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ marginTop: "15px" }}
      >
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : '🚀 Upload'}
        </button>
      </motion.div>

    </form>
  );
}