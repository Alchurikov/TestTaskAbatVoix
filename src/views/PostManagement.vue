<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-btn color="primary" @click="openAddDrawer" class="mb-4">
          Add Post
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="posts"
      :loading="loading"
      :options.sync="options"
      :server-items-length="totalPosts"
      :items-per-page="10"
      @click:row="openEditDrawer"
    >
      <template slot="item.actions" slot-scope="{ item }">
        <v-icon small class="mr-2" @click.stop="deletePost(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <v-navigation-drawer v-model="drawer" fixed right temporary width="400">
      <v-card flat>
        <v-card-title>
          {{ editMode ? 'Edit Post' : 'Add New Post' }}
          <v-spacer></v-spacer>
          <v-btn icon @click="drawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.title"
              label="Title"
              required
            ></v-text-field>
            <v-textarea
              v-model="editedItem.body"
              label="Body"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="savePost" :loading="saving">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Post</v-card-title>
        <v-card-text> Are you sure you want to delete this post? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PostManagement',

  data: () => ({
    headers: [
      { text: 'ID', value: 'id', sortable: false },
      { text: 'Title', value: 'title', sortable: false },
      { text: 'Body', value: 'body', sortable: false },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    allPosts: [],
    posts: [],
    totalPosts: 0,
    loading: false,
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: [],
      sortDesc: [],
    },
    drawer: false,
    editMode: false,
    editedItem: {
      title: '',
      body: '',
    },
    defaultItem: {
      title: '',
      body: '',
    },
    valid: true,
    saving: false,
    deleteDialog: false,
    deleting: false,
    itemToDelete: null,
  }),

  watch: {
    options: {
      handler() {
        this.loadPosts();
      },
      deep: true,
    },
    $route: {
      handler() {
        if (this.$route.name === 'PostManagement') {
          this.loadPosts();
        }
      },
      immediate: true,
    },
  },

  methods: {
    async loadPosts() {
      this.loading = true;
      try {
        if (this.allPosts.length === 0) {
          const response = await axios.get(
            `https://jsonplaceholder.typicode.com/posts`
          );
          this.allPosts = response.data;
          this.totalPosts = this.allPosts.length;
        }

        const { page = 1, itemsPerPage = 10 } = this.options;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        this.posts = this.allPosts.slice(start, end);
      } catch (error) {
        this.$root.$emit('showSnackbar', {
          text: 'Error loading posts',
          color: 'error',
        });
      }
      this.loading = false;
    },

    openAddDrawer() {
      this.editMode = false;
      this.editedItem = { ...this.defaultItem };
      this.drawer = true;
    },

    openEditDrawer(item) {
      this.editMode = true;
      this.editedItem = { ...item };
      this.drawer = true;
    },

    async savePost() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;
      try {
        if (this.editMode) {
          await axios.put(
            `https://jsonplaceholder.typicode.com/posts/${this.editedItem.id}`,
            this.editedItem
          );
          const index = this.posts.findIndex(
            (post) => post.id === this.editedItem.id
          );
          if (index !== -1) this.posts.splice(index, 1, { ...this.editedItem });
        } else {
          const response = await axios.post(
            'https://jsonplaceholder.typicode.com/posts',
            this.editedItem
          );

          const usedIds = this.allPosts.map((post) => post.id);
          let newId = 1;
          while (usedIds.includes(newId)) {
            newId++;
          }

          const newPost = {
            ...response.data,
            id: newId,
          };

          this.allPosts.unshift(newPost);
          this.loadPosts();
        }

        this.drawer = false;
        this.$root.$emit('showSnackbar', {
          text: `Post ${this.editMode ? 'updated' : 'added'} successfully`,
          color: 'success',
        });
      } catch (error) {
        this.$root.$emit('showSnackbar', {
          text: `Error ${this.editMode ? 'updating' : 'adding'} post`,
          color: 'error',
        });
      }
      this.saving = false;
    },

    deletePost(item) {
      this.itemToDelete = item;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      this.deleting = true;
      try {
        await axios.delete(
          `https://jsonplaceholder.typicode.com/posts/${this.itemToDelete.id}`
        );
        const index = this.posts.findIndex(
          (post) => post.id === this.itemToDelete.id
        );
        if (index !== -1) {
          this.posts.splice(index, 1);
          this.totalPosts--;
        }

        this.deleteDialog = false;
        this.$root.$emit('showSnackbar', {
          text: 'Post deleted successfully',
          color: 'success',
        });
      } catch (error) {
        this.$root.$emit('showSnackbar', {
          text: 'Error deleting post',
          color: 'error',
        });
      }
      this.deleting = false;
    },
  },

  created() {
    this.loadPosts();
  },
};
</script>
