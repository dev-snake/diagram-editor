<template>
  <div
    class="flex flex-col items-center justify-center h-full w-full p-4"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <!-- Dual Gauge Container -->
    <div class="flex gap-6 items-center justify-center w-full">
      <!-- Input Pressure Gauge -->
      <div class="flex flex-col items-center">
        <div class="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
          ÁP SUẤT VÀO
        </div>
        <div class="relative" :style="{ width: gaugeSize + 'px', height: gaugeSize + 'px' }">
          <!-- Gauge Container -->
          <div
            class="w-full h-full rounded-full shadow-2xl p-2 relative"
            style="
              background: linear-gradient(145deg, #e6e6e6, #c0c0c0);
              box-shadow:
                inset 0 0 15px rgba(0, 0, 0, 0.2),
                0 8px 25px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.3);
            "
          >
            <!-- Inner Ring -->
            <div
              class="w-full h-full rounded-full p-3 relative"
              style="
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                box-shadow:
                  inset 0 4px 12px rgba(0, 0, 0, 0.7),
                  inset 0 -4px 12px rgba(0, 0, 0, 0.5);
              "
            >
              <!-- Gauge Face -->
              <div
                class="w-full h-full rounded-full relative overflow-hidden"
                style="
                  background: radial-gradient(
                    circle at 50% 50%,
                    #fafafa 0%,
                    #f0f0f0 50%,
                    #e0e0e0 100%
                  );
                  box-shadow:
                    inset 0 0 20px rgba(0, 0, 0, 0.15),
                    inset 0 4px 12px rgba(0, 0, 0, 0.1);
                "
              >
                <!-- SVG for scale and needle -->
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                  <!-- Scale Marks -->
                  <g v-for="i in 11" :key="`input-major-${i}`">
                    <line
                      :x1="100 + 60 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :y1="100 + 60 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :x2="100 + 72 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :y2="100 + 72 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      stroke="#1f2937"
                      stroke-width="2"
                    />
                    <text
                      :x="100 + 50 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :y="100 + 50 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI) + 4"
                      text-anchor="middle"
                      class="text-xs font-bold fill-gray-900"
                    >
                      {{
                        Math.round(
                          props.minPressure +
                            ((i - 1) / 10) * (props.maxPressure - props.minPressure),
                        )
                      }}
                    </text>
                  </g>

                  <!-- Minor Scale Lines -->
                  <g v-for="i in 51" :key="`input-minor-${i}`">
                    <line
                      v-if="(i - 1) % 5 !== 0"
                      :x1="100 + 65 * Math.cos(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      :y1="100 + 65 * Math.sin(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      :x2="100 + 70 * Math.cos(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      :y2="100 + 70 * Math.sin(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      stroke="#6b7280"
                      stroke-width="1"
                      opacity="0.7"
                    />
                  </g>

                  <!-- Danger Zone -->
                  <defs>
                    <linearGradient id="inputDangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color: #fca5a5; stop-opacity: 0.3" />
                      <stop offset="100%" style="stop-color: #dc2626; stop-opacity: 0.4" />
                    </linearGradient>

                    <filter id="inputNeedleShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                      <feOffset dx="1" dy="1" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <linearGradient id="inputNeedleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color: #3b82f6; stop-opacity: 1" />
                      <stop offset="50%" style="stop-color: #2563eb; stop-opacity: 1" />
                      <stop offset="100%" style="stop-color: #1d4ed8; stop-opacity: 1" />
                    </linearGradient>
                  </defs>

                  <!-- Needle for Input Pressure -->
                  <g
                    :style="{
                      transform: `rotate(${inputNeedleAngle}deg)`,
                      transformOrigin: '100px 100px',
                      transition: 'transform 0.6s ease-out',
                    }"
                    filter="url(#inputNeedleShadow)"
                  >
                    <polygon
                      points="100,100 98,98 98,35 100,30 102,35 102,98"
                      fill="url(#inputNeedleGradient)"
                      stroke="#1e40af"
                      stroke-width="0.5"
                    />
                    <polygon points="100,30 98,35 102,35" fill="#1d4ed8" />
                  </g>

                  <!-- Center Hub -->
                  <circle cx="100" cy="100" r="8" fill="#374151" />
                  <circle cx="100" cy="100" r="6" fill="#1f2937" />
                  <circle cx="99" cy="99" r="2" fill="#4b5563" opacity="0.5" />
                </svg>

                <!-- Digital Display -->
                <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div
                    class="px-2 py-1 rounded text-center"
                    style="
                      background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
                      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
                      border: 1px solid #333;
                    "
                  >
                    <div
                      class="text-blue-400 font-mono text-sm"
                      style="text-shadow: 0 0 8px rgba(59, 130, 246, 0.8)"
                    >
                      {{ inputPressure.toFixed(1) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Pressure Unit -->
        <div class="text-xs text-gray-600 mt-2 font-semibold">{{ unit }}</div>
      </div>

      <!-- Arrow Separator -->
      <div class="flex flex-col items-center px-4">
        <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-xs text-gray-500 mt-1">FLOW</div>
      </div>

      <!-- Output Pressure Gauge -->
      <div class="flex flex-col items-center">
        <div class="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">
          ÁP SUẤT RA
        </div>
        <div class="relative" :style="{ width: gaugeSize + 'px', height: gaugeSize + 'px' }">
          <!-- Gauge Container -->
          <div
            class="w-full h-full rounded-full shadow-2xl p-2 relative"
            style="
              background: linear-gradient(145deg, #e6e6e6, #c0c0c0);
              box-shadow:
                inset 0 0 15px rgba(0, 0, 0, 0.2),
                0 8px 25px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.3);
            "
          >
            <!-- Inner Ring -->
            <div
              class="w-full h-full rounded-full p-3 relative"
              style="
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                box-shadow:
                  inset 0 4px 12px rgba(0, 0, 0, 0.7),
                  inset 0 -4px 12px rgba(0, 0, 0, 0.5);
              "
            >
              <!-- Gauge Face -->
              <div
                class="w-full h-full rounded-full relative overflow-hidden"
                style="
                  background: radial-gradient(
                    circle at 50% 50%,
                    #fafafa 0%,
                    #f0f0f0 50%,
                    #e0e0e0 100%
                  );
                  box-shadow:
                    inset 0 0 20px rgba(0, 0, 0, 0.15),
                    inset 0 4px 12px rgba(0, 0, 0, 0.1);
                "
              >
                <!-- SVG for scale and needle -->
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                  <!-- Scale Marks -->
                  <g v-for="i in 11" :key="`output-major-${i}`">
                    <line
                      :x1="100 + 60 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :y1="100 + 60 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :x2="100 + 72 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :y2="100 + 72 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      stroke="#1f2937"
                      stroke-width="2"
                    />
                    <text
                      :x="100 + 50 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                      :y="100 + 50 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI) + 4"
                      text-anchor="middle"
                      class="text-xs font-bold fill-gray-900"
                    >
                      {{
                        Math.round(
                          props.minPressure +
                            ((i - 1) / 10) * (props.maxPressure - props.minPressure),
                        )
                      }}
                    </text>
                  </g>

                  <!-- Minor Scale Lines -->
                  <g v-for="i in 51" :key="`output-minor-${i}`">
                    <line
                      v-if="(i - 1) % 5 !== 0"
                      :x1="100 + 65 * Math.cos(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      :y1="100 + 65 * Math.sin(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      :x2="100 + 70 * Math.cos(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      :y2="100 + 70 * Math.sin(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                      stroke="#6b7280"
                      stroke-width="1"
                      opacity="0.7"
                    />
                  </g>

                  <!-- Needle for Output Pressure -->
                  <defs>
                    <linearGradient id="outputNeedleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color: #10b981; stop-opacity: 1" />
                      <stop offset="50%" style="stop-color: #059669; stop-opacity: 1" />
                      <stop offset="100%" style="stop-color: #047857; stop-opacity: 1" />
                    </linearGradient>

                    <filter id="outputNeedleShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                      <feOffset dx="1" dy="1" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g
                    :style="{
                      transform: `rotate(${outputNeedleAngle}deg)`,
                      transformOrigin: '100px 100px',
                      transition: 'transform 0.6s ease-out',
                    }"
                    filter="url(#outputNeedleShadow)"
                  >
                    <polygon
                      points="100,100 98,98 98,35 100,30 102,35 102,98"
                      fill="url(#outputNeedleGradient)"
                      stroke="#065f46"
                      stroke-width="0.5"
                    />
                    <polygon points="100,30 98,35 102,35" fill="#047857" />
                  </g>

                  <!-- Center Hub -->
                  <circle cx="100" cy="100" r="8" fill="#374151" />
                  <circle cx="100" cy="100" r="6" fill="#1f2937" />
                  <circle cx="99" cy="99" r="2" fill="#4b5563" opacity="0.5" />
                </svg>

                <!-- Digital Display -->
                <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div
                    class="px-2 py-1 rounded text-center"
                    style="
                      background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
                      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
                      border: 1px solid #333;
                    "
                  >
                    <div
                      class="text-green-400 font-mono text-sm"
                      style="text-shadow: 0 0 8px rgba(16, 185, 129, 0.8)"
                    >
                      {{ outputPressure.toFixed(1) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Pressure Unit -->
        <div class="text-xs text-gray-600 mt-2 font-semibold">{{ unit }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue'
import type { ICanvasState } from '../Canvas.vue'

interface Props {
  width?: number
  height?: number
  inputPressureValue?: number
  outputPressureValue?: number
  maxPressure?: number
  minPressure?: number
  unit?: string
  meterTitle?: string
  meterId?: string
  enableSimulation?: boolean
  componentId?: number // Thêm prop để nhận component ID
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 400,
  inputPressureValue: 0,
  outputPressureValue: 0,
  maxPressure: 10,
  minPressure: 0,
  unit: 'BAR',
  meterTitle: 'PM-01',
  meterId: 'PRESSURE-METER-01',
  enableSimulation: true,
  componentId: undefined, // Default undefined
})

const emit = defineEmits<{
  'update:inputPressure': [value: number]
  'update:outputPressure': [value: number]
  pressureChange: [input: number, output: number, difference: number]
  alert: [type: 'normal' | 'warning' | 'critical', message: string]
}>()
const canvasState = inject<ICanvasState>('canvasState')
console.log('component_id', props.componentId)
// Tìm component data dựa trên componentId
const currentComponent = computed(() => {
  if (!props.componentId || !canvasState) return null
  return canvasState.components.find((c) => c.component_id === props.componentId)
})

// Lấy dữ liệu VGA của component hiện tại
const componentVgaData = computed(() => {
  return currentComponent.value?.data || null
})

// Reactive data
const inputPressure = ref(props.inputPressureValue)
const outputPressure = ref(props.outputPressureValue)

// Computed properties
const gaugeSize = computed(() => Math.min(props.width * 0.35, props.height * 0.6))

const inputNeedleAngle = computed(() => {
  const ratio = (inputPressure.value - props.minPressure) / (props.maxPressure - props.minPressure)
  return -90 + ratio * 180
})

const outputNeedleAngle = computed(() => {
  const ratio = (outputPressure.value - props.minPressure) / (props.maxPressure - props.minPressure)
  return -90 + ratio * 180
})

const pressureDifference = computed(() => {
  return inputPressure.value - outputPressure.value
})

const flowStatus = computed(() => {
  const diff = pressureDifference.value
  const inputPercentage = (inputPressure.value / props.maxPressure) * 100

  if (diff < 0) return 'critical' // Áp suất ra cao hơn vào - bất thường
  if (diff > props.maxPressure * 0.3) return 'critical' // Chênh lệch quá lớn
  if (inputPercentage < 10) return 'warning' // Áp suất vào quá thấp
  return 'normal'
})

// Methods
const updatePressures = (newInput: number, newOutput: number) => {
  inputPressure.value = Math.max(props.minPressure, Math.min(props.maxPressure, newInput))
  outputPressure.value = Math.max(props.minPressure, Math.min(props.maxPressure, newOutput))

  emit('update:inputPressure', inputPressure.value)
  emit('update:outputPressure', outputPressure.value)
  emit('pressureChange', inputPressure.value, outputPressure.value, pressureDifference.value)
}

// Watch for prop changes
watch(
  () => props.inputPressureValue,
  (newValue) => {
    inputPressure.value = newValue
  },
)

watch(
  () => props.outputPressureValue,
  (newValue) => {
    outputPressure.value = newValue
  },
)

// Watch for flow status changes
watch(flowStatus, (newStatus) => {
  let message = ''
  switch (newStatus) {
    case 'critical':
      message = 'Phát hiện áp suất bất thường'
      break
    case 'warning':
      message = 'Áp suất vào thấp'
      break
    case 'normal':
      message = 'Hệ thống hoạt động bình thường'
      break
  }
  emit('alert', newStatus, message)
})

// Initialize simulation
onMounted(() => {
  // Nếu có dữ liệu VGA từ API, sử dụng nó
  if (componentVgaData.value) {
    console.log('[PressureMeter] Using VGA data:', componentVgaData.value)
    const vgaData = componentVgaData.value

    // Cập nhật pressure từ VGA data
    const inputPressureFromAPI = vgaData.pressureBeforeValve || 0
    const outputPressureFromAPI = vgaData.pressureAfterValve || 0

    updatePressures(inputPressureFromAPI, outputPressureFromAPI)
  }
})

// Watch for VGA data changes
watch(
  componentVgaData,
  (newVgaData) => {
    if (newVgaData) {
      const inputPressureFromAPI = newVgaData.pressureBeforeValve || 0
      const outputPressureFromAPI = newVgaData.pressureAfterValve || 0

      updatePressures(inputPressureFromAPI, outputPressureFromAPI)
    }
  },
  { deep: true },
)
</script>

<style scoped>
/* Custom styles for pressure meter */
.pressure-meter-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
