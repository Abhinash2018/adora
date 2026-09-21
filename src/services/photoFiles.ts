import { Directory, File, Paths } from 'expo-file-system';
export async function photoBytes(uri: string): Promise<ArrayBuffer> { return new File(uri).arrayBuffer(); }
export async function keepPhoto(id: string, uri: string): Promise<string> { const directory = new Directory(Paths.document, 'adora-photos'); directory.create({ idempotent: true }); const target = new File(directory, `${id}.jpg`); await new File(uri).copy(target); return target.uri; }
export async function localPhotoUri(uri: string): Promise<string> { return uri; }
