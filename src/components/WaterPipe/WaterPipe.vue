<template>
  <div
    class="flex items-center h-full"
    :class="direction === 'right' ? 'flex-row-reverse' : ''"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <!-- Pipe end fitting -->
    <div
      class="w-full h-full shadow-lg border-2 border-gray-700 relative"
      :class="[
        direction === 'right'
          ? 'bg-gradient-to-l from-gray-400 to-gray-600 rounded-r-lg'
          : 'bg-gradient-to-r from-gray-400 to-gray-600 rounded-l-lg',
      ]"
    >
      <!-- Bolts -->
      <div
        class="absolute top-2 w-2 h-2 bg-gray-800 rounded-full shadow-inner"
        :class="direction === 'right' ? 'left-1' : 'right-1'"
      ></div>
      <div
        class="absolute bottom-2 w-2 h-2 bg-gray-800 rounded-full shadow-inner"
        :class="direction === 'right' ? 'left-1' : 'right-1'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props để điều chỉnh độ dài ống và hướng
interface Props {
  pipeLength?: number // Độ dài của ống (px)
  direction?: 'left' | 'right' // Hướng của ống: 'left' (mặc định) hoặc 'right'
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  pipeLength: 90, // Độ dài mặc định 90px
  direction: 'left', // Hướng mặc định: trái
  width: 360,
  height: 440,
})
</script>

<style scoped>
/* Animation cho flow từ phải sang trái */
@keyframes flowLeft {
  0% {
    left: 100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: -8px;
    opacity: 0;
  }
}

/* Animation cho flow từ trái sang phải */
@keyframes flowRight {
  0% {
    left: -8px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}
</style>
