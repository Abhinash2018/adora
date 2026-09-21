import { ImagePickerAsset } from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/src/auth/client';
import { Photo } from '@/src/domain/campaign';
import { validatePhoto } from '@/src/domain/photos';
import { keepPhoto, photoBytes } from './photoFiles';
export async function savePhoto(asset: ImagePickerAsset, demo: boolean): Promise<Photo> {
  const id = Crypto.randomUUID(); const mimeType = asset.mimeType ?? 'image/jpeg';
  const bytes = await photoBytes(asset.uri); const problem = validatePhoto(mimeType, bytes.byteLength); if (problem) throw new Error(problem);
  if (demo) return { id, mimeType, uri: await keepPhoto(id, asset.uri) };
  if (!supabase) throw new Error('Cloud storage is not configured.');
  const { data: auth } = await supabase.auth.getSession(); if (!auth.session) throw new Error('Please sign in again.');
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'; const path = `${auth.session.user.id}/${id}.${extension}`;
  const { error } = await supabase.storage.from('business-photos').upload(path, bytes, { contentType: mimeType, upsert: false });
  if (error) throw new Error('Upload failed. Check your connection and storage configuration, then retry.');
  return { id, mimeType, uri: '', path };
}
