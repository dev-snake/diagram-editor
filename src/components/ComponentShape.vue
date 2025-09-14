<template>
  <div
    class="component-shape cursor-pointer relative"
    :class="{ selected: selected }"
    @click="$emit('click')"
  >
    <!-- Rectangle -->
    <div
      v-if="type === 'rectangle'"
      class="bg-red-500 transition-all duration-200"
      :class="{
        'border border-dotted border-blue-400': selected,
        'hover:shadow-xl': !selected,
      }"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></div>

    <!-- Circle -->
    <div
      v-else-if="type === 'circle'"
      class="bg-green-500 border-2 border-green-600 rounded-full shadow-lg transition-all duration-200"
      :class="{
        'ring-2 ring-green-400 ring-offset-2': selected,
        'hover:shadow-xl': !selected,
      }"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></div>

    <!-- Triangle -->
    <div
      v-else-if="type === 'triangle'"
      class="relative"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <div
        class="w-0 h-0 shadow-lg transition-all duration-200"
        :class="{
          'border-b-purple-500': !selected,
          'border-b-purple-400': selected,
        }"
        :style="{
          borderLeft: width / 2 + 'px solid transparent',
          borderRight: width / 2 + 'px solid transparent',
          borderBottom: height + 'px solid',
        }"
      ></div>
      <div
        v-if="selected"
        class="absolute -inset-2 ring-2 ring-purple-400 ring-offset-2 rounded-sm"
      ></div>
    </div>

    <!-- Text Box -->
    <div v-else-if="type === 'textbox'" class="relative">
      <div
        class="bg-white border-2 border-gray-400 rounded-sm shadow-lg flex items-center justify-center transition-all duration-200"
        :class="{
          'ring-2 ring-gray-400 ring-offset-2': selected,
          'hover:shadow-xl border-gray-500': !selected,
        }"
        :style="{ width: width + 'px', height: height + 'px' }"
      >
        <span class="text-sm text-gray-700 select-none font-medium">Text</span>
      </div>
    </div>

    <!-- Unknown type fallback -->
    <div
      v-else
      class="bg-gray-300 border-2 border-gray-400 rounded-sm shadow-lg flex items-center justify-center transition-all duration-200"
      :class="{
        'ring-2 ring-gray-400 ring-offset-2': selected,
        'hover:shadow-xl': !selected,
      }"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <span class="text-xs text-gray-600 font-medium">?</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: string
  width: number
  height: number
  selected?: boolean
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.component-shape {
  transition: all 0.2s ease;
}

.component-shape:hover:not(.selected) {
  transform: scale(1.02);
}

.selected {
  z-index: 20;
}

.component-shape:active {
  transform: scale(0.98);
}
</style>
