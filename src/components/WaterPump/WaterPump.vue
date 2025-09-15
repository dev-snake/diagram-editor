<template>
  <div class="w-full h-full relative" :style="{ width: width + 'px', height: height + 'px' }">
    <!-- Water Pump Body -->
    <div
      class="relative bg-gradient-to-b from-gray-300 to-gray-600 rounded-lg shadow-2xl w-full h-full p-4"
    >
      <!-- Main Body -->
      <div class="flex flex-col h-full justify-between">
        <!-- Top Section - Motor Housing -->
        <div class="flex-1 flex items-center justify-center">
          <!-- Motor Housing -->
          <div
            class="bg-gradient-to-r from-gray-400 to-gray-600 rounded-full w-24 h-24 shadow-inner relative overflow-hidden"
          >
            <!-- Fan/Propeller -->
            <div
              class="absolute inset-3 transition-transform duration-100 ease-linear"
              :class="{ 'animate-spin': internalIsRunning }"
              :style="{ animationDuration: internalIsRunning ? '0.1s' : '0s' }"
            >
              <svg viewBox="0 0 100 100" class="w-full h-full">
                <!-- Fan Blades -->
                <g fill="#1f2937" stroke="#374151" stroke-width="1">
                  <path d="M50 20 L45 45 L50 50 L55 45 Z" />
                  <path d="M80 50 L55 45 L50 50 L55 55 Z" />
                  <path d="M50 80 L55 55 L50 50 L45 55 Z" />
                  <path d="M20 50 L45 55 L50 50 L45 45 Z" />
                </g>
                <!-- Center Hub -->
                <circle cx="50" cy="50" r="8" fill="#374151" stroke="#1f2937" stroke-width="2" />
              </svg>
            </div>

            <!-- Status LED -->
            <div class="absolute -top-2 -right-2">
              <div
                class="w-4 h-4 rounded-full border-2 border-gray-700"
                :class="
                  internalIsRunning
                    ? 'bg-green-400 shadow-green-400 shadow-lg animate-pulse'
                    : 'bg-red-400'
                "
              ></div>
            </div>
          </div>
        </div>

        <!-- Middle Section - Intake Vents and Info -->
        <div class="flex-1 flex flex-col items-center justify-center">
          <!-- Intake Vents -->
          <div class="flex justify-centern items-center gap-x-2 py-2">
            <div v-for="i in 8" :key="i" class="w-1 h-8 bg-gray-800 rounded-full"></div>
          </div>

          <!-- Pump Info Display -->
          <div class="bg-gray-700 rounded-lg px-4 py-2 mb-2 text-white text-center min-w-[120px]">
            <div class="text-xs font-semibold">{{ props.pumpId }}</div>
            <div
              class="text-xs mt-1"
              :class="internalIsRunning ? 'text-green-400' : 'text-red-400'"
            >
              {{ displayStatus }}
            </div>
            <div v-if="props.flowRate > 0" class="text-xs text-blue-400 mt-1">
              {{ props.flowRate.toFixed(1) }} L/min
            </div>
            <div v-if="props.powerConsumption > 0" class="text-xs text-yellow-400 mt-1">
              {{ props.powerConsumption.toFixed(1) }}W
            </div>
          </div>
        </div>

        <!-- Bottom Section - Control Panel -->
        <div class="bg-gray-800 rounded-lg p-4 shadow-xl">
          <div class="flex items-center justify-center">
            <!-- Power Button -->
            <button
              @click="togglePump"
              :disabled="!props.enableControl"
              class="relative w-16 h-16 hover:cursor-pointer rounded-full border-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                internalIsRunning
                  ? 'bg-green-500 border-green-400 shadow-green-400 shadow-lg focus:ring-green-300'
                  : 'bg-red-500 border-red-400 shadow-red-400 shadow-lg focus:ring-red-300'
              "
            >
              <span class="text-white font-bold text-sm">
                {{ internalIsRunning ? 'ON' : 'OFF' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Bottom Outlet -->
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
          <div class="w-16 h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg shadow-lg">
            <!-- Water drops animation when running -->
            <div v-if="internalIsRunning" class="relative overflow-hidden h-full">
              <div
                v-for="i in 4"
                :key="i"
                class="absolute w-1.5 h-3 bg-blue-400 rounded-full animate-bounce"
                :style="{
                  left: `${15 + i * 18}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Water Effect Background -->
    <div v-if="internalIsRunning" class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="i in 15"
        :key="i"
        class="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-bounce"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  width?: number
  height?: number
  // Dynamic data props
  isRunning?: boolean
  pumpId?: string
  flowRate?: number
  powerConsumption?: number
  enableControl?: boolean
  statusText?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
  isRunning: false,
  pumpId: 'PUMP-01',
  flowRate: 0,
  powerConsumption: 0,
  enableControl: true,
  statusText: '',
})

const emit = defineEmits<{
  'update:isRunning': [value: boolean]
  statusChange: [isRunning: boolean]
  toggle: []
}>()

const internalIsRunning = ref(props.isRunning)

const togglePump = () => {
  if (!props.enableControl) return

  internalIsRunning.value = !internalIsRunning.value
  emit('update:isRunning', internalIsRunning.value)
  emit('statusChange', internalIsRunning.value)
  emit('toggle')
}

const displayStatus = computed(() => {
  if (props.statusText) return props.statusText
  return internalIsRunning.value ? 'RUNNING' : 'STOPPED'
})

// Watch for prop changes
watch(
  () => props.isRunning,
  (newValue) => {
    internalIsRunning.value = newValue
  },
)
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.1s linear infinite;
}
</style>
