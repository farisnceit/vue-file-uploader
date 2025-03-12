<template>
  <div class="file-uploader">
    <!-- Drag and Drop Zone -->
    <div
      class="file-uploader__drag-zone"
      @drop.prevent="handleDrop"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      :class="{ 'file-uploader__drag-zone--active': dragover }"
    >
      <div class="file-uploader__drag-content">
        <div class="file-uploader__icon">📁</div>
        <p class="file-uploader__text">Drag and drop files here or</p>
        <label class="file-uploader__browse-btn">
          Browse Files
          <input
            type="file"
            @change="handleFileSelect"
            multiple
            class="file-uploader__input"
          />
        </label>
      </div>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="file-uploader__list">
      <div class="file-uploader__total-progress">
        <div class="file-uploader__progress-text">
          Total Progress: {{ totalProgress }}%
        </div>
        <div class="file-uploader__progress-bar">
          <div
            class="file-uploader__progress-fill"
            :style="{ width: totalProgress + '%' }"
          ></div>
        </div>
      </div>

      <div v-for="file in files" :key="file.id" class="file-uploader__item">
        <div class="file-uploader__item-info">
          <span class="file-uploader__item-name">{{ file.name }}</span>
          <span class="file-uploader__item-size">{{ formatSize(file.size) }}</span>
        </div>

        <div class="file-uploader__item-progress">
          <div class="file-uploader__progress-bar">
            <div
              class="file-uploader__progress-fill"
              :style="{ width: file.progress + '%' }"
            ></div>
          </div>
          <span class="file-uploader__progress-text">{{ file.progress }}%</span>
        </div>

        <div class="file-uploader__item-actions">
          <button
            v-if="file.status === 'pending'"
            @click="() => uploadFile(file)"
            class="file-uploader__btn file-uploader__btn--upload"
          >
            Upload
          </button>
          <button
            @click="() => removeFile(file.id)"
            class="file-uploader__btn file-uploader__btn--remove"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileUpload } from '../plugins/fileUpload/useFileUpload';

const props = defineProps<{
  uploadUrl: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  autoUpload?: boolean;
}>();

const dragover = ref(false);

const {
  files,
  totalProgress,
  addFiles,
  uploadFile,
  removeFile,
} = useFileUpload({
  url: props.uploadUrl,
  maxFileSize: props.maxFileSize,
  allowedTypes: props.allowedTypes,
  autoUpload: props.autoUpload,
});

const handleDrop = (e: DragEvent) => {
  dragover.value = false;
  const droppedFiles = Array.from(e.dataTransfer?.files || []);
  addFiles(droppedFiles);
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const selectedFiles = Array.from(input.files || []);
  addFiles(selectedFiles);
  input.value = ''; // Reset input
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style>
:root {
  --file-uploader-primary-color: #646cff;
  --file-uploader-primary-hover: #535bf2;
  --file-uploader-danger-color: #ff4646;
  --file-uploader-danger-hover: #f23535;
  --file-uploader-bg-color: #ffffff;
  --file-uploader-border-color: #cccccc;
  --file-uploader-text-color: #213547;
  --file-uploader-secondary-text: #666666;
  --file-uploader-border-radius: 8px;
  --file-uploader-spacing: 1rem;
  --file-uploader-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-uploader {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

.file-uploader__drag-zone {
  border: 2px dashed var(--file-uploader-border-color);
  border-radius: var(--file-uploader-border-radius);
  padding: calc(var(--file-uploader-spacing) * 2);
  text-align: center;
  transition: all 0.3s ease;
}

.file-uploader__drag-zone--active {
  border-color: var(--file-uploader-primary-color);
  background-color: rgba(100, 108, 255, 0.1);
}

.file-uploader__drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--file-uploader-spacing);
}

.file-uploader__icon {
  font-size: 3rem;
}

.file-uploader__browse-btn {
  background-color: var(--file-uploader-primary-color);
  color: var(--file-uploader-bg-color);
  padding: calc(var(--file-uploader-spacing) * 0.5) var(--file-uploader-spacing);
  border-radius: var(--file-uploader-border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-uploader__browse-btn:hover {
  background-color: var(--file-uploader-primary-hover);
}

.file-uploader__input {
  display: none;
}

.file-uploader__list {
  margin-top: calc(var(--file-uploader-spacing) * 2);
}

.file-uploader__total-progress {
  margin-bottom: var(--file-uploader-spacing);
}

.file-uploader__item {
  background-color: var(--file-uploader-bg-color);
  border-radius: var(--file-uploader-border-radius);
  padding: var(--file-uploader-spacing);
  margin-bottom: calc(var(--file-uploader-spacing) * 0.5);
  box-shadow: var(--file-uploader-shadow);
}

.file-uploader__item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: calc(var(--file-uploader-spacing) * 0.5);
}

.file-uploader__item-name {
  font-weight: 500;
  color: var(--file-uploader-text-color);
}

.file-uploader__item-size {
  color: var(--file-uploader-secondary-text);
}

.file-uploader__progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--file-uploader-border-color);
  border-radius: calc(var(--file-uploader-border-radius) * 0.5);
  overflow: hidden;
}

.file-uploader__progress-fill {
  height: 100%;
  background-color: var(--file-uploader-primary-color);
  transition: width 0.3s ease;
}

.file-uploader__progress-text {
  margin-top: calc(var(--file-uploader-spacing) * 0.25);
  font-size: 0.875rem;
  color: var(--file-uploader-secondary-text);
}

.file-uploader__item-actions {
  display: flex;
  gap: calc(var(--file-uploader-spacing) * 0.5);
  margin-top: calc(var(--file-uploader-spacing) * 0.5);
}

.file-uploader__btn {
  padding: calc(var(--file-uploader-spacing) * 0.25) calc(var(--file-uploader-spacing) * 0.75);
  border-radius: var(--file-uploader-border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  border: none;
  transition: background-color 0.3s;
}

.file-uploader__btn--upload {
  background-color: var(--file-uploader-primary-color);
  color: var(--file-uploader-bg-color);
}

.file-uploader__btn--upload:hover {
  background-color: var(--file-uploader-primary-hover);
}

.file-uploader__btn--remove {
  background-color: var(--file-uploader-danger-color);
  color: var(--file-uploader-bg-color);
}

.file-uploader__btn--remove:hover {
  background-color: var(--file-uploader-danger-hover);
}
</style>