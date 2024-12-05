<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title>File Management</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="file"
              label="Select file"
              show-size
              truncate-length="25"
              @change="handleFileChange"
            ></v-file-input>

            <v-btn
              color="primary"
              :disabled="!file"
              :loading="uploading"
              @click="uploadFile"
              class="mr-4"
            >
              Send
            </v-btn>

            <v-btn
              v-if="uploadedFileUrl"
              color="success"
              @click="downloadFile"
              :loading="downloading"
            >
              Download
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FileManagement',

  data: () => ({
    file: null,
    uploading: false,
    downloading: false,
    uploadedFileUrl: null,
  }),

  methods: {
    handleFileChange() {
      this.uploadedFileUrl = null;
    },

    async uploadFile() {
      if (!this.file) return;

      this.uploading = true;
      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const response = await axios.post(
          'https://api.escuelajs.co/api/v1/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        this.uploadedFileUrl = response.data.location;
        this.$root.$emit('showSnackbar', {
          text: 'File uploaded successfully',
          color: 'success',
        });
      } catch (error) {
        this.$root.$emit('showSnackbar', {
          text: 'Error uploading file',
          color: 'error',
        });
      }
      this.uploading = false;
    },

    async downloadFile() {
      if (!this.uploadedFileUrl) return;

      this.downloading = true;
      try {
        const response = await axios({
          url: this.uploadedFileUrl,
          method: 'GET',
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', this.file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.$root.$emit('showSnackbar', {
          text: 'File downloaded successfully',
          color: 'success',
        });
      } catch (error) {
        this.$root.$emit('showSnackbar', {
          text: 'Error downloading file',
          color: 'error',
        });
      }
      this.downloading = false;
    },
  },
};
</script>
