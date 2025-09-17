<template>
  <div class="h-12 bg-gray-50 border-b border-gray-300 flex items-center px-4 justify-between">
    <div class="flex items-center space-x-4">
      <!-- <h1 class="text-lg font-semibold text-gray-800">Diagram Editor</h1> -->
      <div class="text-sm text-gray-600">Zoom: {{ Math.round(scale * 100) }}%</div>
    </div>

    <div class="flex items-center space-x-2">
      <!-- Group/Ungroup controls -->
      <div class="flex items-center space-x-1 mr-4">
        <button
          @click="$emit('create-group')"
          :disabled="!canGroup"
          class="px-3 py-1 text-sm bg-purple-50 border border-purple-300 text-purple-700 rounded hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Group selected elements (Ctrl+G) - Select 2+ items first"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Group
        </button>

        <button
          @click="$emit('ungroup')"
          :disabled="!hasSelectedGroup"
          class="px-3 py-1 text-sm bg-purple-50 border border-purple-300 text-purple-700 rounded hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ungroup selected group (Ctrl+U) - Click on group border to select"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Ungroup
        </button>

        <button
          @click="$emit('select-all-and-group')"
          :disabled="!hasComponentsToGroup"
          class="px-3 py-1 text-sm bg-blue-50 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Select all elements and group them (Ctrl+A)"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14-7l2 2-2 2m0 8l2 2-2 2"
            />
          </svg>
          Select All & Group
        </button>
      </div>

      <!-- Save/Load controls -->
      <div class="flex items-center space-x-1 mr-4">
        <button
          @click="$emit('save-config')"
          class="px-3 py-1 text-sm bg-blue-50 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          title="Lưu cấu hình hiện tại (Ctrl+S)"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Lưu
        </button>

        <button
          @click="$emit('load-config')"
          class="px-3 py-1 text-sm bg-green-50 border border-green-300 text-green-700 rounded hover:bg-green-100 transition-colors"
          title="Tải cấu hình đã lưu (Ctrl+O)"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3-3m3 3v8"
            />
          </svg>
          Tải
        </button>
      </div>

      <!-- Selection info -->
      <div v-if="selectedInfo" class="text-sm text-gray-600 mr-4">
        {{ selectedInfo }}
      </div>

      <!-- Zoom controls -->
      <button
        @click="$emit('zoom-out')"
        class="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        :disabled="scale <= 0.1"
      >
        -
      </button>

      <span class="text-sm text-gray-600 min-w-12 text-center">
        {{ Math.round(scale * 100) }}%
      </span>

      <button
        @click="$emit('zoom-in')"
        class="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        :disabled="scale >= 3"
      >
        +
      </button>

      <button
        @click="$emit('reset-zoom')"
        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors ml-2"
      >
        Reset
      </button>

      <!-- Clear canvas -->
      <button
        @click="$emit('clear-canvas')"
        class="px-3 py-1 text-sm bg-red-50 border border-red-300 text-red-700 rounded hover:bg-red-100 transition-colors ml-4"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  scale: number
  canGroup?: boolean
  hasSelectedGroup?: boolean
  hasComponentsToGroup?: boolean
  selectedInfo?: string
}

defineProps<Props>()

defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'reset-zoom': []
  'clear-canvas': []
  'create-group': []
  ungroup: []
  'select-all-and-group': []
  'save-config': []
  'load-config': []
}>()
</script>
