import { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { Photo } from './domain/campaign';
import { supabase } from './auth/client';
import { localPhotoUri } from './services/photoFiles';
import { Button, Notice } from './ui';
export function PhotoView({ photo }: { photo: Photo }) {
  const [uri, setUri] = useState(''); const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0);
  useEffect(() => { let active = true; let local = ''; void (async () => {
    try { let next: string;
      if (photo.path) { if (!supabase) throw new Error('Cloud storage is not configured.'); const { data, error: signedError } = await supabase.storage.from('business-photos').createSignedUrl(photo.path, 600); if (signedError) throw signedError; next = data.signedUrl; }
      else next = await localPhotoUri(photo.uri);
      local = next; if (active) { setUri(next); setError(''); } else if (Platform.OS === 'web' && next.startsWith('blob:')) URL.revokeObjectURL(next);
    } catch { if (active) setError('Photo unavailable. Check your connection, retry, or add it again.'); }
  })(); return () => { active = false; if (Platform.OS === 'web' && local.startsWith('blob:')) URL.revokeObjectURL(local); }; }, [photo.path, photo.uri, attempt]);
  return <View style={{ gap: 8 }}>{uri && !error ? <Image accessibilityLabel="Your original business photo" source={{ uri }} style={{ width: '100%', height: 210, borderRadius: 14 }} resizeMode="contain" onError={() => setError('Could not display this photo.')} /> : error ? <><Notice error>{error}</Notice><Button title="Retry photo" secondary onPress={() => setAttempt(v => v + 1)} /></> : <Notice>Loading photo…</Notice>}</View>;
}
