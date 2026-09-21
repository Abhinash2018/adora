import { useRef, useState } from 'react';
import { Linking, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/src/auth/AuthProvider';
import { editDraft } from '@/src/domain/campaign';
import { PhotoView } from '@/src/PhotoView';
import { savePhoto } from '@/src/services/photos';
import { useWorkspace } from '@/src/state/WorkspaceProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, Card, Notice, ui } from '@/src/ui';
export default function Photos() {
  const router = useRouter(); const { demo } = useAuth(); const workspace = useWorkspace(); const draft = workspace.data.draft;
  const lock = useRef(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [denied, setDenied] = useState(false);
  async function add(camera: boolean) {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setDenied(false);
    try {
      if ((draft?.photos.length ?? 0) >= 5) throw new Error('You can add up to five photos. Remove one to add another.');
      if (camera) { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) { setDenied(true); throw new Error('Camera permission was denied. Use your gallery instead or enable the camera in Settings.'); } }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.85, allowsEditing: false, exif: false };
      const result = await (camera ? ImagePicker.launchCameraAsync(options) : ImagePicker.launchImageLibraryAsync(options)); if (result.canceled) return;
      const photo = await savePhoto(result.assets[0], demo);
      await workspace.update(w => { if (!w.draft) throw new Error('Start a campaign first.'); return { ...w, draft: editDraft(w.draft, { photos: [...w.draft.photos, photo], copy: [] }) }; });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not add photo. Please retry.'); } finally { lock.current = false; setBusy(false); }
  }
  async function remove(id: string) { setBusy(true); try { await workspace.update(w => ({ ...w, draft: w.draft ? editDraft(w.draft, { photos: w.draft.photos.filter(p => p.id !== id), copy: [] }) : null })); } catch { setError('Could not save this change. Please retry.'); } finally { setBusy(false); } }
  return <WorkspaceScreen title="A picture. A few words." step={4} back={() => router.back()}>
    <Text style={ui.body}>Show what makes your business special. Add up to five photos you have permission to use. We keep your photos unaltered.</Text>
    {error && <Notice error>{error}</Notice>}{denied && Platform.OS !== 'web' && <Button title="Open app settings" secondary onPress={() => void Linking.openSettings().catch(() => setError('Please open Settings manually.'))} />}
    {!draft?.photos.length && <Notice>No photos yet. Add a photo of your product or service.</Notice>}
    {draft?.photos.map(photo => <Card key={photo.id}><PhotoView photo={photo} /><Button title="Remove from this draft" secondary disabled={busy} onPress={() => void remove(photo.id)} /></Card>)}
    <Button title="Choose from gallery" busy={busy} onPress={() => void add(false)} /><Button title="Take a photo" secondary disabled={busy} onPress={() => void add(true)} />
    <Card><Text style={ui.label}>What people should know</Text><Text style={ui.body}>{draft?.business.description}</Text><Button title="Edit business details" secondary onPress={() => router.push('/business')} /></Card>
    <Button title="Create my ad" disabled={busy || !draft?.photos.length} onPress={() => router.push('/preview')} />
  </WorkspaceScreen>;
}
