<template>
  <div
    class="flex items-center justify-center w-full h-full p-8 bg-gradient-to-br from-slate-50 to-slate-100"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="relative">
      <!-- Main Sensor Housing with realistic metallic finish -->
      <div
        class="relative w-64 h-96 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-xl shadow-2xl"
        style="
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            inset 0 2px 4px rgba(255, 255, 255, 0.5),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        "
      >
        <!-- Top Cap with realistic depth -->
        <div
          class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 rounded-t-2xl"
          style="
            box-shadow:
              0 -2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 2px rgba(255, 255, 255, 0.8);
          "
        >
          <!-- Cap detail -->
          <div
            class="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-zinc-500 rounded-full opacity-30"
          ></div>
        </div>

        <!-- Brand Label with embossed effect -->
        <div
          class="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-gray-900 to-black text-cyan-400 text-xs px-3 py-1.5 rounded font-mono tracking-wider"
          style="
            box-shadow:
              inset 0 1px 2px rgba(0, 0, 0, 0.5),
              0 1px 1px rgba(255, 255, 255, 0.1);
          "
        >
          {{ props.sensorId }}
        </div>

        <!-- Water Level Display Window with glass effect -->
        <div
          class="absolute top-20 left-4 right-4 h-52 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden"
          style="
            box-shadow:
              inset 0 4px 8px rgba(0, 0, 0, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.3),
              0 1px 2px rgba(255, 255, 255, 0.1);
          "
        >
          <!-- Glass reflection -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white opacity-5 pointer-events-none"
          ></div>

          <!-- Water with realistic gradient -->
          <div
            class="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            :style="{ height: internalWaterLevel + '%' }"
          >
            <!-- Multi-layer water effect -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 opacity-90"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-blue-800 to-transparent opacity-40"
            ></div>

            <!-- Water Surface Animation with waves -->
            <div class="absolute top-0 left-0 right-0 h-2">
              <div
                class="absolute inset-0 bg-gradient-to-b from-cyan-300 to-transparent opacity-60 animate-pulse"
              ></div>
              <div
                class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                style="animation: wave 3s linear infinite"
              ></div>
            </div>

            <!-- Enhanced Bubbles -->
            <div
              v-for="bubble in bubbles"
              :key="bubble.id"
              class="absolute rounded-full"
              :class="bubble.y > 50 ? 'w-1.5 h-1.5' : 'w-1 h-1'"
              style="
                background: radial-gradient(
                  circle at 30% 30%,
                  rgba(255, 255, 255, 0.8),
                  rgba(100, 200, 255, 0.4)
                );
              "
              :style="{
                left: bubble.x + '%',
                bottom: bubble.y + '%',
                animationDelay: bubble.delay + 's',
                animationDuration: bubble.duration + 's',
                animation: 'float ' + bubble.duration + 's ease-in-out infinite',
              }"
            ></div>
          </div>

          <!-- Level Markings with better visibility -->
          <div class="absolute left-0 top-0 bottom-0 w-full">
            <div
              v-for="mark in levelMarks"
              :key="mark"
              class="absolute left-1 right-1 h-px bg-gray-600 opacity-50"
              :style="{ bottom: mark + '%' }"
            ></div>
            <div
              v-for="(mark, index) in [0, 25, 50, 75, 100]"
              :key="'label-' + mark"
              class="absolute right-2 text-xs text-gray-400 font-mono font-semibold transform -translate-y-1/2"
              :style="{ bottom: mark + '%' }"
            >
              {{ mark }}
            </div>
          </div>

          <!-- Grid overlay for industrial look -->
          <div class="absolute inset-0 opacity-10">
            <div
              class="w-full h-full"
              style="
                background-image: repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 9px,
                  rgba(255, 255, 255, 0.1) 9px,
                  rgba(255, 255, 255, 0.1) 10px
                );
              "
            ></div>
          </div>
        </div>

        <!-- Digital Display with LCD effect -->
        <div
          class="absolute bottom-20 left-4 right-4 h-10 bg-black rounded-md flex items-center justify-center overflow-hidden"
          style="
            box-shadow:
              inset 0 2px 8px rgba(0, 0, 0, 0.8),
              0 1px 2px rgba(255, 255, 255, 0.1);
            background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
          "
        >
          <!-- LCD glow effect -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent to-green-900 opacity-20"
          ></div>
          <span
            class="text-green-400 font-mono text-lg font-bold tracking-wider drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
          >
            {{ internalWaterLevel.toFixed(1) }}{{ props.unit }}
          </span>
        </div>

        <!-- Status LEDs with realistic glow -->
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <div class="relative">
            <div
              class="w-3 h-3 rounded-full border border-gray-700"
              :class="alertStatus === 'high' ? 'bg-red-500' : 'bg-gray-700'"
            ></div>
            <div
              v-if="alertStatus === 'high'"
              class="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75"
            ></div>
          </div>
          <div class="relative">
            <div
              class="w-3 h-3 rounded-full border border-gray-700"
              :class="alertStatus === 'normal' ? 'bg-green-500' : 'bg-gray-700'"
            ></div>
            <div
              v-if="alertStatus === 'normal'"
              class="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-pulse opacity-50"
            ></div>
          </div>
          <div class="relative">
            <div
              class="w-3 h-3 rounded-full border border-gray-700"
              :class="alertStatus === 'low' ? 'bg-yellow-500' : 'bg-gray-700'"
            ></div>
            <div
              v-if="alertStatus === 'low'"
              class="absolute inset-0 w-3 h-3 rounded-full bg-yellow-500 animate-ping opacity-75"
            ></div>
          </div>
        </div>

        <!-- Control Knob with metallic finish -->
        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div
            class="relative w-10 h-10 rounded-full"
            :class="{
              'cursor-pointer': props.enableControl,
              'cursor-not-allowed opacity-50': !props.enableControl,
            }"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
            style="
              background: radial-gradient(circle at 30% 30%, #e5e7eb, #6b7280);
              box-shadow:
                0 4px 6px -1px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                inset 0 1px 2px rgba(255, 255, 255, 0.5),
                inset 0 -1px 2px rgba(0, 0, 0, 0.3);
            "
          >
            <!-- Knob indicator -->
            <div
              class="absolute top-1 left-1/2 w-0.5 h-3 bg-gray-900 transform-gpu -translate-x-1/2 origin-bottom"
              :style="{
                transform: 'translateX(-50%) rotate(' + (internalWaterLevel * 2.7 - 135) + 'deg)',
              }"
            ></div>
            <!-- Center detail -->
            <div
              class="absolute inset-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"
            ></div>
            <!-- Grip dots -->
            <div
              class="absolute top-1 left-1/2 w-1 h-1 bg-gray-800 rounded-full transform -translate-x-1/2"
            ></div>
          </div>
        </div>

        <!-- Mounting Screws with realistic detail -->
        <div class="absolute top-8 left-2">
          <div class="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 relative">
            <div
              class="absolute inset-0.5 rounded-full bg-gradient-to-tl from-gray-700 to-gray-500"
            ></div>
            <div
              class="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-900 transform -translate-x-1/2 -translate-y-1/2"
            ></div>
          </div>
        </div>
        <div class="absolute top-8 right-2">
          <div class="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 relative">
            <div
              class="absolute inset-0.5 rounded-full bg-gradient-to-tl from-gray-700 to-gray-500"
            ></div>
            <div
              class="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-900 transform -translate-x-1/2 -translate-y-1/2"
            ></div>
          </div>
        </div>
        <div class="absolute bottom-28 left-2">
          <div class="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 relative">
            <div
              class="absolute inset-0.5 rounded-full bg-gradient-to-tl from-gray-700 to-gray-500"
            ></div>
            <div
              class="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-900 transform -translate-x-1/2 -translate-y-1/2"
            ></div>
          </div>
        </div>
        <div class="absolute bottom-28 right-2">
          <div class="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 relative">
            <div
              class="absolute inset-0.5 rounded-full bg-gradient-to-tl from-gray-700 to-gray-500"
            ></div>
            <div
              class="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-900 transform -translate-x-1/2 -translate-y-1/2"
            ></div>
          </div>
        </div>

        <!-- Side ventilation grills -->
        <div class="absolute top-1/2 -left-1 transform -translate-y-1/2">
          <div class="space-y-1">
            <div class="w-1 h-6 bg-gray-700 rounded-r"></div>
            <div class="w-1 h-6 bg-gray-700 rounded-r"></div>
            <div class="w-1 h-6 bg-gray-700 rounded-r"></div>
          </div>
        </div>
        <div class="absolute top-1/2 -right-1 transform -translate-y-1/2">
          <div class="space-y-1">
            <div class="w-1 h-6 bg-gray-700 rounded-l"></div>
            <div class="w-1 h-6 bg-gray-700 rounded-l"></div>
            <div class="w-1 h-6 bg-gray-700 rounded-l"></div>
          </div>
        </div>
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

<style>
@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
}
</style>
