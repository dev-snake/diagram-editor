<template>
  <div
    class="flex items-center justify-center h-full absolute w-full left-0 p-8"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="absolute w-full h-full">
      <!-- Main Valve Body -->
      <div
        class="absolute top-0 w-full h-64 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-lg shadow-2xl border border-gray-600"
      >
        <!-- Top Flange -->
        <div
          class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg border-2 border-gray-700"
        >
          <!-- Bolts -->
          <div class="absolute top-1 left-2 w-2 h-2 bg-gray-800 rounded-full shadow-inner"></div>
          <div class="absolute top-1 right-2 w-2 h-2 bg-gray-800 rounded-full shadow-inner"></div>
          <div class="absolute bottom-1 left-6 w-2 h-2 bg-gray-800 rounded-full shadow-inner"></div>
          <div
            class="absolute bottom-1 right-6 w-2 h-2 bg-gray-800 rounded-full shadow-inner"
          ></div>
        </div>

        <!-- Handwheel -->
        <div class="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div
            class="w-24 h-24 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-full shadow-2xl border-4 border-gray-900 cursor-pointer transition-all duration-300 hover:shadow-3xl"
            :class="{ 'rotate-180': internalIsOpen, 'cursor-not-allowed': !props.enableControl }"
            @click="toggleValve"
          >
            <!-- Handwheel Spokes -->
            <div class="absolute inset-2 border-4 border-gray-500 rounded-full">
              <div
                class="absolute top-1/2 left-0 w-full h-0.5 bg-gray-500 transform -translate-y-0.5"
              ></div>
              <div
                class="absolute top-0 left-1/2 w-0.5 h-full bg-gray-500 transform -translate-x-0.5"
              ></div>
              <div
                class="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner"
              ></div>
            </div>
          </div>
        </div>

        <!-- Valve Stem -->
        <div
          class="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-20 bg-gradient-to-b from-gray-500 to-gray-600 shadow-lg"
        ></div>

        <!-- Digital Display -->
        <div
          class="absolute top-6 left-6 w-20 h-18 bg-black rounded border-2 border-gray-600 shadow-inner"
        >
          <div class="p-1 text-green-400 font-mono text-xs leading-tight">
            <div>{{ props.valveId }}</div>
            <div>{{ internalIsOpen ? 'OPEN' : 'CLOSED' }}</div>
            <div>{{ Math.round(currentPosition) }}%</div>
            <div>{{ Math.round(currentPressure) }} PSI</div>
          </div>
        </div>

        <!-- Control Button -->
        <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            @click="toggleValve"
            :disabled="!props.enableControl"
            class="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-lg border-4 border-red-900 hover:from-red-500 hover:to-red-700 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'from-green-600 to-green-800 border-green-900 hover:from-green-500 hover:to-green-700':
                internalIsOpen,
            }"
          >
            <div class="text-white font-bold text-xs">
              {{ internalIsOpen ? 'CLOSE' : 'OPEN' }}
            </div>
          </button>
        </div>

        <!-- Side Flanges -->

        <!-- Status LED -->
        <div class="absolute top-20 left-1/2 transform -translate-x-1/2">
          <div
            class="w-3 h-3 rounded-full border border-gray-600 shadow-inner"
            :class="internalIsOpen ? 'bg-green-500 shadow-green-400' : 'bg-red-500 shadow-red-400'"
            style="box-shadow: 0 0 10px currentColor"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  width?: number
  height?: number
  // Dynamic data props
  isOpen?: boolean
  valveId?: string
  position?: number
  pressure?: number
  maxPressure?: number
  enableControl?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
  isOpen: false,
  valveId: 'VALVE-01',
  position: 0,
  pressure: 0,
  maxPressure: 200,
  enableControl: true,
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'update:position': [value: number]
  positionChange: [value: number]
  valveToggle: [isOpen: boolean]
}>()

const internalIsOpen = ref(props.isOpen)
const internalPosition = ref(props.position)
const internalPressure = ref(props.pressure)

// Computed values that react to props or internal state
const currentPosition = computed(() =>
  props.position !== undefined ? props.position : internalIsOpen.value ? 100 : 0,
)

const currentPressure = computed(() =>
  props.pressure !== undefined ? props.pressure : internalIsOpen.value ? 150 : 0,
)

const toggleValve = () => {
  if (!props.enableControl) return

  internalIsOpen.value = !internalIsOpen.value
  emit('update:isOpen', internalIsOpen.value)
  emit('valveToggle', internalIsOpen.value)

  // Update position based on valve state
  const newPosition = internalIsOpen.value ? 100 : 0
  internalPosition.value = newPosition
  emit('update:position', newPosition)
  emit('positionChange', newPosition)
}

// Watch for prop changes
watch(
  () => props.isOpen,
  (newValue) => {
    internalIsOpen.value = newValue
  },
)

watch(
  () => props.position,
  (newValue) => {
    internalPosition.value = newValue
  },
)

watch(
  () => props.pressure,
  (newValue) => {
    internalPressure.value = newValue
  },
)
</script>

<style scoped>
@keyframes flowLeft {
  0% {
    left: 100%;
  }
  100% {
    left: -10px;
  }
}

@keyframes flowRight {
  0% {
    right: 100%;
  }
  100% {
    right: -10px;
  }
}
</style>
