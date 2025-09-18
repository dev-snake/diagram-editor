<template>
  <div class="flex items-center space-x-4">
    <!-- User Avatar -->
    <div class="flex items-center space-x-2">
      <img
        v-if="user?.avatar"
        :src="getAvatarUrl(user.avatar)"
        :alt="user.username"
        class="w-8 h-8 rounded-full object-cover"
      />
      <div v-else class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        <span class="text-gray-600 text-sm font-medium">
          {{ user?.username?.charAt(0).toUpperCase() }}
        </span>
      </div>

      <!-- User Info -->
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900">{{ user?.username }}</span>
        <span class="text-xs text-gray-500">{{ user?.role }}</span>
      </div>
    </div>

    <!-- Logout Button -->
    <button
      @click="handleLogout"
      class="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
    >
      Đăng xuất
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { getCurrentUser, clearAuthData } = useAuth()

const user = computed(() => getCurrentUser())

const getAvatarUrl = (avatar: string) => {
  // Nếu avatar đã là URL đầy đủ thì trả về như vậy
  if (avatar.startsWith('http')) {
    return avatar
  }
  // Nếu không thì ghép với base URL của server
  return `http://localhost:8998${avatar}`
}

const handleLogout = () => {
  clearAuthData()
  router.push('/login')
}
</script>
