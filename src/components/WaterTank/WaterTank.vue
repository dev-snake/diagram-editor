<template>
  <div class="flex items-center justify-center min-h-screen p-8">
    <div class="relative">
      <!-- Water Tank Container -->
      <div class="relative">
        <!-- Tank Body -->
        <div
          class="relative w-96 h-[600px] bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-lg shadow-2xl border-4 border-gray-700 overflow-hidden"
        >
          <!-- Tank Inner Shadow -->
          <div
            class="absolute inset-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-md shadow-inner"
          >
            <!-- Water -->
            <div
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 transition-all duration-1000 ease-in-out overflow-hidden"
              :style="{ height: waterLevel + '%' }"
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
            TANK-01
          </div>
        </div>

        <!-- Tank Base -->
        <div
          class="w-84 h-6 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-xl mx-auto shadow-lg border-x-4 border-b-4 border-gray-700"
        ></div>
      </div>

      <!-- Measurement Scale -->
      <div
        class="absolute -right-28 top-0 h-[600px] w-16 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 border-2 border-gray-400 rounded-r-lg shadow-lg"
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
            :style="{ bottom: waterLevel + '%' }"
          >
            <div
              class="absolute -left-1 top-0 w-0 h-0 border-l-2 border-l-red-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"
            ></div>
            <div
              class="absolute -right-12 -top-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap"
            >
              {{ Math.round(waterLevel) }}% | {{ Math.round(waterLevel * 10) }}L
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
import { ref, onMounted, onUnmounted } from 'vue'

const waterLevel = ref(65)
const bubbles = ref([])

// Generate random bubbles
const generateBubbles = () => {
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

// Simulate water level fluctuation
const simulateWaterMovement = () => {
  const baseLevel = 65
  const variation = 3
  waterLevel.value = baseLevel + Math.sin(Date.now() / 5000) * variation
}

let animationInterval

onMounted(() => {
  generateBubbles()

  // Regenerate bubbles every 6 seconds
  setInterval(generateBubbles, 6000)

  // Animate water level
  animationInterval = setInterval(simulateWaterMovement, 100)
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
