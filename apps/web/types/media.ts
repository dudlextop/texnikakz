export interface UploadedMediaItem {
  id?: string;
  bucket: string;
  objectKey: string;
  url?: string;
  previewUrl?: string;
  mimeType?: string;
  size?: number;
  kind?: 'image' | 'video';
}
