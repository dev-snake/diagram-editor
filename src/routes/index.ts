import { createWebHistory, createRouter } from 'vue-router'
import { authGuard, guestGuard } from '../utils/authGuard'

const routes = [
  {
    path: '/',
    component: () => import('@/Index.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/login',
    component: () => import('@/pages/Login/Login.vue'),
    beforeEnter: guestGuard,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
