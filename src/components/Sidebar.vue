<template>
  <div class="w-64 h-full bg-gray-50 border-r border-gray-300 flex flex-col shadow-sm">
    <!-- Header -->
    <div class="p-4 border-b border-gray-300 bg-white">
      <h2 class="text-lg font-semibold text-gray-800">SCADA Components</h2>
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
    <div class="flex-1 p-3 space-y-3 overflow-y-auto">
      <!-- Process Objects -->
      <div class="space-y-2" v-if="filteredProcessObjects.length > 0">
        <div
          v-for="component in filteredProcessObjects"
          :key="component.type"
          class="draggable-item flex items-center p-2 bg-white border border-gray-200 rounded-md cursor-grab hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
          draggable="true"
          @dragstart="handleDragStart($event, component.type)"
        >
          <div class="w-16 h-10 mr-3 flex items-center justify-center overflow-hidden">
            <div class="scale-75 origin-center">
              <component :is="component.component" />
            </div>
          </div>
          <span class="text-sm text-gray-700 group-hover:text-blue-700">{{ component.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import WaterTank from './WaterTank/WaterTank.vue'
import WaterPump from './WaterPump/WaterPump.vue'
import GateWave from './GateWave/GateWave.vue'
import PressureGauge from './PressureGauge/PressureGauge.vue'
import WaterLevelSensor from './WaterLevelSensor/WaterLevelSensor.vue'
import Device from './device/Device.vue'
import WaterPipe from './WaterPipe/WaterPipe.vue'
import SimplePipe from './SimplePipe/SimplePipe.vue'
import GridSquare from './GridSquare/GridSquare.vue'
import type { ComponentKey } from '@/types/component'

const searchQuery = ref('')

interface ProcessObject {
  type: ComponentKey
  name: string
  component: any
}

const processObjects: ProcessObject[] = [
  { type: 'watertank', name: 'waterTank', component: WaterTank },
  { type: 'waterpumb', name: 'waterpumb', component: WaterPump },
  { type: 'gatewave', name: 'gatewave', component: GateWave },
  { type: 'pressure-gauge', name: 'pressure-gauge', component: PressureGauge },
  { type: 'water-level-sensor', name: 'water-level-sensor', component: WaterLevelSensor },
  { type: 'device', name: 'device', component: Device },
  { type: 'water-pipe', name: 'water-pipe', component: WaterPipe },
  { type: 'pipe', name: 'pipe', component: SimplePipe },
  { type: 'grid-square', name: 'grid-square', component: GridSquare },
]

const filteredProcessObjects = computed(() => {
  if (!searchQuery.value) return processObjects
  return processObjects.filter(
    (component) =>
      component.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      component.type.toLowerCase().includes(searchQuery.value.toLowerCase()),
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
