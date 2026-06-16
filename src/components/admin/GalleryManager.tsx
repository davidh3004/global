/**
 * Gallery Manager Component
 * Admin interface for uploading and managing gallery photos
 */

import React, { useState, useEffect } from 'react';

interface Photo {
  id: string;
  url: string;
  filename: string;
  createdAt: any;
}

export default function GalleryManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchPhotos(); // Refresh list
        // Reset file input
        e.target.value = '';
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setMessage({ type: 'error', text: 'Failed to upload photos' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch('/api/gallery/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Photo deleted successfully' });
        fetchPhotos(); // Refresh list
      } else {
        setMessage({ type: 'error', text: data.error || 'Delete failed' });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setMessage({ type: 'error', text: 'Failed to delete photo' });
    }
  };

  if (loading) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="gallery-manager">
      {/* Upload Section */}
      <div className="upload-section card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Upload Photos</h2>
          <p className="text-sm opacity-70 mb-4">
            Select multiple photos to upload. Supported formats: JPG, PNG, WebP
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose photos</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="file-input file-input-bordered file-input-primary w-full"
            />
          </div>

          {uploading && (
            <div className="alert alert-info mt-4">
              <span className="loading loading-spinner"></span>
              <span>Uploading photos...</span>
            </div>
          )}

          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
              <span>{message.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Gallery Photos ({photos.length})</h2>

          {photos.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <p>No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {photos.map((photo) => (
                <div key={photo.id} className="photo-card">
                  <div className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="btn btn-error btn-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-2 truncate opacity-70">{photo.filename}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
