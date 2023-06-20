import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('@/pages/home/Home.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
