<template>
  <div class="absolute left-0 flex items-center justify-center h-full">
    <div class="relative">
      <!-- Water Tank Container -->
      <div class="relative">
        <!-- Tank Body -->
        <div
          class="relative bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden"
          :style="{
            width: width + 'px',
            height: height + 'px',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
          }"
        >
          <!-- Tank Inner Shadow -->
          <div
            class="absolute inset-3 bg-gradient-to-br from-slate-300/50 via-slate-400/30 to-slate-500/40 rounded-xl shadow-inner backdrop-blur-sm"
          >
            <!-- Glass Effect Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-xl"
            ></div>

            <!-- Water -->
            <div
              class="absolute bottom-0 left-0 right-0 transition-all duration-[2000ms] ease-in-out overflow-hidden"
              :style="{
                height: currentWaterLevel + '%',
                background: `linear-gradient(180deg, 
                  rgba(59, 130, 246, 0.95) 0%,
                  rgba(37, 99, 235, 0.98) 50%,
                  rgba(29, 78, 216, 1) 100%)`,
              }"
            >
              <!-- Water Surface Animation Layer 1 -->
              <div
                class="absolute top-0 left-0 right-0 h-8 overflow-hidden"
                style="transform: translateZ(0)"
              >
                <div
                  class="water-wave-1 absolute inset-0"
                  :style="{
                    background: `linear-gradient(90deg, 
                      transparent 0%,
                      rgba(147, 197, 253, 0.4) 25%,
                      rgba(196, 224, 255, 0.6) 50%,
                      rgba(147, 197, 253, 0.4) 75%,
                      transparent 100%)`,
                    filter: 'blur(1px)',
                  }"
                ></div>
              </div>

              <!-- Water Surface Animation Layer 2 -->
              <div
                class="absolute top-2 left-0 right-0 h-6 overflow-hidden"
                style="transform: translateZ(0)"
              >
                <div
                  class="water-wave-2 absolute inset-0"
                  :style="{
                    background: `linear-gradient(90deg,
                      transparent 0%,
                      rgba(219, 234, 254, 0.3) 30%,
                      rgba(255, 255, 255, 0.5) 50%,
                      rgba(219, 234, 254, 0.3) 70%,
                      transparent 100%)`,
                    filter: 'blur(0.5px)',
                  }"
                ></div>
              </div>

              <!-- Water Surface Animation Layer 3 (Shimmer) -->
              <div
                class="absolute top-4 left-0 right-0 h-4 overflow-hidden opacity-70"
                style="transform: translateZ(0)"
              >
                <div
                  class="water-shimmer absolute inset-0"
                  :style="{
                    background: `linear-gradient(90deg,
                      transparent 0%,
                      rgba(255, 255, 255, 0.2) 48%,
                      rgba(255, 255, 255, 0.4) 50%,
                      rgba(255, 255, 255, 0.2) 52%,
                      transparent 100%)`,
                  }"
                ></div>
              </div>

              <!-- Depth Gradient Overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent opacity-60"
              ></div>

              <!-- Bubbles -->
              <div
                v-for="bubble in bubbles"
                :key="bubble.id"
                class="bubble absolute rounded-full"
                :style="{
                  left: bubble.x + '%',
                  bottom: bubble.y + '%',
                  width: bubble.size + 'px',
                  height: bubble.size + 'px',
                  background: `radial-gradient(circle at 30% 30%, 
                    rgba(255, 255, 255, 0.9) 0%, 
                    rgba(219, 234, 254, 0.4) 50%,
                    rgba(147, 197, 253, 0.2) 100%)`,
                  boxShadow:
                    'inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(255, 255, 255, 0.3)',
                  animationDelay: bubble.delay + 's',
                  animationDuration: bubble.duration + 's',
                }"
              ></div>

              <!-- Light Reflection -->
              <div
                class="absolute top-0 left-0 w-full h-full opacity-30"
                style="
                  background: linear-gradient(
                    135deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 50%,
                    transparent 100%
                  );
                "
              ></div>
            </div>

            <!-- Water Level Transition Glow -->
            <div
              class="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-0 transition-opacity duration-500"
              :class="{ 'opacity-60 water-glow': isTransitioning }"
              :style="{ bottom: currentWaterLevel + '%' }"
            ></div>
          </div>

          <!-- Tank Label with Glow -->
          <div
            class="absolute top-4 left-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 rounded-lg text-sm font-mono shadow-lg border border-slate-600/50"
            style="
              box-shadow:
                0 4px 6px -1px rgba(0, 0, 0, 0.3),
                0 0 20px rgba(59, 130, 246, 0.2);
            "
          >
            <span class="font-bold tracking-wider">{{ props.tankId }}</span>
          </div>

          <!-- Capacity Indicator -->
          <div
            class="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-mono"
          >
            <span class="opacity-70">CAP:</span> {{ props.capacity }}L
          </div>
        </div>

        <!-- Tank Base with 3D Effect -->
        <div
          class="relative h-8 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 rounded-b-2xl mx-auto shadow-2xl border-x-4 border-b-4 border-slate-700"
          :style="{ width: width + 8 + 'px' }"
        >
          <div
            class="absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent"
          ></div>
        </div>
      </div>

      <!-- Measurement Scale -->
      <div
        class="absolute -right-32 top-0 h-full w-20 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 border-2 border-slate-400 rounded-r-xl shadow-xl"
        style="box-shadow: 5px 0 15px -3px rgba(0, 0, 0, 0.2)"
      >
        <!-- Scale Background -->
        <div
          class="absolute inset-1 bg-gradient-to-b from-white/90 to-slate-100/90 rounded-r-lg backdrop-blur-sm"
        >
          <!-- Major Scale Lines (every 20%) -->
          <div
            v-for="i in 6"
            :key="'major-' + i"
            class="absolute left-0 w-10 border-t-2 transition-all duration-300"
            :class="currentWaterLevel >= (i - 1) * 20 ? 'border-blue-600' : 'border-slate-700'"
            :style="{ bottom: (i - 1) * 20 + '%' }"
          >
            <span
              class="absolute -left-14 -top-2.5 text-xs font-mono font-bold transition-colors duration-300"
              :class="currentWaterLevel >= (i - 1) * 20 ? 'text-blue-600' : 'text-slate-700'"
            >
              {{ (i - 1) * 20 }}%
            </span>
          </div>

          <!-- Minor Scale Lines (every 10%) -->
          <div
            v-for="i in 11"
            :key="'minor-' + i"
            class="absolute left-0 w-6 border-t transition-all duration-300"
            :class="currentWaterLevel >= (i - 1) * 10 ? 'border-blue-500/60' : 'border-slate-500'"
            :style="{ bottom: (i - 1) * 10 + '%' }"
          >
            <span
              v-if="(i - 1) % 2 !== 0"
              class="absolute -left-9 -top-1.5 text-xs font-mono transition-colors duration-300"
              :class="currentWaterLevel >= (i - 1) * 10 ? 'text-blue-500' : 'text-slate-600'"
            >
              {{ (i - 1) * 10 }}
            </span>
          </div>

          <!-- Micro Scale Lines (every 5%) -->
          <div
            v-for="i in 21"
            :key="'micro-' + i"
            class="absolute left-0 w-3 border-t border-slate-400/40"
            :style="{ bottom: (i - 1) * 5 + '%' }"
          ></div>

          <!-- Water Level Indicator with Animation -->
          <div
            class="absolute -left-3 transition-all duration-[2000ms] ease-in-out"
            :style="{ bottom: currentWaterLevel + '%' }"
          >
            <!-- Indicator Arrow -->
            <div class="relative flex items-center">
              <div
                class="w-8 h-1 bg-gradient-to-r from-red-500 to-red-600 shadow-lg indicator-pulse"
              ></div>
              <div
                class="absolute -left-1 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-red-500"
              ></div>
            </div>

            <!-- Digital Display -->
            <div
              class="absolute -right-16 -top-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shadow-lg border border-red-500/30"
              style="
                box-shadow:
                  0 4px 6px -1px rgba(0, 0, 0, 0.3),
                  0 0 15px rgba(239, 68, 68, 0.4);
              "
            >
              <div class="flex items-center gap-2">
                <span class="font-bold">{{ Math.round(currentWaterLevel) }}%</span>
                <span class="opacity-80">|</span>
                <span>{{ Math.round((currentWaterLevel * props.capacity) / 100) }}L</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scale Title -->
        <div class="absolute -top-10 left-0 right-0 text-center">
          <span
            class="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider shadow-lg"
          >
            LEVEL
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface Props {
  width?: number
  height?: number
  waterLevel?: number
  tankId?: string
  capacity?: number
  enableAnimation?: boolean
  showBubbles?: boolean
}

// Props with TypeScript
const props = withDefaults(defineProps<Props>(), {
  width: 500,
  height: 640,
  waterLevel: 90,
  tankId: 'TANK-01',
  capacity: 1000,
  enableAnimation: true,
  showBubbles: true,
})

const bubbles = ref<Bubble[]>([])
const currentWaterLevel = ref(props.waterLevel)
const isTransitioning = ref(false)

// Generate random bubbles with better distribution
const generateBubbles = (): void => {
  if (!props.showBubbles) {
    bubbles.value = []
    return
  }

  const newBubbles: Bubble[] = []
  const bubbleCount = 12

  for (let i = 0; i < bubbleCount; i++) {
    newBubbles.push({
      id: Date.now() + i + Math.random(),
      x: 10 + Math.random() * 80,
      y: Math.random() * currentWaterLevel.value * 0.9,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
    })
  }
  bubbles.value = newBubbles
}

// Update water level with smooth transition
const updateWaterLevel = (): void => {
  isTransitioning.value = true
  currentWaterLevel.value = Math.max(0, Math.min(100, props.waterLevel))

  setTimeout(() => {
    isTransitioning.value = false
  }, 2000)
}

// Watch for prop changes
watch(
  () => props.waterLevel,
  (newLevel) => {
    updateWaterLevel()
  },
)

watch(
  () => props.showBubbles,
  (show) => {
    generateBubbles()
  },
)

let animationInterval: number | undefined
let bubbleInterval: number | undefined
let waveAnimationFrame: number | undefined

onMounted(() => {
  currentWaterLevel.value = props.waterLevel
  generateBubbles()

  // Regenerate bubbles periodically with stagger
  bubbleInterval = window.setInterval(() => {
    generateBubbles()
  }, 8000)

  // Subtle water level animation
  if (props.enableAnimation) {
    let time = 0
    const animate = () => {
      time += 0.02
      const variation = Math.sin(time) * 0.3 + Math.sin(time * 1.5) * 0.2
      currentWaterLevel.value = Math.max(0, Math.min(100, props.waterLevel + variation))
      waveAnimationFrame = requestAnimationFrame(animate)
    }
    waveAnimationFrame = requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  if (animationInterval) clearInterval(animationInterval)
  if (bubbleInterval) clearInterval(bubbleInterval)
  if (waveAnimationFrame) cancelAnimationFrame(waveAnimationFrame)
})
</script>

<style scoped>
/* Smooth Wave Animations */
@keyframes wave1 {
  0% {
    transform: translateX(-200%) translateZ(0);
  }
  100% {
    transform: translateX(200%) translateZ(0);
  }
}

@keyframes wave2 {
  0% {
    transform: translateX(200%) translateZ(0);
  }
  100% {
    transform: translateX(-200%) translateZ(0);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-200%) translateZ(0);
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateX(200%) translateZ(0);
    opacity: 0;
  }
}

.water-wave-1 {
  animation: wave1 8s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  will-change: transform;
}

.water-wave-2 {
  animation: wave2 12s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  animation-delay: -2s;
  will-change: transform;
}

.water-shimmer {
  animation: shimmer 15s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  will-change: transform, opacity;
}

/* Enhanced Bubble Animation */
@keyframes bubble-rise {
  0% {
    transform: translateY(0) translateX(0) scale(0.8);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
    transform: translateY(-5px) translateX(2px) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-20px) translateX(-3px) scale(1.05);
  }
  90% {
    opacity: 0.6;
    transform: translateY(-35px) translateX(4px) scale(0.95);
  }
  100% {
    transform: translateY(-40px) translateX(0) scale(0.9);
    opacity: 0;
  }
}

.bubble {
  animation: bubble-rise 4s cubic-bezier(0.33, 0, 0.67, 1) infinite;
  will-change: transform, opacity;
}

/* Water Glow Effect */
@keyframes water-glow {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.water-glow {
  animation: water-glow 2s ease-in-out;
}

/* Indicator Pulse */
@keyframes indicator-pulse {
  0%,
  100% {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 10px rgba(239, 68, 68, 0.5);
  }
  50% {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(239, 68, 68, 0.8);
  }
}

.indicator-pulse {
  animation: indicator-pulse 2s ease-in-out infinite;
}

/* Performance Optimizations */
* {
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}
</style>
