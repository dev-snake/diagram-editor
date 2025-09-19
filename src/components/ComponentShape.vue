<template>
  <div
    class="component-shape cursor-pointer h-full relative"
    :class="{ selected: selected }"
    :style="{ width: width + 'px', height: height + 'px' }"
    @click="$emit('click')"
  >
    <WaterTank
      v-if="type === 'watertank'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <WaterPump
      v-else-if="type === 'waterpumb'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <GateWave
      v-else-if="type === 'gatewave'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <PressureGauge
      v-else-if="type === 'pressure-gauge'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <WaterLevelSensor
      v-else-if="type === 'water-level-sensor'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <Device
      v-else-if="type === 'device'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <WaterPipe
      v-else-if="type === 'water-pipe'"
      :direction="direction"
      :width="width"
      :height="height"
      :component-id="componentId"
    />
    <SimplePipe v-else-if="type === 'pipe'" :width="width" :height="height" />
    <GridSquare v-else-if="type === 'grid-square'" :width="width" :height="height" />
    <Pressuremeter
      v-else-if="type === 'pressure-meter'"
      :width="width"
      :height="height"
      :component-id="componentId"
    />

    <div
      v-else
      class="bg-gray-300 border-2 border-gray-400 rounded-sm shadow-lg flex items-center justify-center transition-all duration-200"
      :class="{
        'ring-2 ring-gray-400 ring-offset-2': selected,
        'hover:shadow-xl': !selected,
      }"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <span class="text-xs text-gray-600 font-medium">?</span>
    </div>

    <div v-if="selected && isSCADAComponent" class="absolute rounded-sm pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WaterTank from './WaterTank/WaterTank.vue'
import WaterPump from './WaterPump/WaterPump.vue'
import GateWave from './GateWave/GateWave.vue'
import PressureGauge from './PressureGauge/PressureGauge.vue'
import WaterLevelSensor from './WaterLevelSensor/WaterLevelSensor.vue'
import Device from './device/Device.vue'
import WaterPipe from './WaterPipe/WaterPipe.vue'
import SimplePipe from './SimplePipe/SimplePipe.vue'
import GridSquare from './GridSquare/GridSquare.vue'
import Pressuremeter from './PressureMeter/Pressuremeter.vue'
interface Props {
  type: string
  width: number
  height: number
  selected?: boolean
  direction?: 'left' | 'right'
  componentId?: number
  componentData?: any
}

const props = defineProps<Props>()

const scadaComponentTypes = [
  'watertank',
  'waterpumb',
  'gatewave',
  'pressure-gauge',
  'water-level-sensor',
  'pressure-meter',
]

const isSCADAComponent = computed(() => {
  return scadaComponentTypes.includes(props.type)
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.component-shape {
  transition: all 0.2s ease;
}

.component-shape {
  transform: scale(1.02);
}

.selected {
  z-index: 20;
}
</style>
