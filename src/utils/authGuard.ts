import { useAuth } from '../composables/useAuth'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated()) {
    next()
  } else {
    next('/login')
  }
}

export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated()) {
    next()
  } else {
    next('/')
  }
}
