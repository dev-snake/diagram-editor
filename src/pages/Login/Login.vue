<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-semibold text-center mb-6">Đăng nhập</h1>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
      >
        {{ errorMessage }}
      </div>

      <input
        type="text"
        v-model="form.emailOrUsername"
        placeholder="Tên đăng nhập"
        :disabled="loading"
        class="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />

      <input
        type="password"
        v-model="form.password"
        placeholder="Mật khẩu"
        :disabled="loading"
        @keyup.enter="onSubmit"
        class="w-full mb-6 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />

      <button
        @click="onSubmit"
        :disabled="loading"
        class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Đang đăng nhập...</span>
        <span v-else>Đăng nhập</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { saveAuthData } = useAuth()

const form = reactive({
  emailOrUsername: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  if (!form.emailOrUsername || !form.password) {
    errorMessage.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:8998/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: form.emailOrUsername,
        password: form.password,
      }),
    })

    if (!response.ok) {
      throw new Error('Đăng nhập thất bại')
    }

    const authData = await response.json()

    // Lưu dữ liệu auth vào cookie
    saveAuthData(authData)

    // Chuyển hướng về trang chính hoặc dashboard
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Đã có lỗi xảy ra'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
