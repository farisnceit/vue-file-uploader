export interface UploadOptions {
  url: string;
  headers?: Record<string, string>;
  chunkSize?: number;
  concurrent?: number;
  autoUpload?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface FileChunk {
  chunk: Blob;
  index: number;
  hash: string;
  progress: number;
}

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  progress: number;
  chunks: FileChunk[];
  hash: string;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
}