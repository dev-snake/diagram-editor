<template>
  <div
    class="flex items-center justify-center h-full w-full p-8"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="absolute w-full h-full">
      <!-- Outer Ring -->
      <div
        class="w-full h-full rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 shadow-2xl p-4"
      >
        <!-- Inner Ring -->
        <div
          class="w-full h-full rounded-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-inner p-6 relative"
        >
          <!-- Glass Cover Effect -->
          <div
            class="absolute inset-6 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/30 pointer-events-none"
          ></div>

          <!-- Gauge Face -->
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-gray-100 via-white to-gray-200 relative shadow-inner"
          >
            <!-- Scale Marks -->
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <!-- Major Scale Lines -->
              <g v-for="i in 11" :key="`major-${i}`">
                <line
                  :x1="100 + 75 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :y1="100 + 75 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :x2="100 + 85 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :y2="100 + 85 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  stroke="#374151"
                  stroke-width="2"
                />
                <!-- Scale Numbers -->
                <text
                  :x="100 + 65 * Math.cos(((i - 1) * 18 * Math.PI) / 180 - Math.PI)"
                  :y="100 + 65 * Math.sin(((i - 1) * 18 * Math.PI) / 180 - Math.PI) + 4"
                  text-anchor="middle"
                  class="text-xs font-bold fill-gray-800"
                >
                  {{ (i - 1) * 10 }}
                </text>
              </g>

              <!-- Minor Scale Lines -->
              <g v-for="i in 50" :key="`minor-${i}`">
                <line
                  v-if="i % 5 !== 0"
                  :x1="100 + 78 * Math.cos((i * 3.6 * Math.PI) / 180 - Math.PI)"
                  :y1="100 + 78 * Math.sin((i * 3.6 * Math.PI) / 180 - Math.PI)"
                  :x2="100 + 83 * Math.cos((i * 3.6 * Math.PI) / 180 - Math.PI)"
                  :y2="100 + 83 * Math.sin((i * 3.6 * Math.PI) / 180 - Math.PI)"
                  stroke="#6b7280"
                  stroke-width="1"
                />
              </g>

              <!-- Danger Zone (Red Zone) -->
              <path
                :d="`M 100 100 L ${100 + 75 * Math.cos((144 * Math.PI) / 180)} ${100 + 75 * Math.sin((144 * Math.PI) / 180)} A 75 75 0 0 1 ${100 + 75 * Math.cos(0)} ${100 + 75 * Math.sin(0)} Z`"
                fill="rgba(239, 68, 68, 0.2)"
              />

              <!-- Needle -->
              <g
                :style="{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '100px 100px' }"
                class="transition-transform duration-1000 ease-out"
              >
                <!-- Needle Shadow -->
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="25"
                  stroke="rgba(0,0,0,0.3)"
                  stroke-width="3"
                  transform="translate(1,1)"
                />
                <!-- Main Needle -->
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="25"
                  stroke="#dc2626"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <!-- Needle Tip -->
                <circle cx="100" cy="25" r="2" fill="#dc2626" />
              </g>

              <!-- Center Hub -->
              <circle
                cx="100"
                cy="100"
                r="8"
                fill="url(#hubGradient)"
                stroke="#374151"
                stroke-width="1"
              />
              <circle cx="100" cy="100" r="4" fill="#1f2937" />

              <!-- Gradient Definitions -->
              <defs>
                <radialGradient id="hubGradient" cx="0.3" cy="0.3">
                  <stop offset="0%" stop-color="#f3f4f6" />
                  <stop offset="100%" stop-color="#6b7280" />
                </radialGradient>
              </defs>
            </svg>

            <!-- Brand Label -->
            <div class="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
              <div class="text-xs font-bold text-gray-800">PRESSURE</div>
              <div class="text-xs text-gray-600">PSI</div>
            </div>

            <!-- Digital Display -->
            <div class="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div
                class="bg-black text-green-400 px-3 py-1 rounded text-sm font-mono border border-gray-400"
              >
                {{ pressure.toFixed(1) }} PSI
              </div>
            </div>

            <!-- Status Indicator -->
            <div
              class="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  pressure < 70 ? 'bg-green-500' : pressure < 85 ? 'bg-yellow-500' : 'bg-red-500',
                ]"
                :style="{
                  boxShadow:
                    pressure < 70
                      ? '0 0 8px #10b981'
                      : pressure < 85
                        ? '0 0 8px #f59e0b'
                        : '0 0 8px #ef4444',
                }"
              ></div>
              <span class="text-xs text-gray-700 font-medium">
                {{ pressure < 70 ? 'NORMAL' : pressure < 85 ? 'CAUTION' : 'DANGER' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Control Panel -->
      <!-- <div class="mt-8 bg-gray-800 rounded-lg p-4 shadow-lg">
        <div class="text-white text-sm font-medium mb-3 text-center">Pressure Control</div>
        <div class="flex items-center space-x-4">
          <button
            @click="decreasePressure"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors duration-200 text-sm font-medium"
          >
            - 5 PSI
          </button>
          <input
            v-model.number="pressure"
            type="range"
            min="0"
            max="100"
            step="0.1"
            class="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            @input="updatePressure"
          />
          <button
            @click="increasePressure"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors duration-200 text-sm font-medium"
          >
            + 5 PSI
          </button>
        </div>
        <div class="text-gray-400 text-xs text-center mt-2">Range: 0-100 PSI</div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  width?: number
  height?: number
}

withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
})

const pressure = ref(0)

const needleAngle = computed(() => {
  // Convert pressure (0-100) to angle (-180 to 0 degrees)
  return -180 + (pressure.value / 100) * 180
})

const increasePressure = () => {
  if (pressure.value < 100) {
    pressure.value = Math.min(100, pressure.value + 5)
  }
}

const decreasePressure = () => {
  if (pressure.value > 0) {
    pressure.value = Math.max(0, pressure.value - 5)
  }
}

const updatePressure = (event: Event) => {
  const target = event.target as HTMLInputElement
  pressure.value = parseFloat(target.value)
}

// Simulate realistic pressure changes
onMounted(() => {
  // Start with a random pressure
  pressure.value = Math.random() * 60 + 20

  // Optional: Add subtle pressure fluctuations
  setInterval(() => {
    const fluctuation = (Math.random() - 0.5) * 2
    pressure.value = Math.max(0, Math.min(100, pressure.value + fluctuation))
  }, 3000)
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
</style>
