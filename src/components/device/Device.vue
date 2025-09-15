<template>
  <div class="relative w-full h-full" :style="{ width: width + 'px', height: height + 'px' }">
    <!-- Main Device Housing -->
    <div
      class="relative bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 p-4 rounded-xl shadow-xl border-gray-500 w-full h-full"
    >
      <!-- Brushed Metal Effect -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"
      ></div>

      <!-- Corner Screws -->
      <div
        v-for="pos in screwPositions"
        :key="pos"
        :class="`absolute ${pos} w-3 h-3 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full shadow-inner border border-gray-700`"
      >
        <div class="absolute inset-0.5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full">
          <div class="absolute inset-0.5 border-t border-l border-gray-300 rounded-full"></div>
        </div>
      </div>

      <!-- Device Label -->
      <div class="text-center mb-4">
        <div
          class="bg-gradient-to-r from-gray-700 to-gray-800 px-3 py-1 rounded-lg shadow-inner border border-gray-600"
        >
          <h2 class="text-gray-200 font-mono text-xs font-bold tracking-wider">
            {{ props.deviceId || 'INDUSTRIAL IoT SENSOR' }}
          </h2>
          <p class="text-gray-400 text-xs">
            Model: {{ props.modelNumber }} | S/N: {{ props.serialNumber }}
          </p>
        </div>
      </div>

      <!-- Main Display Screen -->
      <div class="relative bg-black rounded-lg p-3 shadow-inner border-2 border-gray-700 mb-4">
        <!-- Screen Bezel -->
        <div
          class="absolute bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl shadow-lg"
        ></div>
        <div class="absolute -inset-1 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg"></div>

        <!-- Screen Content -->
        <div class="relative bg-black rounded p-2 border border-gray-800">
          <!-- Status Bar -->
          <div class="flex justify-between items-center mb-3 pb-1 border-b border-green-800">
            <div class="flex items-center gap-2">
              <div
                :class="`w-3 h-3 rounded-full ${mergedData.status === 'ONLINE' ? 'bg-green-400 shadow-green-400/50 shadow-lg' : 'bg-red-400 shadow-red-400/50 shadow-lg'}`"
              ></div>
              <span class="text-green-400 font-mono text-sm">{{ mergedData.status }}</span>
            </div>
            <div class="text-green-400 font-mono text-xs">{{ currentTime }}</div>
          </div>

          <!-- Main Parameters Grid -->
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div class="bg-gray-900 rounded p-2 border border-green-800">
              <div class="text-green-300 text-xs mb-1">TEMPERATURE</div>
              <div class="text-green-400 font-mono text-lg font-bold">
                {{ mergedData.temperature?.toFixed(1) || '0.0' }}°C
              </div>
            </div>
            <div class="bg-gray-900 rounded p-2 border border-green-800">
              <div class="text-green-300 text-xs mb-1">HUMIDITY</div>
              <div class="text-green-400 font-mono text-lg font-bold">
                {{ mergedData.humidity?.toFixed(1) || '0.0' }}%
              </div>
            </div>
            <div class="bg-gray-900 rounded p-2 border border-green-800">
              <div class="text-green-300 text-xs mb-1">PRESSURE</div>
              <div class="text-green-400 font-mono text-lg font-bold">
                {{ mergedData.pressure?.toFixed(2) || '0.00' }} hPa
              </div>
            </div>
            <div class="bg-gray-900 rounded p-2 border border-green-800">
              <div class="text-green-300 text-xs mb-1">VOLTAGE</div>
              <div class="text-green-400 font-mono text-lg font-bold">
                {{ mergedData.voltage?.toFixed(1) || '0.0' }}V
              </div>
            </div>
          </div>

          <!-- Secondary Parameters -->
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-900 rounded p-2 border border-green-800">
              <div class="text-green-300 text-xs mb-1">CURRENT</div>
              <div class="text-green-400 font-mono text-sm">
                {{ mergedData.current?.toFixed(1) || '0.0' }}A
              </div>
            </div>
            <div class="bg-gray-900 rounded p-2 border border-green-800">
              <div class="text-green-300 text-xs mb-1">POWER</div>
              <div class="text-green-400 font-mono text-sm">
                {{ mergedData.power?.toFixed(1) || '0.0' }}W
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex justify-center gap-3">
        <button
          @click="resetDevice"
          class="bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-300 hover:to-gray-500 px-4 py-2 rounded-lg shadow-lg border border-gray-500 active:shadow-inner transition-all"
        >
          <span class="text-gray-800 font-mono text-xs font-bold">RESET</span>
        </button>
        <button
          @click="configDevice"
          class="bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-300 hover:to-gray-500 px-4 py-2 rounded-lg shadow-lg border border-gray-500 active:shadow-inner transition-all"
        >
          <span class="text-gray-800 font-mono text-xs font-bold">CONFIG</span>
        </button>
      </div>

      <!-- Ventilation Grilles -->
      <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
        <div
          v-for="i in 6"
          :key="i"
          class="w-1 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full shadow-inner"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

interface DeviceData {
  temperature: number
  humidity: number
  pressure: number
  voltage: number
  current: number
  power: number
  status: 'ONLINE' | 'OFFLINE' | 'ERROR'
  alarmActive: boolean
  motorRunning: boolean
  pumpActive: boolean
}

interface Props {
  width?: number
  height?: number
  // Dynamic data props
  deviceId?: string
  serialNumber?: string
  modelNumber?: string
  data?: Partial<DeviceData>
  enableSimulation?: boolean
  updateInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
  deviceId: 'DEVICE-01',
  serialNumber: '001234',
  modelNumber: 'IIS-2024',
  data: () => ({}),
  enableSimulation: true,
  updateInterval: 2000,
})

const emit = defineEmits<{
  dataUpdate: [data: DeviceData]
  statusChange: [status: string]
  alert: [type: 'alarm' | 'warning' | 'info', message: string]
}>()

const internalData = ref<DeviceData>({
  temperature: 23.5,
  humidity: 65.2,
  pressure: 1013.25,
  voltage: 12.4,
  current: 2.8,
  power: 34.7,
  status: 'ONLINE',
  alarmActive: false,
  motorRunning: true,
  pumpActive: false,
  ...props.data,
})

const screwPositions = ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2']

// Update current time
const currentTime = computed(() => new Date().toLocaleTimeString())

// Merge external data with internal data
const mergedData = computed(() => ({
  ...internalData.value,
  ...props.data,
}))

// Watch for external data changes
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      Object.assign(internalData.value, newData)
    }
  },
  { deep: true },
)

// Simulate real-time data updates
let interval: number | null = null

const updateData = () => {
  if (!props.enableSimulation) return

  const newData: DeviceData = {
    ...internalData.value,
    temperature: 20 + Math.random() * 10,
    humidity: 60 + Math.random() * 20,
    pressure: 1010 + Math.random() * 10,
    voltage: 12 + Math.random() * 0.8,
    current: 2.5 + Math.random() * 0.6,
    power: 30 + Math.random() * 10,
    alarmActive: Math.random() > 0.9,
    motorRunning: Math.random() > 0.3,
    pumpActive: Math.random() > 0.7,
  }

  // Only update if no external data is provided for these fields
  Object.keys(newData).forEach((key) => {
    if (!(key in (props.data || {}))) {
      ;(internalData.value as any)[key] = (newData as any)[key]
    }
  })

  emit('dataUpdate', mergedData.value)

  // Emit alerts for critical conditions
  if (mergedData.value.temperature > 28) {
    emit('alert', 'warning', 'High temperature detected')
  }
  if (mergedData.value.alarmActive) {
    emit('alert', 'alarm', 'System alarm activated')
  }
}

const resetDevice = () => {
  internalData.value.alarmActive = false
  emit('statusChange', 'RESET')
}

const configDevice = () => {
  emit('statusChange', 'CONFIG')
}

onMounted(() => {
  if (props.enableSimulation) {
    interval = setInterval(updateData, props.updateInterval)
  }
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>
