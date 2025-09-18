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
        'border-purple-400': !selected && !isNestedGroup && !isSuperGroup,
        'border-purple-600': selected && !isNestedGroup && !isSuperGroup,
        'border-blue-400': !selected && isNestedGroup,
        'border-blue-600': selected && isNestedGroup,
        'border-orange-400': !selected && isSuperGroup,
        'border-orange-600': selected && isSuperGroup,
      }"
    ></div>

    <!-- Group label -->
    <div
      class="absolute -top-6 left-0 text-white text-xs px-2 py-1 rounded-sm font-medium pointer-events-none"
      :class="{
        'bg-purple-500': !isNestedGroup && !isSuperGroup,
        'bg-blue-500': isNestedGroup,
        'bg-orange-500': isSuperGroup,
      }"
      style="font-size: 10px"
    >
      {{ isSuperGroup ? 'Super Group' : isNestedGroup ? 'Nested Group' : 'Group' }}
      ({{ totalItemsCount }} items)
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
import type { ComponentGroup, DroppedComponent } from '@/types/component'
import { computed } from 'vue'

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
  return props.components.filter((c: DroppedComponent) =>
    props.group.components.includes(c.component_id),
  )
})

const totalItemsCount = computed(() => {
  let count = groupComponents.value.length
  // Add nested groups count if any
  if (props.group.groups && props.group.groups.length > 0) {
    count += props.group.groups.length
  }
  return count
})

const isNestedGroup = computed(() => {
  return props.group.parentGroupId !== null && props.group.parentGroupId !== undefined
})

const isSuperGroup = computed(() => {
  return props.group.groups && props.group.groups.length > 0
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
