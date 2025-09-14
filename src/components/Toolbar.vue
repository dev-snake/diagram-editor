<template>
  <div class="h-12 bg-gray-50 border-b border-gray-300 flex items-center px-4 justify-between">
    <div class="flex items-center space-x-4">
      <h1 class="text-lg font-semibold text-gray-800">Diagram Editor</h1>
      <div class="text-sm text-gray-600">Zoom: {{ Math.round(scale * 100) }}%</div>
    </div>

    <div class="flex items-center space-x-2">
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
}

defineProps<Props>()

defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'reset-zoom': []
  'clear-canvas': []
}>()
</script>
