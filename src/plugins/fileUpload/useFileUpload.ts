import { ref, computed } from 'vue';
import axios from 'axios';
import SparkMD5 from 'spark-md5';
import type { UploadOptions, UploadFile, FileChunk } from './types';

export function useFileUpload(options: UploadOptions) {
  const files = ref<UploadFile[]>([]);
  const uploading = ref(false);

  const defaultOptions: UploadOptions = {
    url: options.url,
    chunkSize: options.chunkSize || 2 * 1024 * 1024, // 2MB chunks
    concurrent: options.concurrent || 3,
    autoUpload: options.autoUpload ?? true,
    maxFileSize: options.maxFileSize || 1024 * 1024 * 1024, // 1GB
    allowedTypes: options.allowedTypes || [],
    headers: options.headers || {},
  };

  const calculateHash = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer();
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        spark.append(e.target?.result as ArrayBuffer);
        resolve(spark.end());
      };
    });
  };

  const createChunks = (file: File): FileChunk[] => {
    const chunks: FileChunk[] = [];
    const chunkSize = defaultOptions.chunkSize!;
    const chunksCount = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < chunksCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      chunks.push({
        chunk,
        index: i,
        hash: '',
        progress: 0,
      });
    }

    return chunks;
  };

  const addFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      if (defaultOptions.maxFileSize && file.size > defaultOptions.maxFileSize) {
        console.error(`File ${file.name} exceeds maximum size limit`);
        continue;
      }

      if (
        defaultOptions.allowedTypes?.length &&
        !defaultOptions.allowedTypes.includes(file.type)
      ) {
        console.error(`File type ${file.type} not allowed`);
        continue;
      }

      const hash = await calculateHash(file);
      const uploadFile: UploadFile = {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        chunks: createChunks(file),
        hash,
      };

      files.value.push(uploadFile);

      if (defaultOptions.autoUpload) {
        await uploadFile(uploadFile);
      }
    }
  };

  const uploadChunk = async (
    file: UploadFile,
    chunk: FileChunk
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', chunk.chunk);
    formData.append('hash', file.hash);
    formData.append('chunkIndex', chunk.index.toString());
    formData.append('totalChunks', file.chunks.length.toString());

    try {
      await axios.post(defaultOptions.url, formData, {
        headers: {
          ...defaultOptions.headers,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 0)
          );
          chunk.progress = percentCompleted;
          updateFileProgress(file);
        },
      });

      chunk.progress = 100;
      updateFileProgress(file);
    } catch (error) {
      file.status = 'error';
      console.error(`Error uploading chunk ${chunk.index} of ${file.name}:`, error);
      throw error;
    }
  };

  const uploadFile = async (file: UploadFile) => {
    if (file.status === 'completed') return;

    file.status = 'uploading';
    uploading.value = true;

    try {
      const chunksToUpload = file.chunks.filter(
        (chunk) => chunk.progress < 100
      );
      
      for (let i = 0; i < chunksToUpload.length; i += defaultOptions.concurrent!) {
        const chunkBatch = chunksToUpload.slice(i, i + defaultOptions.concurrent!);
        await Promise.all(
          chunkBatch.map((chunk) => uploadChunk(file, chunk))
        );
      }

      file.status = 'completed';
    } catch (error) {
      file.status = 'error';
      console.error(`Error uploading file ${file.name}:`, error);
    } finally {
      uploading.value = false;
    }
  };

  const updateFileProgress = (file: UploadFile) => {
    const totalProgress = file.chunks.reduce(
      (acc, chunk) => acc + chunk.progress,
      0
    );
    file.progress = Math.round(totalProgress / file.chunks.length);
  };

  const removeFile = (fileId: string) => {
    const index = files.value.findIndex((f) => f.id === fileId);
    if (index !== -1) {
      files.value.splice(index, 1);
    }
  };

  const clearFiles = () => {
    files.value = [];
  };

  const totalProgress = computed(() => {
    if (files.value.length === 0) return 0;
    const total = files.value.reduce((acc, file) => acc + file.progress, 0);
    return Math.round(total / files.value.length);
  });

  return {
    files,
    uploading,
    totalProgress,
    addFiles,
    uploadFile,
    removeFile,
    clearFiles,
  };
}