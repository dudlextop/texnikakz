import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../api-client';

interface PresignResponse {
  url: string;
  bucket: string;
  objectKey: string;
  expiresIn: number;
}

export function presignMedia(file: File) {
  return apiFetch<PresignResponse>('/media/presign', {
    method: 'POST',
    body: {
      fileName: file.name,
      contentType: file.type,
      size: file.size
    }
  });
}

export function useMediaPresign() {
  return useMutation({
    mutationFn: presignMedia
  });
}

export function attachMedia(payload: {
  bucket: string;
  objectKey: string;
  listingId?: string;
  specialistId?: string;
  kind?: string;
  url?: string;
  previewUrl?: string;
}) {
  return apiFetch('/media/attach', {
    method: 'POST',
    body: payload
  });
}

export function useAttachMedia() {
  return useMutation({
    mutationFn: attachMedia
  });
}
