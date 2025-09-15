<template>
  <div class="flex h-screen w-screen overflow-hidden select-none">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Canvas Area -->
    <div class="flex-1 flex flex-col">
      <!-- Toolbar -->
      <Toolbar
        :scale="canvasScale"
        :canGroup="canvasRef?.canGroupSelectedComponents"
        :hasSelectedGroup="!!canvasRef?.selectedGroup"
        :hasComponentsToGroup="hasComponentsToGroup"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @reset-zoom="handleResetZoom"
        @clear-canvas="handleClearCanvas"
        @create-group="handleCreateGroup"
        @ungroup="handleUngroup"
        @select-all-and-group="handleSelectAllAndGroup"
      />

      <!-- :selectedInfo="getSelectionInfo()"  -->
      <!-- Canvas -->
      <div class="flex-1 canvas-area">
        <Canvas ref="canvasRef" @scale-change="handleScaleChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Canvas from './components/Canvas.vue'
import Toolbar from './components/Toolbar.vue'

const canvasRef = ref()
const canvasScale = ref(1)

// Computed property to check if there are components that can be grouped
const hasComponentsToGroup = computed(() => {
  if (!canvasRef.value) return false
  // This would need to be exposed from Canvas component
  // For now, we'll assume there are components if canvas exists
  return true
})

// Prevent context menu on right click only in canvas area (except for canvas components)
const preventContextMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const isInCanvas = target.closest('.canvas-area') // Check if click is in canvas area
  const isCanvasComponent = target.closest('[data-canvas-component]')

  // Only prevent context menu if clicking in canvas area but not on canvas components
  if (isInCanvas && !isCanvasComponent) {
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('contextmenu', preventContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', preventContextMenu)
})

const handleScaleChange = (scale: number) => {
  canvasScale.value = scale
}

const handleZoomIn = () => {
  if (canvasRef.value) {
    canvasRef.value.zoomIn()
  }
}

const handleZoomOut = () => {
  if (canvasRef.value) {
    canvasRef.value.zoomOut()
  }
}

const handleResetZoom = () => {
  if (canvasRef.value) {
    canvasRef.value.resetZoom()
  }
}

const handleClearCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.clearCanvas()
  }
}

const handleCreateGroup = () => {
  if (canvasRef.value) {
    canvasRef.value.createGroup()
  }
}

const handleUngroup = () => {
  if (canvasRef.value) {
    canvasRef.value.ungroupComponents()
  }
}

const handleSelectAllAndGroup = () => {
  if (canvasRef.value) {
    canvasRef.value.selectAllComponents()
  }
}

const getSelectionInfo = () => {
  if (!canvasRef.value) return ''

  const selectedComponents = canvasRef.value.selectedComponents
  const selectedGroup = canvasRef.value.selectedGroup

  if (selectedGroup) {
    return `Group selected (${selectedGroup.components.length} items)`
  }

  if (selectedComponents?.length > 0) {
    return `${selectedComponents.length} item${selectedComponents.length > 1 ? 's' : ''} selected`
  }

  return ''
}
</script>
