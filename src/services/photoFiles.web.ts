function database(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open('adora-photos', 1); request.onupgradeneeded = () => request.result.createObjectStore('photos'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(new Error('Photo storage is unavailable in this browser.')); }); }
export async function photoBytes(uri: string): Promise<ArrayBuffer> { return (await fetch(uri)).arrayBuffer(); }
export async function keepPhoto(id: string, uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob(); const db = await database();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction('photos', 'readwrite'); tx.objectStore('photos').put(blob, id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(new Error('Photo could not be saved. Browser storage may be full.')); }); } finally { db.close(); }
  return `adora-photo:${id}`;
}
export async function localPhotoUri(uri: string): Promise<string> {
  if (!uri.startsWith('adora-photo:')) return uri;
  const db = await database(); try { const blob = await new Promise<Blob>((resolve, reject) => { const request = db.transaction('photos').objectStore('photos').get(uri.slice(12)); request.onsuccess = () => request.result ? resolve(request.result) : reject(new Error('Photo is no longer available. Please add it again.')); request.onerror = () => reject(new Error('Could not load photo.')); }); return URL.createObjectURL(blob); } finally { db.close(); }
}
