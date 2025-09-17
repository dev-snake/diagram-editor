<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">{{ modalTitle }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <!-- Component Properties -->
        <div class="space-y-4">
          <!-- Device-specific data (for Device component) -->
          <div v-if="componentData?.type === 'device'" class="border-t pt-4"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ComponentData {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: string
  groupId?: string
}

interface DeviceData {
  temperature?: number
  humidity?: number
  pressure?: number
  voltage?: number
  current?: number
  power?: number
  status?: 'ONLINE' | 'OFFLINE' | 'ERROR'
}

interface Props {
  isVisible: boolean
  componentData?: ComponentData | null
  deviceData?: DeviceData | null
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  componentData: null,
  deviceData: null,
})

const emit = defineEmits<{
  close: []
}>()

const componentTypeMap: Record<string, string> = {
  watertank: 'Bể chứa nước',
  waterpumb: 'Máy bơm nước',
  gatewave: 'Van cổng',
  'pressure-gauge': 'Đồng hồ áp suất',
  'water-level-sensor': 'Cảm biến mức nước',
  device: 'Thiết bị IoT',
  'water-pipe': 'Ống nước',
  pipe: 'Ống dẫn',
  'grid-square': 'Ô lưới',
}

const componentTypeDisplay = computed(() => {
  return (
    componentTypeMap[props.componentData?.type || ''] ||
    props.componentData?.type ||
    'Không xác định'
  )
})

const modalTitle = computed(() => {
  return `Thông tin ${componentTypeDisplay.value}`
})

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
