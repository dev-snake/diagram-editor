<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Canvas Area -->
    <div class="flex-1 flex flex-col">
      <!-- Toolbar -->
      <Toolbar
        :scale="canvasScale"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @reset-zoom="handleResetZoom"
        @clear-canvas="handleClearCanvas"
      />

      <!-- Canvas -->
      <div class="flex-1">
        <Canvas ref="canvasRef" @scale-change="handleScaleChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Canvas from './components/Canvas.vue'
import Toolbar from './components/Toolbar.vue'

const canvasRef = ref()
const canvasScale = ref(1)

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
</script>
