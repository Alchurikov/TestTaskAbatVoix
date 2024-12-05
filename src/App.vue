<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Content Management</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tabs v-model="activeTab" align-with-title>
        <v-tab
          v-for="tab in availableTabs"
          :key="tab.path"
          :to="tab.path"
          :disabled="!tab.isOpen"
        >
          {{ tab.title }}
          <v-btn
            v-if="tab.isOpen"
            icon
            x-small
            class="ml-2"
            @click.prevent.stop="closeTab(tab)"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-tab>
      </v-tabs>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <v-list v-if="closedTabs.length > 0">
          <v-list-item
            v-for="tab in closedTabs"
            :key="tab.path"
            @click="reopenTab(tab)"
          >
            <v-list-item-title>{{ tab.title }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-list v-else>
          <v-list-item>
            <v-list-item-title>No closed tabs</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view v-if="isCurrentTabOpen"></router-view>
      <v-container v-else fluid class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" class="text-center">
            <v-icon x-large color="grey lighten-1">mdi-tab-remove</v-icon>
            <h2 class="grey--text text--lighten-1 mt-4">Tab is closed</h2>
            <v-btn color="primary" class="mt-4" @click="reopenCurrentTab">
              Reopen Tab
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    activeTab: null,
    tabs: [
      { path: '/one', title: 'Post Management', isOpen: true },
      { path: '/two', title: 'File Management', isOpen: true },
    ],
    snackbar: {
      show: false,
      text: '',
      color: 'success',
    },
  }),

  computed: {
    availableTabs() {
      return this.tabs;
    },
    closedTabs() {
      return this.tabs.filter((tab) => !tab.isOpen);
    },
    isCurrentTabOpen() {
      const currentTab = this.tabs.find((tab) => tab.path === this.$route.path);
      return currentTab && currentTab.isOpen;
    },
  },

  methods: {
    closeTab(tab) {
      const index = this.tabs.findIndex((t) => t.path === tab.path);
      if (index !== -1) {
        this.tabs[index].isOpen = false;

        if (this.$route.path === tab.path) {
          const firstOpenTab = this.tabs.find((t) => t.isOpen);
          if (firstOpenTab) {
            this.$router.push(firstOpenTab.path);
          }
        }
      }
    },

    reopenTab(tab) {
      const index = this.tabs.findIndex((t) => t.path === tab.path);
      if (index !== -1) {
        this.tabs[index].isOpen = true;
        if (this.$route.path !== tab.path) {
          this.$router.push(tab.path);
        }
      }
    },

    reopenCurrentTab() {
      const currentTab = this.tabs.find((tab) => tab.path === this.$route.path);
      if (currentTab) {
        this.reopenTab(currentTab);
      }
    },
  },

  created() {
    this.$root.$on('showSnackbar', ({ text, color = 'success' }) => {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    });
  },
};
</script>
