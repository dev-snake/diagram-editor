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
      <div ref="scrollContainer" class="px-6 py-4 flex-1 overflow-y-auto" @scroll="handleScroll">
        <div class="space-y-6" v-if="componentData">
          <!-- Device Type -->
          <template v-if="componentData.type === 'device'">
            <div>
              <h3 class="text-lg font-semibold text-blue-700 mb-3">Danh sách thiết bị</h3>
              <ul class="divide-y divide-gray-100">
                <li v-for="i in items" :key="i.id" class="py-3 flex items-center justify-between">
                  <span class="font-medium text-gray-800">{{ i.displayName }}</span>
                </li>
              </ul>
            </div>
          </template>

          <!-- Pressure Meter Type -->
          <template v-else-if="componentData.type === 'pressure-meter'">
            <div>
              <div
                v-for="i in items"
                :key="i.id"
                class="border border-gray-200 rounded-lg p-4 mb-4 hover:cursor-pointer"
                @click="handleSelect(i.vgaData)"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-800">{{ i.displayName }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <span class="font-semibold">Q_TONG:</span>
                    <span>{{ i.vgaData.Q_TONG ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="font-semibold">Áp suất trước van:</span>
                    <span>{{ i.vgaData.pressureBeforeValve ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="font-semibold">Áp suất sau van :</span>
                    <span>{{ i.vgaData.pressureAfterValve ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="font-semibold">Lưu lượng nước:</span>
                    <span>{{ i.vgaData.waterflow ?? '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading && items.length > 0" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>

        <!-- No more data indicator -->
        <div v-if="!hasMore && items.length > 0" class="text-center py-4 text-gray-500 text-sm">
          Đã tải hết dữ liệu
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
import { useApi } from '@/utils/useApi'
import { computed, onMounted, watch, inject, ref } from 'vue'
import type { ICanvasState } from './Canvas.vue'

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
const canvasState = inject<ICanvasState>('canvasState')
console.log('[provide]', canvasState)
const items = ref<any[]>([])
const emit = defineEmits<{
  close: []
}>()

// Pagination state
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(false)
const hasMore = computed(() => currentPage.value < totalPages.value)

// Scroll handling
const scrollContainer = ref<HTMLElement>()

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // Check if scrolled to bottom (with a small threshold)
  const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10

  if (isNearBottom && hasMore.value && !isLoading.value) {
    loadMoreData()
  }
}

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
const { request } = useApi()

const loadData = async (type: ComponentKey, resetData = true) => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    const response = await request.get(`${type}`, {
      page: currentPage.value,
      perPage: 10,
      sort: 'DESC',
      keyword: '',
      type: 'VGA',
      roleId: '',
    })

    // Update pagination info
    totalPages.value = response.meta.totalPage || 1

    if (resetData) {
      items.value = response.data || []
    } else {
      items.value = [...items.value, ...(response.data || [])]
    }

    console.log('Loaded data:', response.data)
    return response
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadMoreData = async () => {
  if (!hasMore.value || isLoading.value) return

  currentPage.value += 1
  const type = props.componentData?.type as ComponentKey
  if (componentTypeMap[type]) {
    await loadData(type, false) // false means append to existing data
  }
}
const handleSelect = (data: any) => {
  console.log(data)
  if (!canvasState) return
  switch (props.componentData?.type as ComponentKey) {
    case 'watertank':
    case 'waterpumb':
    case 'gatewave':
    case 'pressure-gauge':
    case 'water-level-sensor':
    case 'device':
    case 'water-pipe':
    case 'pipe':
    case 'grid-square':
    case 'pressure-meter':
      const idx = canvasState?.components.findIndex(
        (c) => c.component_id === props.componentData?.component_id,
      )
      if (idx !== -1) {
        canvasState.components[idx] = {
          ...canvasState.components[idx],
          data,
        }
      }
      console.log(canvasState)
      break
    default:
      break
  }
}
watch(
  () => props.isVisible,
  async () => {
    if (props.isVisible) {
      const type = props.componentData?.type as ComponentKey
      if (!componentTypeMap[type]) return

      // Reset pagination when modal opens
      currentPage.value = 1
      totalPages.value = 1
      items.value = []

      await loadData(type, true) // true means reset data
    }
  },
)
onMounted(() => {
  console.log(props, 'props in modal')
})
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
