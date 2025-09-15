<template>
  <div
    v-if="visible"
    ref="contextMenu"
    class="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 z-50 min-w-32"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <!-- Group operations -->
    <template v-if="selectedGroup">
      <div
        class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
        @click="handleUngroup"
      >
        <svg
          class="w-4 h-4 mr-2 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Bỏ nhóm
      </div>
      <div
        class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
        @click="handleDeleteGroup"
      >
        <svg
          class="w-4 h-4 mr-2 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Xóa nhóm
      </div>
    </template>

    <!-- Component operations -->
    <template v-else>
      <!-- Group creation -->
      <div
        v-if="canGroup"
        class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
        @click="handleCreateGroup"
      >
        <svg
          class="w-4 h-4 mr-2 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Tạo nhóm
      </div>

      <hr v-if="canGroup" class="my-1 border-gray-200" />

      <div
        class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
        @click="handleDelete"
      >
        <svg
          class="w-4 h-4 mr-2 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Xóa
      </div>
      <div
        class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
        @click="handleDuplicate"
      >
        <svg
          class="w-4 h-4 mr-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Sao chép
      </div>

      <!-- Tùy chọn hướng cho water-pipe -->
      <template v-if="isWaterPipe">
        <hr class="my-1 border-gray-200" />
        <div
          class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
          @click="handleDirectionChange('left')"
        >
          <svg
            class="w-4 h-4 mr-2 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Hướng trái
        </div>
        <div
          class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
          @click="handleDirectionChange('right')"
        >
          <svg
            class="w-4 h-4 mr-2 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          Hướng phải
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'

interface Position {
  x: number
  y: number
}

interface ComponentGroup {
  id: number
  components: number[]
  x: number
  y: number
  width: number
  height: number
}

interface DroppedComponent {
  id: number
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: 'left' | 'right'
  groupId?: number | null
}

const props = defineProps<{
  visible: boolean
  position: Position
  selectedComponent: DroppedComponent | null
  selectedGroup?: ComponentGroup | null
  canGroup?: boolean
}>()

const emit = defineEmits<{
  delete: []
  duplicate: []
  close: []
  'change-direction': [direction: 'left' | 'right']
  'create-group': []
  ungroup: []
  'delete-group': []
}>()

const contextMenu = ref<HTMLElement>()

// Kiểm tra xem component có phải là water-pipe không
const isWaterPipe = computed(() => {
  return props.selectedComponent?.type === 'water-pipe'
})

const handleDelete = () => {
  emit('delete')
  emit('close')
}

const handleDuplicate = () => {
  emit('duplicate')
  emit('close')
}

const handleDirectionChange = (direction: 'left' | 'right') => {
  emit('change-direction', direction)
  emit('close')
}

const handleCreateGroup = () => {
  emit('create-group')
  emit('close')
}

const handleUngroup = () => {
  emit('ungroup')
  emit('close')
}

const handleDeleteGroup = () => {
  emit('delete-group')
  emit('close')
}

// Close context menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (props.visible && contextMenu.value && !contextMenu.value.contains(event.target as Node)) {
    emit('close')
  }
}

// Close context menu when pressing Escape
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

// Adjust position if context menu goes outside viewport
const adjustPosition = async () => {
  if (!props.visible || !contextMenu.value) return

  await nextTick()

  const menu = contextMenu.value
  const rect = menu.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let adjustedX = props.position.x
  let adjustedY = props.position.y

  // Adjust horizontal position
  if (rect.right > viewportWidth) {
    adjustedX = viewportWidth - rect.width - 10
  }

  // Adjust vertical position
  if (rect.bottom > viewportHeight) {
    adjustedY = viewportHeight - rect.height - 10
  }

  // Make sure it doesn't go off the left or top
  adjustedX = Math.max(10, adjustedX)
  adjustedY = Math.max(10, adjustedY)

  if (adjustedX !== props.position.x || adjustedY !== props.position.y) {
    menu.style.left = adjustedX + 'px'
    menu.style.top = adjustedY + 'px'
  }
}

// Watch for visibility changes to adjust position
watch(
  () => props.visible,
  (newVisible: boolean) => {
    if (newVisible) {
      adjustPosition()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* Additional hover effects */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}
</style>
