<template>
  <div
    v-if="group"
    class="absolute pointer-events-none"
    :style="{
      left: group.x + 'px',
      top: group.y + 'px',
      width: group.width + 'px',
      height: group.height + 'px',
      zIndex: 5,
    }"
  >
    <!-- Group border -->
    <div
      class="absolute inset-0 border-2 border-dashed rounded-lg pointer-events-none transition-colors"
      :class="{
        'border-purple-400': !selected,
        'border-purple-600': selected,
      }"
    ></div>

    <!-- Group label -->
    <div
      class="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-sm font-medium pointer-events-none"
      style="font-size: 10px"
    >
      Group ({{ groupComponents.length }} items)
    </div>

    <!-- Group selection area for clicking (invisible overlay) -->
    <div
      class="absolute inset-0 pointer-events-auto cursor-move transition-all duration-200 hover:bg-opacity-20"
      @mousedown.stop="handleGroupMouseDown"
      @click.stop="handleGroupClick"
      @contextmenu.stop="handleGroupRightClick"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ComponentGroup {
  id: number
  components: number[]
  x: number
  y: number
  width: number
  height: number
}

interface DroppedComponent {
  id: number
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: 'left' | 'right'
  groupId?: number | null
}

interface Props {
  group: ComponentGroup
  components: DroppedComponent[]
  selected?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'group-mousedown': [event: MouseEvent, group: ComponentGroup]
  'group-click': [event: MouseEvent, group: ComponentGroup]
  'group-contextmenu': [event: MouseEvent, group: ComponentGroup]
}>()

const groupComponents = computed(() => {
  return props.components.filter((c) => props.group.components.includes(c.id))
})

const handleGroupMouseDown = (event: MouseEvent) => {
  emit('group-mousedown', event, props.group)
}

const handleGroupClick = (event: MouseEvent) => {
  emit('group-click', event, props.group)
}

const handleGroupRightClick = (event: MouseEvent) => {
  emit('group-contextmenu', event, props.group)
}
</script>
