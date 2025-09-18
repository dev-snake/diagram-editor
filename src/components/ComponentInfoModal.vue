<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
    @click="handleBackdropClick"
    @wheel.prevent
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
      @click.stop
      @wheel.stop
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0"
      >
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
      <div class="px-6 py-4 flex-1 overflow-y-auto">
        <!-- Component Properties -->
        <div class="space-y-4" v-if="componentData">
          <!-- items  -->
          <!--  -->
          <template v-if="componentData.type === 'device'">
            <div>
              <div v-for="(i, key) in items" :key="i.id">
                {{ i.displayName }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Đóng
        </button>
        <button class="px-6 py-2 text-sm font-medium text-white border rounded-sm bg-blue-400">
          Lưu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentData, ComponentKey } from '@/types/component'
import { computed, onMounted, watch, inject, ref } from 'vue'

interface Props {
  isVisible: boolean
  componentData?: ComponentData | null
  deviceData?: any | null
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  componentData: null,
  deviceData: null,
})
const canvasState = inject<CanvasState>('canvasState')
const items = ref<any[]>([])
const emit = defineEmits<{
  close: []
}>()

const componentTypeMap: Record<ComponentKey, string> = {
  watertank: 'Bể chứa nước',
  waterpumb: 'Máy bơm nước',
  gatewave: 'Van cổng',
  'pressure-gauge': 'Đồng hồ áp suất',
  'water-level-sensor': 'Cảm biến mức nước',
  device: 'Thiết bị IoT',
  'water-pipe': 'Ống nước',
  pipe: 'Ống dẫn',
  'grid-square': 'Ô lưới',
  'pressure-meter': 'Áp suất',
}

const componentTypeDisplay = computed(() => {
  return (
    componentTypeMap[props.componentData?.type as ComponentKey] ||
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
// Map type -> endpoint
const baseURL = 'http://localhost:8998/v1'
const apiMap: Record<ComponentKey, string> = {
  watertank: 'https://api.example.com/watertank',
  waterpumb: 'https://api.example.com/waterpumb',
  gatewave: 'https://api.example.com/gatewave',
  'pressure-gauge': 'https://api.example.com/pressure-gauge',
  'water-level-sensor': 'https://api.example.com/water-level-sensor',
  device: `${baseURL}/device`,
  'water-pipe': 'https://api.example.com/water-pipe',
  pipe: 'https://api.example.com/pipe',
  'grid-square': 'https://api.example.com/grid-square',
  'pressure-meter': 'https://api.example.com/grid-square',
}

const fetchData = async (type: ComponentKey) => {
  const url = apiMap[type]
  if (!url) {
    console.warn(`❌ No endpoint for type: ${type}`)
    return null
  }

  try {
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZkYjlhZTk5LThmNDAtNGY4YS1iNTVlLTJjODQzOTdhNDVhMyIsImVtYWlsIjoic3VwZXJhZG1pbnNhaWdvbnZhbHZlQGdtYWlsLmNvbSIsInRva2VuSWQiOiI2YzNmOTYwZS05ZmQ3LTQ0NTUtYjhmZC1lYzA3MTQwMjhmZDEiLCJpYXQiOjE3NTgwOTYxODcsImV4cCI6MTAwMTc1ODA5NjE4Nn0._621odsO-7BMC-iRM13Iqjl-SZZisLeq-I6sxVpZZ-4'
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }

    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('❌ Fetch error:', err)
    return null
  }
}

const loadData = (type: ComponentKey) => fetchData(type)

watch(
  () => props.isVisible,
  async () => {
    const type = props.componentData?.type as ComponentKey
    if (!componentTypeMap[type]) return
    const data = await loadData(type)
    items.value = data.data
    console.log(data.data, '[Data]')
  },
)

onMounted(() => {})
</script>

<style scoped>
/* Ensure smooth scrolling and prevent zoom issues */
.modal-content {
  overscroll-behavior: contain;
}

/* Custom scrollbar styling for better UX */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
