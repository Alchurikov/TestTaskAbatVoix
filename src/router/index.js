import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/one',
  },
  {
    path: '/one',
    name: 'PostManagement',
    component: () => import('../views/PostManagement.vue'),
    meta: { title: 'Post Management' },
  },
  {
    path: '/two',
    name: 'FileManagement',
    component: () => import('../views/FileManagement.vue'),
    meta: { title: 'File Management' },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
