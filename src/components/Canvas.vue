<template>
  <div
    ref="canvasContainer"
    class="relative w-full h-full overflow-hidden bg-white"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @click="handleCanvasClick"
    @drop="handleDrop"
    @dragover="handleDragOver"
  >
    <!-- Grid Pattern -->
    <div class="absolute inset-0 pointer-events-none" :style="gridStyle"></div>

    <!-- Canvas Content -->
    <div
      ref="canvasContent"
      class="absolute origin-top-left transition-transform duration-100"
      :style="contentStyle"
    >
      <!-- Dropped Components -->
      <div
        v-for="component in components"
        :key="component.id"
        :style="{
          position: 'absolute',
          left: component.x + 'px',
          top: component.y + 'px',
          width: component.width + 'px',
          height: component.height + 'px',
          zIndex: 10,
        }"
        :class="{
          'ring-2 ring-blue-400 ring-opacity-50':
            isResizing && selectedComponent?.id === component.id,
        }"
        class="select-none"
        @mousedown="startDragComponent($event, component)"
      >
        <component-shape
          :type="component.type"
          :width="component.width"
          :height="component.height"
          :selected="selectedComponent?.id === component.id"
          @click="selectComponent(component)"
        />

        <!-- Resize handles for selected component -->
        <div
          v-if="selectedComponent?.id === component.id"
          class="absolute inset-0 pointer-events-none"
        >
          <!-- Corner handles -->
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-nw-resize"
            style="left: -4px; top: -4px"
            @mousedown="startResize($event, component, 'nw')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-ne-resize"
            style="right: -4px; top: -4px"
            @mousedown="startResize($event, component, 'ne')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-se-resize"
            style="right: -4px; bottom: -4px"
            @mousedown="startResize($event, component, 'se')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-sw-resize"
            style="left: -4px; bottom: -4px"
            @mousedown="startResize($event, component, 'sw')"
          ></div>

          <!-- Edge handles -->
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-n-resize"
            style="left: 50%; top: -4px; transform: translateX(-50%)"
            @mousedown="startResize($event, component, 'n')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-e-resize"
            style="right: -4px; top: 50%; transform: translateY(-50%)"
            @mousedown="startResize($event, component, 'e')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-s-resize"
            style="left: 50%; bottom: -4px; transform: translateX(-50%)"
            @mousedown="startResize($event, component, 's')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-w-resize"
            style="left: -4px; top: 50%; transform: translateY(-50%)"
            @mousedown="startResize($event, component, 'w')"
          ></div>

          <!-- Dimension display when resizing -->
          <div
            v-if="isResizing && selectedComponent?.id === component.id"
            class="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none"
            style="top: -30px; left: 50%; transform: translateX(-50%); white-space: nowrap"
          >
            {{ component.width }} × {{ component.height }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ComponentShape from './ComponentShape.vue'

interface DroppedComponent {
  id: number
  type: string
  x: number
  y: number
  width: number
  height: number
}

const emit = defineEmits<{
  'scale-change': [scale: number]
}>()

const canvasContainer = ref<HTMLElement>()
const canvasContent = ref<HTMLElement>()

// Canvas state
const scale = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// Grid settings
const gridSize = 20
const minScale = 0.1
const maxScale = 3

// Components
const components = ref<DroppedComponent[]>([])
const selectedComponent = ref<DroppedComponent | null>(null)
const isDraggingComponent = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// Resize state
const isResizing = ref(false)
const resizeHandle = ref<string>('')
const resizeStartPos = ref({ x: 0, y: 0 })
const resizeStartSize = ref({ width: 0, height: 0, x: 0, y: 0 })

// Grid style computed property
const gridStyle = computed(() => {
  const size = gridSize * scale.value
  const offsetX = panX.value % size
  const offsetY = panY.value % size

  return {
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    opacity: 0.5,
  }
})

// Content transform style
const contentStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
}))

// Mouse wheel zoom
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (!rect) return

  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(minScale, Math.min(maxScale, scale.value * scaleFactor))

  if (newScale !== scale.value) {
    // Zoom towards mouse position
    const scaleChange = newScale / scale.value
    panX.value = mouseX - (mouseX - panX.value) * scaleChange
    panY.value = mouseY - (mouseY - panY.value) * scaleChange
    scale.value = newScale
    emit('scale-change', newScale)
  }
}

// Panning functionality
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0 && !isDraggingComponent.value && !isResizing.value) {
    // Left mouse button
    isPanning.value = true
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isPanning.value) {
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value

    panX.value += deltaX
    panY.value += deltaY

    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
  }
}

const handleMouseUp = () => {
  isPanning.value = false
  isDraggingComponent.value = false
  isResizing.value = false
}

// Handle canvas click to deselect components
const handleCanvasClick = (event: MouseEvent) => {
  // Only deselect if clicking directly on the canvas (not on components)
  const target = event.target as HTMLElement
  if (target === canvasContainer.value || target === canvasContent.value) {
    selectedComponent.value = null
  }
}

// Drag and drop functionality
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()

  const data = event.dataTransfer?.getData('application/json')
  if (!data) return

  try {
    const componentData = JSON.parse(data)
    const rect = canvasContainer.value?.getBoundingClientRect()

    if (rect) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (event.clientX - rect.left - panX.value) / scale.value
      const canvasY = (event.clientY - rect.top - panY.value) / scale.value

      // Snap to grid
      const snappedX = Math.round(canvasX / gridSize) * gridSize
      const snappedY = Math.round(canvasY / gridSize) * gridSize

      // Default dimensions based on component type (snap to grid)
      const getDefaultDimensions = (type: string) => {
        switch (type) {
          case 'rectangle':
            return { width: 80, height: 40 } // 4 grid units x 2 grid units
          case 'circle':
            return { width: 60, height: 60 } // 3 grid units x 3 grid units
          case 'triangle':
            return { width: 60, height: 60 } // 3 grid units x 3 grid units
          case 'textbox':
            return { width: 100, height: 40 } // 5 grid units x 2 grid units
          default:
            return { width: 60, height: 60 }
        }
      }

      const defaultDimensions = getDefaultDimensions(componentData.type)

      const newComponent: DroppedComponent = {
        id: componentData.id,
        type: componentData.type,
        x: snappedX,
        y: snappedY,
        width: defaultDimensions.width,
        height: defaultDimensions.height,
      }

      components.value.push(newComponent)
      selectedComponent.value = newComponent
    }
  } catch (error) {
    console.error('Failed to parse drop data:', error)
  }
}

// Component selection and dragging
const selectComponent = (component: DroppedComponent) => {
  selectedComponent.value = component
}

const startDragComponent = (event: MouseEvent, component: DroppedComponent) => {
  event.stopPropagation()
  event.preventDefault()

  selectedComponent.value = component
  isDraggingComponent.value = true

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (rect) {
    const canvasX = (event.clientX - rect.left - panX.value) / scale.value
    const canvasY = (event.clientY - rect.top - panY.value) / scale.value

    dragOffset.value = {
      x: canvasX - component.x,
      y: canvasY - component.y,
    }
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDraggingComponent.value || !selectedComponent.value) return

    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      const canvasX = (e.clientX - rect.left - panX.value) / scale.value
      const canvasY = (e.clientY - rect.top - panY.value) / scale.value

      // Snap to grid
      const snappedX = Math.round((canvasX - dragOffset.value.x) / gridSize) * gridSize
      const snappedY = Math.round((canvasY - dragOffset.value.y) / gridSize) * gridSize

      selectedComponent.value.x = snappedX
      selectedComponent.value.y = snappedY
    }
  }

  const handleDragEnd = () => {
    isDraggingComponent.value = false
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

// Component resizing
const startResize = (event: MouseEvent, component: DroppedComponent, handle: string) => {
  event.stopPropagation()
  event.preventDefault()

  selectedComponent.value = component
  isResizing.value = true
  resizeHandle.value = handle

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (rect) {
    resizeStartPos.value = {
      x: (event.clientX - rect.left - panX.value) / scale.value,
      y: (event.clientY - rect.top - panY.value) / scale.value,
    }

    resizeStartSize.value = {
      width: component.width,
      height: component.height,
      x: component.x,
      y: component.y,
    }
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.value || !selectedComponent.value) return

    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      const currentX = (e.clientX - rect.left - panX.value) / scale.value
      const currentY = (e.clientY - rect.top - panY.value) / scale.value

      const deltaX = currentX - resizeStartPos.value.x
      const deltaY = currentY - resizeStartPos.value.y

      let newWidth = resizeStartSize.value.width
      let newHeight = resizeStartSize.value.height
      let newX = resizeStartSize.value.x
      let newY = resizeStartSize.value.y

      // Calculate new dimensions based on resize handle
      switch (resizeHandle.value) {
        case 'nw': // Northwest
          newWidth = resizeStartSize.value.width - deltaX
          newHeight = resizeStartSize.value.height - deltaY
          newX = resizeStartSize.value.x + deltaX
          newY = resizeStartSize.value.y + deltaY
          break
        case 'ne': // Northeast
          newWidth = resizeStartSize.value.width + deltaX
          newHeight = resizeStartSize.value.height - deltaY
          newY = resizeStartSize.value.y + deltaY
          break
        case 'se': // Southeast
          newWidth = resizeStartSize.value.width + deltaX
          newHeight = resizeStartSize.value.height + deltaY
          break
        case 'sw': // Southwest
          newWidth = resizeStartSize.value.width - deltaX
          newHeight = resizeStartSize.value.height + deltaY
          newX = resizeStartSize.value.x + deltaX
          break
        case 'n': // North
          newHeight = resizeStartSize.value.height - deltaY
          newY = resizeStartSize.value.y + deltaY
          break
        case 'e': // East
          newWidth = resizeStartSize.value.width + deltaX
          break
        case 's': // South
          newHeight = resizeStartSize.value.height + deltaY
          break
        case 'w': // West
          newWidth = resizeStartSize.value.width - deltaX
          newX = resizeStartSize.value.x + deltaX
          break
      }

      // Enforce minimum size
      const minSize = gridSize
      newWidth = Math.max(minSize, newWidth)
      newHeight = Math.max(minSize, newHeight)

      // Snap to grid
      newWidth = Math.round(newWidth / gridSize) * gridSize
      newHeight = Math.round(newHeight / gridSize) * gridSize
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize

      // Update component
      selectedComponent.value.width = newWidth
      selectedComponent.value.height = newHeight
      selectedComponent.value.x = newX
      selectedComponent.value.y = newY
    }
  }

  const handleResizeEnd = () => {
    isResizing.value = false
    resizeHandle.value = ''
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
}

// Click outside to deselect (simplified)
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    if (!canvasContainer.value?.contains(event.target as Node)) {
      selectedComponent.value = null
    }
  }

  document.addEventListener('click', handleClickOutside)

  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})

// Exposed methods for parent component
const zoomIn = () => {
  const newScale = Math.min(maxScale, scale.value * 1.1)
  if (newScale !== scale.value) {
    scale.value = newScale
    emit('scale-change', newScale)
  }
}

const zoomOut = () => {
  const newScale = Math.max(minScale, scale.value * 0.9)
  if (newScale !== scale.value) {
    scale.value = newScale
    emit('scale-change', newScale)
  }
}

const resetZoom = () => {
  scale.value = 1
  panX.value = 0
  panY.value = 0
  emit('scale-change', 1)
}

const clearCanvas = () => {
  components.value = []
  selectedComponent.value = null
}

defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  clearCanvas,
})
</script>

<style scoped>
.canvas-container {
  cursor: grab;
}

.canvas-container:active {
  cursor: grabbing;
}
</style>
