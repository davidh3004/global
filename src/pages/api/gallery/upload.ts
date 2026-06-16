import type { APIRoute } from 'astro';
import { db } from '../../../firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll('photos');

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No files provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create uploads/gallery directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'gallery');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      if (file instanceof File) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          continue; // Skip invalid files
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${randomString}.${extension}`;
        const filepath = join(uploadsDir, filename);

        // Save file to disk
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filepath, buffer);

        // Create public URL
        const publicUrl = `/uploads/gallery/${filename}`;

        // Save metadata to Firestore
        const photoDoc = await db.collection('gallery').add({
          url: publicUrl,
          filename: file.name,
          storedFilename: filename,
          size: file.size,
          type: file.type,
          createdAt: FieldValue.serverTimestamp(),
        });

        uploadedPhotos.push({
          id: photoDoc.id,
          url: publicUrl,
          filename: file.name,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
        photos: uploadedPhotos,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading photos:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to upload photos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Photo ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get photo data to find the stored filename
    const photoDoc = await db.collection('gallery').doc(photoId).get();
    const photoData = photoDoc.data();

    if (photoData && photoData.storedFilename) {
      // Delete physical file
      const filepath = join(process.cwd(), 'public', 'uploads', 'gallery', photoData.storedFilename);
      try {
        if (existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Delete Firestore document
    await db.collection('gallery').doc(photoId).delete();

    return new Response(
      JSON.stringify({ success: true, message: 'Photo deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting photo:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to delete photo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
