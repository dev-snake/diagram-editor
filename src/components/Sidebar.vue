<template>
  <div class="w-64 h-full bg-gray-50 border-r border-gray-300 flex flex-col shadow-sm">
    <!-- Header -->
    <div class="p-4 border-b border-gray-300 bg-white">
      <h2 class="text-lg font-semibold text-gray-800">Components</h2>
      <p class="text-xs text-gray-500 mt-1">Drag & drop to add</p>
    </div>

    <!-- Search -->
    <div class="p-3 bg-white border-b border-gray-200">
      <input
        type="text"
        placeholder="Search components..."
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        v-model="searchQuery"
      />
    </div>

    <!-- Component List -->
    <div class="flex-1 p-4 space-y-4 overflow-y-auto">
      <!-- Shapes Category -->
      <div class="space-y-2" v-if="filteredShapes.length > 0">
        <h3 class="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
            />
          </svg>
          Shapes
        </h3>

        <!-- Rectangle -->
        <div
          v-if="filteredShapes.includes('rectangle')"
          class="draggable-item flex items-center p-3 bg-white border border-gray-200 rounded-md cursor-grab hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
          draggable="true"
          @dragstart="handleDragStart($event, 'rectangle')"
        >
          <div
            class="w-8 h-5 bg-blue-500 rounded-sm mr-3 group-hover:bg-blue-600 transition-colors"
          ></div>
          <span class="text-sm text-gray-700 group-hover:text-blue-700">Rectangle</span>
        </div>

        <!-- Circle -->
        <div
          v-if="filteredShapes.includes('circle')"
          class="draggable-item flex items-center p-3 bg-white border border-gray-200 rounded-md cursor-grab hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
          draggable="true"
          @dragstart="handleDragStart($event, 'circle')"
        >
          <div
            class="w-6 h-6 bg-green-500 rounded-full mr-3 group-hover:bg-green-600 transition-colors"
          ></div>
          <span class="text-sm text-gray-700 group-hover:text-green-700">Circle</span>
        </div>

        <!-- Triangle -->
        <div
          v-if="filteredShapes.includes('triangle')"
          class="draggable-item flex items-center p-3 bg-white border border-gray-200 rounded-md cursor-grab hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
          draggable="true"
          @dragstart="handleDragStart($event, 'triangle')"
        >
          <div
            class="w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-purple-500 mr-3 group-hover:border-b-purple-600 transition-colors"
            style="border-left-width: 12px; border-right-width: 12px; border-bottom-width: 20px"
          ></div>
          <span class="text-sm text-gray-700 group-hover:text-purple-700">Triangle</span>
        </div>
      </div>

      <!-- Text Category -->
      <div class="space-y-2" v-if="filteredText.length > 0">
        <h3 class="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
            />
          </svg>
          Text
        </h3>

        <!-- Text Box -->
        <div
          v-if="filteredText.includes('textbox')"
          class="draggable-item flex items-center p-3 bg-white border border-gray-200 rounded-md cursor-grab hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
          draggable="true"
          @dragstart="handleDragStart($event, 'textbox')"
        >
          <div
            class="w-8 h-5 bg-white border-2 border-gray-400 rounded-sm mr-3 flex items-center justify-center group-hover:border-gray-500 transition-colors"
          >
            <span class="text-xs text-gray-600 font-medium">T</span>
          </div>
          <span class="text-sm text-gray-700 group-hover:text-gray-800">Text Box</span>
        </div>
      </div>

      <!-- No results -->
      <div
        v-if="filteredShapes.length === 0 && filteredText.length === 0 && searchQuery"
        class="text-center py-8"
      >
        <svg
          class="w-12 h-12 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-6v6m-2 0h4"
          />
        </svg>
        <p class="text-sm text-gray-500">No components found</p>
        <p class="text-xs text-gray-400 mt-1">Try a different search term</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')

const shapes = ['rectangle', 'circle', 'triangle']
const textComponents = ['textbox']

const filteredShapes = computed(() => {
  if (!searchQuery.value) return shapes
  return shapes.filter((shape) => shape.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const filteredText = computed(() => {
  if (!searchQuery.value) return textComponents
  return textComponents.filter((component) =>
    component.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const handleDragStart = (event: DragEvent, componentType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: componentType,
        id: Date.now(), // Simple ID generation
      }),
    )
    event.dataTransfer.effectAllowed = 'copy'

    // Add visual feedback
    const target = event.target as HTMLElement
    target.style.opacity = '0.5'

    setTimeout(() => {
      target.style.opacity = '1'
    }, 100)
  }
}
</script>

<style scoped>
.draggable-item:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.draggable-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
