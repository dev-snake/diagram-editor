<template>
  <div
    class="flex items-center justify-center h-full w-full p-8"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="absolute w-full h-full">
      <!-- Outer Ring with realistic metallic effect -->
      <div
        class="w-full h-full rounded-full shadow-2xl p-3 relative"
        style="
          background: linear-gradient(145deg, #e6e6e6, #c0c0c0);
          box-shadow:
            inset 0 0 20px rgba(0, 0, 0, 0.2),
            0 10px 30px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.3);
        "
      >
        <!-- Screws on corners -->
        <div
          class="absolute top-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-sm"
        ></div>
        <div
          class="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-sm"
        ></div>
        <div
          class="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-sm"
        ></div>
        <div
          class="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-sm"
        ></div>

        <!-- Inner Ring -->
        <div
          class="w-full h-full rounded-full p-4 relative"
          style="
            background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            box-shadow:
              inset 0 5px 15px rgba(0, 0, 0, 0.7),
              inset 0 -5px 15px rgba(0, 0, 0, 0.5);
          "
        >
          <!-- Glass Cover Effect -->
          <div
            class="absolute inset-4 rounded-full pointer-events-none"
            style="
              background: radial-gradient(
                ellipse at 30% 30%,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.15) 20%,
                rgba(255, 255, 255, 0.05) 40%,
                transparent 70%
              );
              box-shadow: inset 0 -2px 10px rgba(0, 0, 0, 0.3);
            "
          ></div>

          <!-- Gauge Face -->
          <div
            class="w-full h-full rounded-full relative overflow-hidden"
            style="
              background: radial-gradient(circle at 50% 50%, #fafafa 0%, #f0f0f0 50%, #e0e0e0 100%);
              box-shadow:
                inset 0 0 30px rgba(0, 0, 0, 0.15),
                inset 0 5px 15px rgba(0, 0, 0, 0.1);
            "
          >
            <!-- Scale Marks -->
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <!-- Background circle for scale -->
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="#d0d0d0"
                stroke-width="0.5"
                opacity="0.5"
              />

              <!-- Major Scale Lines with enhanced visibility -->
              <g v-for="i in 11" :key="`major-${i}`">
                <line
                  :x1="100 + 70 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :y1="100 + 70 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :x2="100 + 82 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :y2="100 + 82 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  stroke="#1f2937"
                  stroke-width="2.5"
                />
                <!-- Scale Numbers with better positioning -->
                <text
                  :x="100 + 58 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :y="100 + 58 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI) + 5"
                  text-anchor="middle"
                  class="text-sm font-bold fill-gray-900"
                  style="font-family: 'Helvetica', 'Arial', sans-serif"
                >
                  {{
                    Math.round(
                      props.minPressure + ((i - 1) / 10) * (props.maxPressure - props.minPressure),
                    )
                  }}
                </text>
              </g>

              <!-- Minor Scale Lines with better distribution -->
              <g v-for="i in 51" :key="`minor-${i}`">
                <line
                  v-if="(i - 1) % 5 !== 0"
                  :x1="100 + 74 * Math.cos(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                  :y1="100 + 74 * Math.sin(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                  :x2="100 + 80 * Math.cos(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                  :y2="100 + 80 * Math.sin(((i - 1) * 3.6 * Math.PI) / 180 - Math.PI)"
                  stroke="#6b7280"
                  stroke-width="1"
                  opacity="0.7"
                />
              </g>

              <!-- Danger Zone (Red Zone) with gradient -->
              <defs>
                <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color: #fca5a5; stop-opacity: 0.3" />
                  <stop offset="100%" style="stop-color: #dc2626; stop-opacity: 0.4" />
                </linearGradient>

                <!-- Needle shadow filter -->
                <filter id="needleShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="1" dy="1" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <!-- Center hub gradient -->
                <radialGradient id="hubGradient" cx="0.3" cy="0.3">
                  <stop offset="0%" stop-color="#f9fafb" />
                  <stop offset="50%" stop-color="#d1d5db" />
                  <stop offset="100%" stop-color="#6b7280" />
                </radialGradient>
              </defs>

              <path
                :d="`M 100 100 L ${100 + 75 * Math.cos(((-180 + (props.dangerZone / 100) * 180) * Math.PI) / 180)} ${100 + 75 * Math.sin(((-180 + (props.dangerZone / 100) * 180) * Math.PI) / 180)} A 75 75 0 0 1 ${100 + 75 * Math.cos(0)} ${100 + 75 * Math.sin(0)} Z`"
                fill="url(#dangerGradient)"
              />

              <!-- Needle Group with smooth animation -->
              <g
                :style="{
                  transform: `rotate(${animatedNeedleAngle}deg)`,
                  transformOrigin: '100px 100px',
                  transition: 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }"
                filter="url(#needleShadow)"
              >
                <!-- Needle body with taper -->
                <polygon
                  points="100,100 98,98 98,30 100,25 102,30 102,98"
                  fill="url(#needleGradient)"
                  stroke="#8b0000"
                  stroke-width="0.5"
                />
                <!-- Needle tip -->
                <polygon points="100,25 98,30 102,30" fill="#dc2626" />
              </g>

              <!-- Needle gradient -->
              <defs>
                <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #ef4444; stop-opacity: 1" />
                  <stop offset="50%" style="stop-color: #dc2626; stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: #b91c1c; stop-opacity: 1" />
                </linearGradient>
              </defs>

              <!-- Center Hub with 3D effect -->
              <circle
                cx="100"
                cy="100"
                r="12"
                fill="url(#hubGradient)"
                stroke="#374151"
                stroke-width="1"
                style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
              />
              <circle cx="100" cy="100" r="8" fill="#1f2937" />
              <circle cx="100" cy="100" r="6" fill="#374151" />
              <circle cx="100" cy="100" r="4" fill="#1f2937" />
              <circle cx="98" cy="98" r="2" fill="#4b5563" opacity="0.5" />
            </svg>

            <!-- Brand Label with better typography -->
            <div
              class="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <div
                class="text-xs font-bold text-gray-900 mt-10 tracking-wider uppercase"
                style="font-size: 11px"
              >
                {{ props.gaugeId }}
              </div>
              <div class="text-xs text-gray-600" style="font-size: 9px">PRESSURE</div>
            </div>

            <!-- Unit Display -->
            <div class="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 text-center">
              <div class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {{ props.unit }}
              </div>
            </div>

            <!-- Digital Display with LCD effect -->
            <div class="absolute bottom-1/5 left-1/2 transform -translate-x-1/2">
              <div
                class="px-3  py-1 rounded"
                style="
                  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
                  box-shadow:
                    inset 0 2px 4px rgba(0, 0, 0, 0.8),
                    0 1px 0 rgba(255, 255, 255, 0.1);
                  border: 1px solid #333;
                "
              >
                <div
                  class="text-green-400 font-mono tracking-wider"
                  style="text-shadow: 0 0 10px rgba(34, 197, 94, 0.8); font-size: 16px"
                >
                  {{ displayPressure.toFixed(1) }}
                </div>
              </div>
            </div>

            <!-- Status Indicator with glow effect -->
            <div
              class="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2"
              style="bottom: 12%"
            >
              <div class="relative">
                <div
                  :class="[
                    'w-3 h-3 rounded-full transition-all duration-500',
                    alertStatus === 'normal'
                      ? 'bg-green-500'
                      : alertStatus === 'warning'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500 animate-pulse',
                  ]"
                  :style="{
                    boxShadow:
                      alertStatus === 'normal'
                        ? '0 0 15px rgba(34, 197, 94, 0.8), inset 0 0 3px rgba(255,255,255,0.3)'
                        : alertStatus === 'warning'
                          ? '0 0 15px rgba(245, 158, 11, 0.8), inset 0 0 3px rgba(255,255,255,0.3)'
                          : '0 0 15px rgba(239, 68, 68, 0.8), inset 0 0 3px rgba(255,255,255,0.3)',
                  }"
                ></div>
              </div>
              <span class="text-xs text-gray-700 font-semibold tracking-wide uppercase">
                {{
                  alertStatus === 'normal'
                    ? 'NORMAL'
                    : alertStatus === 'warning'
                      ? 'CAUTION'
                      : 'DANGER'
                }}
              </span>
            </div>

            <!-- Glass reflection overlay -->
            <div
              class="absolute inset-0 rounded-full pointer-events-none"
              style="
                background: linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.2) 0%,
                  transparent 30%,
                  transparent 70%,
                  rgba(0, 0, 0, 0.1) 100%
                );
              "
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  width?: number
  height?: number
  pressure?: number
  maxPressure?: number
  minPressure?: number
  unit?: string
  gaugeId?: string
  enableControl?: boolean
  dangerZone?: number
  alertThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
  pressure: 0,
  maxPressure: 100,
  minPressure: 0,
  unit: 'PSI',
  gaugeId: 'PG-01',
  enableControl: true,
  dangerZone: 80,
  alertThreshold: 90,
})

const emit = defineEmits<{
  'update:pressure': [value: number]
  pressureChange: [value: number]
  alert: [type: 'normal' | 'warning' | 'danger', pressure: number]
}>()

const internalPressure = ref(props.pressure)
const displayPressure = ref(props.pressure)
const animatedNeedleAngle = ref(-180)

// Smooth animation for display value
const animateValue = (from: number, to: number, duration: number = 800) => {
  const startTime = performance.now()
  const diff = to - from

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)

    displayPressure.value = from + diff * easeOutQuart

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      displayPressure.value = to
    }
  }

  requestAnimationFrame(animate)
}

const needleAngle = computed(() => {
  const ratio =
    (internalPressure.value - props.minPressure) / (props.maxPressure - props.minPressure)
  return -90 + ratio * 180
})

const pressurePercentage = computed(() => {
  return (
    ((internalPressure.value - props.minPressure) / (props.maxPressure - props.minPressure)) * 100
  )
})

const alertStatus = computed(() => {
  const percentage = pressurePercentage.value
  if (percentage >= props.alertThreshold) return 'danger'
  if (percentage >= props.dangerZone) return 'warning'
  return 'normal'
})

const updatePressure = (newPressure: number) => {
  const oldPressure = internalPressure.value
  internalPressure.value = newPressure

  // Animate display value
  animateValue(oldPressure, newPressure)

  emit('update:pressure', newPressure)
  emit('pressureChange', newPressure)
}

// Watch for needle angle changes with smooth animation
watch(needleAngle, (newAngle) => {
  animatedNeedleAngle.value = newAngle
})

// Watch for prop changes
watch(
  () => props.pressure,
  (newValue) => {
    updatePressure(newValue)
  },
)

// Watch pressure changes for alerts
watch(
  () => internalPressure.value,
  (newPressure) => {
    const status = alertStatus.value
    emit('alert', status, newPressure)
  },
)

// Initialize and add realistic fluctuations
onMounted(() => {
  internalPressure.value = props.pressure
  displayPressure.value = props.pressure
  animatedNeedleAngle.value = needleAngle.value

  // Realistic pressure fluctuations
  if (props.pressure === 0) {
    // Start with a random pressure
    const initialPressure = Math.random() * (props.maxPressure * 0.6) + props.maxPressure * 0.2
    updatePressure(initialPressure)

    // Add micro fluctuations for realism
    setInterval(() => {
      if (props.enableControl) {
        // Small random fluctuation
        const fluctuation = (Math.random() - 0.5) * 0.5
        const newPressure = Math.max(
          props.minPressure,
          Math.min(props.maxPressure, internalPressure.value + fluctuation),
        )
        updatePressure(newPressure)
      }
    }, 2000)

    // Occasionally larger changes
    setInterval(() => {
      if (props.enableControl) {
        const fluctuation = (Math.random() - 0.5) * 5
        const newPressure = Math.max(
          props.minPressure,
          Math.min(props.maxPressure, internalPressure.value + fluctuation),
        )
        updatePressure(newPressure)
      }
    }, 8000)
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
