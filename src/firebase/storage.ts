import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './client';

/**
 * Sube una imagen a Firebase Storage
 * @param file - Archivo a subir
 * @param path - Ruta donde se guardará (ej: 'crew/image.jpg')
 * @returns URL de descarga de la imagen
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Elimina una imagen de Firebase Storage
 * @param path - Ruta de la imagen a eliminar
 */
export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Extrae el path de una URL de Firebase Storage
 * @param url - URL completa de Firebase Storage
 * @returns Path del archivo
 */
export function getPathFromUrl(url: string): string {
  const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
  const imagePath = url.replace(baseUrl, '').split('?')[0];
  return decodeURIComponent(imagePath);
}
