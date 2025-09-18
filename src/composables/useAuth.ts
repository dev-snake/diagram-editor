import { useCookie } from './useCookie'
import type { UserData, UserAbilityRules, AuthResponse } from '../types/component'

export const useAuth = () => {
  // Các cookie để lưu trữ thông tin auth
  const accessToken = useCookie<string>('accessToken', {
    default: () => '',
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
    secure: true,
    sameSite: 'strict',
  })

  const userData = useCookie<UserData | null>('userData', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
    secure: true,
    sameSite: 'strict',
  })

  const userAbilityRules = useCookie<UserAbilityRules | null>('userAbilityRules', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
    secure: true,
    sameSite: 'strict',
  })

  // Hàm để lưu thông tin auth từ API response
  const saveAuthData = (authResponse: AuthResponse) => {
    accessToken.value = authResponse.accessToken
    userData.value = authResponse.userData
    userAbilityRules.value = authResponse.userAbilityRules
  }

  // Hàm để xóa thông tin auth (logout)
  const clearAuthData = () => {
    accessToken.value = ''
    userData.value = null
    userAbilityRules.value = null
  }

  // Hàm kiểm tra user đã đăng nhập chưa
  const isAuthenticated = () => {
    return !!accessToken.value && !!userData.value
  }

  // Hàm lấy permissions của user
  const getUserPermissions = (): string[] => {
    if (!userData.value?.permissions) return []
    try {
      return JSON.parse(userData.value.permissions)
    } catch {
      return []
    }
  }

  // Hàm kiểm tra user có permission cụ thể không
  const hasPermission = (permission: string): boolean => {
    const permissions = getUserPermissions()
    return permissions.includes(permission)
  }

  // Hàm lấy thông tin user hiện tại
  const getCurrentUser = () => {
    return userData.value
  }

  // Hàm lấy access token
  const getAccessToken = () => {
    return accessToken.value
  }

  return {
    accessToken,
    userData,
    userAbilityRules,
    saveAuthData,
    clearAuthData,
    isAuthenticated,
    getUserPermissions,
    hasPermission,
    getCurrentUser,
    getAccessToken,
  }
}
