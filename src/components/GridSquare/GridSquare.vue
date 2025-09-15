<template>
  <div
    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700 rounded-sm shadow-lg"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div
      class="relative grid grid-cols-3 grid-rows-3 gap-1 p-2"
      :style="{
        width: Math.max(width - 8, 24) + 'px',
        height: Math.max(height - 8, 24) + 'px',
        minHeight: '24px',
        minWidth: '24px',
      }"
    >
      <!-- Tạo 9 ô vuông con (3x3) -->
      <div
        v-for="i in 9"
        :key="i"
        class="relative bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-600 rounded-xs shadow-inner"
        :style="{
          width: cellSize + 'px',
          height: cellSize + 'px',
          minWidth: '4px',
          minHeight: '4px',
        }"
      >
        <!-- Inner highlight for 3D effect on each cell -->
        <div
          class="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-30 rounded-xs"
          :style="{ height: Math.max(cellSize * 0.4, 1) + 'px' }"
        ></div>

        <!-- Bottom shadow for depth -->
        <div
          class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent opacity-20 rounded-xs"
          :style="{ height: Math.max(cellSize * 0.3, 1) + 'px' }"
        ></div>
      </div>

      <!-- Overall highlight effect for the entire grid -->
      <div
        class="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-15 pointer-events-none rounded-sm"
        :style="{ height: Math.max((height - 8) * 0.3, 2) + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width: number // Chiều rộng component (từ Canvas)
  height: number // Chiều cao component (từ Canvas)
}

const props = defineProps<Props>()

// Tính toán kích thước mỗi ô vuông con dựa trên kích thước t ổng thể
const cellSize = computed(() => {
  const availableWidth = Math.max(props.width - 16, 24) // Trừ padding và border
  const availableHeight = Math.max(props.height - 16, 24)
  const minDimension = Math.min(availableWidth, availableHeight)
  return Math.max((minDimension - 8) / 3, 4) // Chia cho 3 và trừ gap, tối thiểu 4px
})
</script>

<style scoped>
.rounded-xs {
  border-radius: 1px;
}
</style>
