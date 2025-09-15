<template>
  <div
    class="w-full h-full flex items-center justify-center bg-red-400 bg-gradient-to-r from-gray-500 to-gray-600"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div
      class="relative"
      :style="{
        width: Math.max(width - 4, 16) + 'px',
        height: Math.max(height - 4, 8) + 'px',
        minHeight: '8px',
        minWidth: '16px',
      }"
    >
      <!-- Inner highlight for 3D effect -->
      <div
        class="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-20"
        :style="{ height: Math.max((height - 4) * 0.3, 2) + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  width: number // Chiều rộng component (từ Canvas)
  height: number // Chiều cao component (từ Canvas)
}

const props = defineProps<Props>()
</script>

<style scoped></style>
