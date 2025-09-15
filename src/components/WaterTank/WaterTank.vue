<template>
  <div class="absolute left-0 flex items-center justify-center h-full">
    <div class="relative">
      <!-- Water Tank Container -->
      <div class="relative">
        <!-- Tank Body -->
        <div
          class="relative bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-lg shadow-2xl border-4 border-gray-700 overflow-hidden"
          :style="{ width: width + 'px', height: height + 'px' }"
        >
          <!-- Tank Inner Shadow -->
          <div
            class="absolute inset-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-md shadow-inner"
          >
            <!-- Water -->
            <div
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 transition-all duration-1000 ease-in-out overflow-hidden"
              :style="{ height: currentWaterLevel + '%' }"
            >
              <!-- Water Surface Animation -->
              <div
                class="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300 opacity-60"
              >
                <div
                  class="wave-animation absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                ></div>
              </div>

              <!-- Water Ripples -->
              <div
                class="absolute top-2 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 opacity-40"
              >
                <div
                  class="wave-animation-2 absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                ></div>
              </div>

              <!-- Bubbles -->
              <div
                v-for="bubble in bubbles"
                :key="bubble.id"
                class="absolute bg-white rounded-full opacity-60 animate-bounce"
                :style="{
                  left: bubble.x + '%',
                  bottom: bubble.y + '%',
                  width: bubble.size + 'px',
                  height: bubble.size + 'px',
                  animationDelay: bubble.delay + 's',
                  animationDuration: bubble.duration + 's',
                }"
              ></div>
            </div>
          </div>

          <!-- Tank Label -->
          <div
            class="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded text-sm font-mono"
          >
            {{ props.tankId }}
          </div>
        </div>

        <!-- Tank Base -->
        <div
          class="w-84 h-6 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-xl mx-auto shadow-lg border-x-4 border-b-4 border-gray-700"
        ></div>
      </div>

      <!-- Measurement Scale -->
      <div
        class="absolute -right-28 top-0 h-full w-16 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 border-2 border-gray-400 rounded-r-lg shadow-lg"
      >
        <!-- Scale Background -->
        <div class="absolute inset-1 bg-gradient-to-b from-gray-100 to-gray-200 rounded-r-md">
          <!-- Major Scale Lines (every 20%) -->
          <div
            v-for="i in 6"
            :key="'major-' + i"
            class="absolute left-0 w-8 border-t-2 border-gray-700"
            :style="{ bottom: (i - 1) * 20 + '%' }"
          >
            <span class="absolute -left-12 -top-2 text-xs font-mono text-gray-700 font-bold"
              >{{ (i - 1) * 20 }}%</span
            >
          </div>

          <!-- Minor Scale Lines (every 10%) -->
          <div
            v-for="i in 11"
            :key="'minor-' + i"
            class="absolute left-0 w-6 border-t border-gray-600"
            :style="{ bottom: (i - 1) * 10 + '%' }"
          >
            <span
              v-if="(i - 1) % 2 !== 0"
              class="absolute -left-8 -top-1 text-xs font-mono text-gray-600"
              >{{ (i - 1) * 10 }}</span
            >
          </div>

          <!-- Micro Scale Lines (every 5%) -->
          <div
            v-for="i in 21"
            :key="'micro-' + i"
            class="absolute left-0 w-3 border-t border-gray-500 opacity-60"
            :style="{ bottom: (i - 1) * 5 + '%' }"
          ></div>

          <!-- Water Level Indicator -->
          <div
            class="absolute -left-2 w-6 h-1 bg-red-500 shadow-lg transition-all duration-1000 ease-in-out"
            :style="{ bottom: currentWaterLevel + '%' }"
          >
            <div
              class="absolute -left-1 top-0 w-0 h-0 border-l-2 border-l-red-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"
            ></div>
            <div
              class="absolute -right-12 -top-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap"
            >
              {{ Math.round(currentWaterLevel) }}% |
              {{ Math.round((currentWaterLevel * props.capacity) / 100) }}L
            </div>
          </div>
        </div>

        <!-- Scale Title -->
        <div class="absolute -top-8 left-0 right-0 text-center">
          <span class="bg-gray-700 text-white px-2 py-1 rounded text-xs font-mono">LEVEL</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  width: {
    type: Number,
    default: 500,
  },
  height: {
    type: Number,
    default: 640,
  },
  // Dynamic data props
  waterLevel: {
    type: Number,
    default: 65,
    validator: (value) => value >= 0 && value <= 100,
  },
  tankId: {
    type: String,
    default: 'TANK-01',
  },
  capacity: {
    type: Number,
    default: 1000, // Liters
  },
  enableAnimation: {
    type: Boolean,
    default: true,
  },
  showBubbles: {
    type: Boolean,
    default: true,
  },
})

const bubbles = ref([])
const currentWaterLevel = ref(props.waterLevel)

// Generate random bubbles
const generateBubbles = () => {
  if (!props.showBubbles) {
    bubbles.value = []
    return
  }

  const newBubbles = []
  for (let i = 0; i < 8; i++) {
    newBubbles.push({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 5,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    })
  }
  bubbles.value = newBubbles
}

// Update water level with smooth transition
const updateWaterLevel = () => {
  currentWaterLevel.value = props.waterLevel
}

// Watch for prop changes
watch(
  () => props.waterLevel,
  () => {
    updateWaterLevel()
  },
)

watch(
  () => props.showBubbles,
  () => {
    generateBubbles()
  },
)

let animationInterval

onMounted(() => {
  currentWaterLevel.value = props.waterLevel
  generateBubbles()

  // Regenerate bubbles every 6 seconds
  setInterval(generateBubbles, 6000)

  // Optional: Add slight animation if enabled
  if (props.enableAnimation) {
    animationInterval = setInterval(() => {
      const variation = 0.5
      currentWaterLevel.value = props.waterLevel + Math.sin(Date.now() / 5000) * variation
    }, 100)
  }
})

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
})
</script>

<style scoped>
@keyframes wave {
  0%,
  100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

@keyframes wave2 {
  0%,
  100% {
    transform: translateX(100%);
  }
  50% {
    transform: translateX(-100%);
  }
}

.wave-animation {
  animation: wave 4s ease-in-out infinite;
}

.wave-animation-2 {
  animation: wave2 6s ease-in-out infinite;
}

/* Custom bounce animation for bubbles */
@keyframes bubble-float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 0.8;
  }
}

.animate-bounce {
  animation: bubble-float 3s ease-in-out infinite;
}
</style>
