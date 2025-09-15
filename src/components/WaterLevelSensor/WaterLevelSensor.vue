<template>
  <div
    class="flex items-center justify-center w-full h-full p-8"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="absolute top-0 left-0 right-0 w-full">
      <!-- Main Sensor Housing -->
      <div
        class="absolute w-full h-80 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-lg shadow-2xl border-gray-600"
      >
        <!-- Top Cap -->
        <div
          class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-t-lg border border-gray-600"
        ></div>

        <!-- Brand Label -->
        <div
          class="absolute top-5 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded font-mono"
        >
          LEVEL-01
        </div>

        <!-- Water Level Display Window -->
        <div
          class="absolute top-16 left-2 right-2 h-48 bg-gray-800 rounded border-2 border-gray-700 overflow-hidden"
        >
          <!-- Water -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
            :style="{ height: waterLevel + '%' }"
          >
            <!-- Water Surface Animation -->
            <div
              class="absolute top-0 left-0 right-0 h-1 bg-blue-300 opacity-60 animate-pulse"
            ></div>

            <!-- Bubbles -->
            <div
              v-for="bubble in bubbles"
              :key="bubble.id"
              class="absolute w-1 h-1 bg-blue-200 rounded-full opacity-70 animate-bounce"
              :style="{
                left: bubble.x + '%',
                bottom: bubble.y + '%',
                animationDelay: bubble.delay + 's',
                animationDuration: bubble.duration + 's',
              }"
            ></div>
          </div>

          <!-- Level Markings -->
          <div class="absolute left-0 top-0 bottom-0 w-full">
            <div
              v-for="mark in levelMarks"
              :key="mark"
              class="absolute left-0 w-4 h-px bg-gray-500"
              :style="{ bottom: mark + '%' }"
            ></div>
            <div
              v-for="(mark, index) in [0, 25, 50, 75, 100]"
              :key="'label-' + mark"
              class="absolute right-1 text-xs text-gray-400 font-mono transform -translate-y-1/2"
              :style="{ bottom: mark + '%' }"
            >
              {{ mark }}
            </div>
          </div>
        </div>

        <!-- Digital Display -->
        <div
          class="absolute bottom-16 left-2 right-2 h-8 bg-black rounded border border-gray-600 flex items-center justify-center"
        >
          <span class="text-green-400 font-mono text-sm">{{ waterLevel.toFixed(1) }}%</span>
        </div>

        <!-- Status LEDs -->
        <div class="absolute bottom-8 left-4 flex space-x-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="waterLevel > 80 ? 'bg-red-500 shadow-red-500/50 shadow-lg' : 'bg-gray-600'"
          ></div>
          <div
            class="w-2 h-2 rounded-full"
            :class="
              waterLevel > 20 && waterLevel <= 80
                ? 'bg-green-500 shadow-green-500/50 shadow-lg'
                : 'bg-gray-600'
            "
          ></div>
          <div
            class="w-2 h-2 rounded-full"
            :class="
              waterLevel <= 20 ? 'bg-yellow-500 shadow-yellow-500/50 shadow-lg' : 'bg-gray-600'
            "
          ></div>
        </div>

        <!-- Control Knob -->
        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div
            class="relative w-8 h-8 bg-gradient-to-b from-gray-300 to-gray-600 rounded-full border-2 border-gray-700 cursor-pointer"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          >
            <div
              class="absolute top-1 left-1/2 w-px h-2 bg-gray-800 transform -translate-x-1/2"
              :style="{ transform: 'translateX(-50%) rotate(' + waterLevel * 2.7 + 'deg)' }"
            ></div>
            <div
              class="absolute inset-1 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full"
            ></div>
          </div>
        </div>

        <!-- Mounting Bolts -->
        <div
          class="absolute -left-1 top-8 w-2 h-2 bg-gray-700 rounded-full border border-gray-800"
        ></div>
        <div
          class="absolute -right-1 top-8 w-2 h-2 bg-gray-700 rounded-full border border-gray-800"
        ></div>
        <div
          class="absolute -left-1 bottom-24 w-2 h-2 bg-gray-700 rounded-full border border-gray-800"
        ></div>
        <div
          class="absolute -right-1 bottom-24 w-2 h-2 bg-gray-700 rounded-full border border-gray-800"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  width?: number
  height?: number
}

withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
})

const waterLevel = ref(45)
const isDragging = ref(false)
const bubbles = ref<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>(
  [],
)
const levelMarks = ref([10, 20, 30, 40, 50, 60, 70, 80, 90])

const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  event.preventDefault()
}

const onDrag = (event: MouseEvent) => {
  if (isDragging.value) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const deltaY = centerY - event.clientY
    const newLevel = Math.max(0, Math.min(100, waterLevel.value + deltaY * 0.5))
    waterLevel.value = newLevel
  }
}

const stopDrag = () => {
  isDragging.value = false
}

const generateBubbles = () => {
  bubbles.value = []
  if (waterLevel.value > 10) {
    for (let i = 0; i < 5; i++) {
      bubbles.value.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * (waterLevel.value - 10),
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 2,
      })
    }
  }
}

const updateBubbles = () => {
  generateBubbles()
}

onMounted(() => {
  generateBubbles()
  setInterval(updateBubbles, 2000)
})

watch(waterLevel, () => {
  generateBubbles()
})
</script>
