import type { APIRoute } from 'astro';
import { db } from '../../firebase/server';

export const GET: APIRoute = async () => {
  try {
    const photosSnapshot = await db
      .collection('gallery')
      .orderBy('createdAt', 'desc')
      .limit(12)
      .get();

    const photos = photosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify({ success: true, photos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch photos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
