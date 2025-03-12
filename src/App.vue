<script setup lang="ts">
import FileUploader from './components/FileUploader.vue';
</script>

<template>
  <div class="container">
    <h1>Advanced File Upload Demo</h1>
    <FileUploader
      uploadUrl="/api/upload"
      :maxFileSize="1024 * 1024 * 1024"
      :allowedTypes="['image/*', 'application/pdf']"
      :autoUpload="true"
    />
  </div>
</template>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}
</style>