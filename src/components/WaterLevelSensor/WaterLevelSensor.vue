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
          {{ props.sensorId }}
        </div>

        <!-- Water Level Display Window -->
        <div
          class="absolute top-16 left-2 right-2 h-48 bg-gray-800 rounded border-2 border-gray-700 overflow-hidden"
        >
          <!-- Water -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
            :style="{ height: internalWaterLevel + '%' }"
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
          <span class="text-green-400 font-mono text-sm"
            >{{ internalWaterLevel.toFixed(1) }}{{ props.unit }}</span
          >
        </div>

        <!-- Status LEDs -->
        <div class="absolute bottom-8 left-4 flex space-x-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="
              alertStatus === 'high' ? 'bg-red-500 shadow-red-500/50 shadow-lg' : 'bg-gray-600'
            "
          ></div>
          <div
            class="w-2 h-2 rounded-full"
            :class="
              alertStatus === 'normal'
                ? 'bg-green-500 shadow-green-500/50 shadow-lg'
                : 'bg-gray-600'
            "
          ></div>
          <div
            class="w-2 h-2 rounded-full"
            :class="
              alertStatus === 'low' ? 'bg-yellow-500 shadow-yellow-500/50 shadow-lg' : 'bg-gray-600'
            "
          ></div>
        </div>

        <!-- Control Knob -->
        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div
            class="relative w-8 h-8 bg-gradient-to-b from-gray-300 to-gray-600 rounded-full border-2 border-gray-700"
            :class="{
              'cursor-pointer': props.enableControl,
              'cursor-not-allowed': !props.enableControl,
            }"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          >
            <div
              class="absolute top-1 left-1/2 w-px h-2 bg-gray-800 transform -translate-x-1/2"
              :style="{ transform: 'translateX(-50%) rotate(' + internalWaterLevel * 2.7 + 'deg)' }"
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
import { ref, onMounted, watch, computed } from 'vue'

interface Props {
  width?: number
  height?: number
  // Dynamic data props
  waterLevel?: number
  sensorId?: string
  unit?: string
  minLevel?: number
  maxLevel?: number
  enableControl?: boolean
  showBubbles?: boolean
  alertThresholds?: {
    low: number
    high: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  width: 360,
  height: 440,
  waterLevel: 45,
  sensorId: 'LEVEL-01',
  unit: '%',
  minLevel: 0,
  maxLevel: 100,
  enableControl: true,
  showBubbles: true,
  alertThresholds: () => ({ low: 20, high: 80 }),
})

const emit = defineEmits<{
  'update:waterLevel': [value: number]
  levelChange: [value: number]
  alert: [type: 'low' | 'high' | 'normal', level: number]
}>()

const internalWaterLevel = ref(props.waterLevel)
const isDragging = ref(false)
const bubbles = ref<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>(
  [],
)
const levelMarks = ref([10, 20, 30, 40, 50, 60, 70, 80, 90])

// Alert status based on thresholds
const alertStatus = computed(() => {
  const level = internalWaterLevel.value
  if (level <= props.alertThresholds.low) return 'low'
  if (level >= props.alertThresholds.high) return 'high'
  return 'normal'
})

const startDrag = (event: MouseEvent) => {
  if (!props.enableControl) return
  isDragging.value = true
  event.preventDefault()
}

const onDrag = (event: MouseEvent) => {
  if (isDragging.value && props.enableControl) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const deltaY = centerY - event.clientY
    const newLevel = Math.max(
      props.minLevel,
      Math.min(props.maxLevel, internalWaterLevel.value + deltaY * 0.5),
    )

    internalWaterLevel.value = newLevel
    emit('update:waterLevel', newLevel)
    emit('levelChange', newLevel)
  }
}

const stopDrag = () => {
  isDragging.value = false
}

const generateBubbles = () => {
  bubbles.value = []
  if (props.showBubbles && internalWaterLevel.value > 10) {
    for (let i = 0; i < 5; i++) {
      bubbles.value.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * (internalWaterLevel.value - 10),
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 2,
      })
    }
  }
}

const updateBubbles = () => {
  generateBubbles()
}

// Watch for prop changes
watch(
  () => props.waterLevel,
  (newValue) => {
    internalWaterLevel.value = newValue
  },
)

watch(
  () => internalWaterLevel.value,
  (newLevel) => {
    generateBubbles()

    // Emit alerts based on thresholds
    const status = alertStatus.value
    emit('alert', status, newLevel)
  },
)

onMounted(() => {
  internalWaterLevel.value = props.waterLevel
  generateBubbles()
  setInterval(updateBubbles, 2000)
})
</script>
