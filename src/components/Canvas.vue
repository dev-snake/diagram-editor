<template>
  <div
    ref="canvasContainer"
    class="relative w-full h-full overflow-hidden bg-white focus:outline-none"
    tabindex="0"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @click="handleCanvasClick"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
  >
    <!-- Grid Pattern -->
    <div class="absolute inset-0 pointer-events-none" :style="gridStyle"></div>

    <!-- Canvas Content -->
    <div
      ref="canvasContent"
      class="absolute origin-top-left transition-transform duration-100"
      :style="contentStyle"
    >
      <!-- Dropped Components -->
      <div
        v-for="component in components"
        :key="component.id"
        data-canvas-component
        :style="{
          position: 'absolute',
          left: component.x + 'px',
          top: component.y + 'px',
          width: component.width + 'px',
          height: component.height + 'px',
          zIndex: component.groupId ? 15 : 10,
        }"
        :class="{
          'ring-2 ring-blue-400 ring-opacity-50':
            isResizing && selectedComponent?.id === component.id,
          'ring-2 ring-green-400 ring-opacity-50': selectedComponents.some(
            (c) => c.id === component.id,
          ),
          'ring-2 ring-purple-400 ring-opacity-30':
            component.groupId && selectedComponent?.groupId === component.groupId,
        }"
        class="select-none"
        @mousedown="startDragComponent($event, component)"
        @contextmenu="handleComponentRightClick($event, component)"
        @click="handleComponentClick($event, component)"
      >
        <component-shape
          :type="component.type"
          :width="component.width"
          :height="component.height"
          :selected="selectedComponent?.id === component.id"
          :direction="component.direction"
          @click="selectComponent(component)"
        />

        <!-- Resize handles for selected component (only if not in group) -->
        <div
          v-if="selectedComponent?.id === component.id && !component.groupId"
          class="absolute inset-0 pointer-events-none"
        >
          <!-- Corner handles -->
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-nw-resize"
            style="left: -4px; top: -4px"
            @mousedown="startResize($event, component, 'nw')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-ne-resize"
            style="right: -4px; top: -4px"
            @mousedown="startResize($event, component, 'ne')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-se-resize"
            style="right: -4px; bottom: -4px"
            @mousedown="startResize($event, component, 'se')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-sw-resize"
            style="left: -4px; bottom: -4px"
            @mousedown="startResize($event, component, 'sw')"
          ></div>

          <!-- Edge handles -->
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-n-resize"
            style="left: 50%; top: -4px; transform: translateX(-50%)"
            @mousedown="startResize($event, component, 'n')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-e-resize"
            style="right: -4px; top: 50%; transform: translateY(-50%)"
            @mousedown="startResize($event, component, 'e')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-s-resize"
            style="left: 50%; bottom: -4px; transform: translateX(-50%)"
            @mousedown="startResize($event, component, 's')"
          ></div>
          <div
            class="absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto cursor-w-resize"
            style="left: -4px; top: 50%; transform: translateY(-50%)"
            @mousedown="startResize($event, component, 'w')"
          ></div>

          <!-- Dimension display when resizing -->
          <div
            v-if="isResizing && selectedComponent?.id === component.id"
            class="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none"
            style="top: -30px; left: 50%; transform: translateX(-50%); white-space: nowrap"
          >
            {{ component.width }} × {{ component.height }}
          </div>
        </div>
      </div>

      <!-- Group Containers -->
      <group-container
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :components="components"
        :selected="selectedGroup?.id === group.id"
        @group-mousedown="handleGroupMouseDown"
        @group-click="handleGroupClick"
        @group-contextmenu="handleGroupRightClick"
      />
    </div>

    <!-- Selection Box -->
    <div
      v-if="selectionBox.visible"
      class="absolute border-2 border-blue-400 bg-blue-100 bg-opacity-20 pointer-events-none"
      :style="{
        left: Math.min(selectionBox.startX, selectionBox.endX) + 'px',
        top: Math.min(selectionBox.startY, selectionBox.endY) + 'px',
        width: Math.abs(selectionBox.endX - selectionBox.startX) + 'px',
        height: Math.abs(selectionBox.endY - selectionBox.startY) + 'px',
        zIndex: 1000,
      }"
    ></div>

    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :selectedComponent="contextMenu.component"
      :selectedGroup="selectedGroup"
      :canGroup="canGroupSelectedComponents"
      @delete="handleDeleteComponent"
      @duplicate="handleDuplicateComponent"
      @change-direction="handleChangeDirection"
      @create-group="createGroup"
      @ungroup="() => selectedGroup && ungroupComponents(selectedGroup)"
      @delete-group="() => selectedGroup && deleteGroup(selectedGroup)"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, readonly } from 'vue'
import ComponentShape from './ComponentShape.vue'
import ContextMenu from './ContextMenu.vue'
import GroupContainer from './GroupContainer.vue'

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

interface ComponentGroup {
  id: number
  components: number[] // Array of component IDs
  x: number
  y: number
  width: number
  height: number
}

const emit = defineEmits<{
  'scale-change': [scale: number]
}>()

const canvasContainer = ref<HTMLElement>()
const canvasContent = ref<HTMLElement>()

// Canvas state
const scale = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const isSpacePressed = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// Grid settings
const gridSize = 20
const minScale = 0.1
const maxScale = 3

// Components
const components = ref<DroppedComponent[]>([])
const groups = ref<ComponentGroup[]>([])
const selectedComponents = ref<DroppedComponent[]>([])
const selectedComponent = ref<DroppedComponent | null>(null)
const selectedGroup = ref<ComponentGroup | null>(null)
const isDraggingComponent = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// Multi-selection state
const isMultiSelecting = ref(false)
const selectionBox = ref({
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  visible: false,
})

// Resize state
const isResizing = ref(false)
const resizeHandle = ref<string>('')
const resizeStartPos = ref({ x: 0, y: 0 })
const resizeStartSize = ref({ width: 0, height: 0, x: 0, y: 0 })

// Context menu state
const contextMenu = ref({
  visible: false,
  position: { x: 0, y: 0 },
  component: null as DroppedComponent | null,
})

// Grid style computed property
const gridStyle = computed(() => {
  const size = gridSize * scale.value
  const offsetX = panX.value % size
  const offsetY = panY.value % size

  return {
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    opacity: 0.5,
  }
})

// Content transform style
const contentStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
}))

// Mouse wheel zoom
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (!rect) return

  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(minScale, Math.min(maxScale, scale.value * scaleFactor))

  if (newScale !== scale.value) {
    // Zoom towards mouse position
    const scaleChange = newScale / scale.value
    panX.value = mouseX - (mouseX - panX.value) * scaleChange
    panY.value = mouseY - (mouseY - panY.value) * scaleChange
    scale.value = newScale
    emit('scale-change', newScale)
  }
}

// Panning functionality
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0 && !isDraggingComponent.value && !isResizing.value) {
    const target = event.target as HTMLElement
    const isCanvasArea = target === canvasContainer.value || target === canvasContent.value

    if (isCanvasArea && (isSpacePressed.value || event.ctrlKey || event.metaKey)) {
      // Start panning when Space is pressed or Ctrl/Cmd is held
      isPanning.value = true
      lastMouseX.value = event.clientX
      lastMouseY.value = event.clientY
      // Change cursor to grabbing
      if (canvasContainer.value) {
        canvasContainer.value.style.cursor = 'grabbing'
      }
    } else if (isCanvasArea && !event.ctrlKey && !event.metaKey) {
      // Start selection box
      const rect = canvasContainer.value?.getBoundingClientRect()
      if (rect) {
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        // Clear existing selections if not holding Ctrl/Cmd
        selectedComponents.value = []
        selectedComponent.value = null
        selectedGroup.value = null

        // Start selection box
        isMultiSelecting.value = true
        selectionBox.value = {
          startX: mouseX,
          startY: mouseY,
          endX: mouseX,
          endY: mouseY,
          visible: true,
        }
      }
    }
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isPanning.value) {
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value

    panX.value += deltaX
    panY.value += deltaY

    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
  } else if (isMultiSelecting.value) {
    // Update selection box
    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      selectionBox.value.endX = event.clientX - rect.left
      selectionBox.value.endY = event.clientY - rect.top
    }
  }
}

const handleMouseUp = () => {
  if (isMultiSelecting.value) {
    // Finish selection
    finishSelection()
  }

  isPanning.value = false
  isDraggingComponent.value = false
  isResizing.value = false
  isMultiSelecting.value = false
  selectionBox.value.visible = false

  // Reset cursor based on Space key state
  if (canvasContainer.value) {
    if (isSpacePressed.value) {
      canvasContainer.value.style.cursor = 'grab'
    } else {
      canvasContainer.value.style.cursor = 'default'
    }
  }
}

// Handle canvas click to deselect components
const handleCanvasClick = (event: MouseEvent) => {
  // Only deselect if clicking directly on the canvas (not on components)
  const target = event.target as HTMLElement
  if (target === canvasContainer.value || target === canvasContent.value) {
    selectedComponent.value = null
  }
}

// Drag and drop functionality
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()

  const data = event.dataTransfer?.getData('application/json')
  if (!data) return

  try {
    const componentData = JSON.parse(data)
    const rect = canvasContainer.value?.getBoundingClientRect()

    if (rect) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (event.clientX - rect.left - panX.value) / scale.value
      const canvasY = (event.clientY - rect.top - panY.value) / scale.value

      // Snap to grid
      const snappedX = Math.round(canvasX / gridSize) * gridSize
      const snappedY = Math.round(canvasY / gridSize) * gridSize
      // Công thức tính : [w x h]

      // Width: 18 ô grid = 18 × 20px = 360px
      // Height: 22 ô grid = 22 × 20px = 440px

      // Default dimensions based on component type (snap to grid)
      const getDefaultDimensions = (type: string) => {
        console.log('[Type]: ', type)

        switch (type) {
          case 'device':
            return { width: 360, height: 440 } // [18x22]:[w x h]
          case 'water-level-sensor':
            return { width: 140, height: 340 } // [7x17]:[w x h]
          case 'waterpumb':
            return { width: 400, height: 340 } // [13x17]:[w x h]
          case 'pressure-gauge':
            return { width: 324, height: 324 } // [18x18]:[w x h]
          case 'water-pipe':
            return { width: 40, height: 80 } // [18x18]:[w x h]
          case 'gatewave':
            return { width: 340, height: 340 } // [17x17]:[w x h]
          case 'watertank':
            return { width: 500, height: 640 } // [25x17]:[w x h]

          default:
            return { width: 60, height: 60 }
        }
      }

      const defaultDimensions = getDefaultDimensions(componentData.type)

      const newComponent: DroppedComponent = {
        id: componentData.id,
        type: componentData.type,
        x: snappedX,
        y: snappedY,
        width: defaultDimensions.width,
        height: defaultDimensions.height,
      }

      components.value.push(newComponent)
      selectedComponent.value = newComponent
    }
  } catch (error) {
    console.error('Failed to parse drop data:', error)
  }
}

// Component selection and dragging
const selectComponent = (component: DroppedComponent) => {
  selectedComponent.value = component
}

// Handle component click for multi-selection
const handleComponentClick = (event: MouseEvent, component: DroppedComponent) => {
  event.stopPropagation()

  if (event.ctrlKey || event.metaKey) {
    // Multi-select mode
    const index = selectedComponents.value.findIndex((c) => c.id === component.id)
    if (index >= 0) {
      // Remove from selection
      selectedComponents.value.splice(index, 1)
    } else {
      // Add to selection
      selectedComponents.value.push(component)
    }
    selectedComponent.value =
      selectedComponents.value.length === 1 ? selectedComponents.value[0] : null
    selectedGroup.value = null
  } else {
    // Single select mode
    if (component.groupId) {
      // If component is in a group, select the whole group
      const group = groups.value.find((g) => g.id === component.groupId)
      if (group) {
        selectedGroup.value = group
        selectedComponents.value = getGroupComponents(component.groupId)
        selectedComponent.value = component // Keep track of the clicked component
      }
    } else {
      // Single component selection
      selectedComponents.value = [component]
      selectedComponent.value = component
      selectedGroup.value = null
    }
  }
}

// Finish selection box operation
const finishSelection = () => {
  if (!selectionBox.value.visible) return

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (!rect) return

  const startX = Math.min(selectionBox.value.startX, selectionBox.value.endX)
  const startY = Math.min(selectionBox.value.startY, selectionBox.value.endY)
  const endX = Math.max(selectionBox.value.startX, selectionBox.value.endX)
  const endY = Math.max(selectionBox.value.startY, selectionBox.value.endY)

  // Convert screen coordinates to canvas coordinates
  const canvasStartX = (startX - panX.value) / scale.value
  const canvasStartY = (startY - panY.value) / scale.value
  const canvasEndX = (endX - panX.value) / scale.value
  const canvasEndY = (endY - panY.value) / scale.value

  // Find components within selection box
  const selectedInBox = components.value.filter((component) => {
    const compCenterX = component.x + component.width / 2
    const compCenterY = component.y + component.height / 2

    return (
      compCenterX >= canvasStartX &&
      compCenterX <= canvasEndX &&
      compCenterY >= canvasStartY &&
      compCenterY <= canvasEndY
    )
  })

  selectedComponents.value = selectedInBox
  selectedComponent.value = selectedInBox.length === 1 ? selectedInBox[0] : null
}

// Group operations
const createGroup = () => {
  if (selectedComponents.value.length < 2) return

  const groupId = Date.now()

  // Calculate group bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  selectedComponents.value.forEach((component) => {
    minX = Math.min(minX, component.x)
    minY = Math.min(minY, component.y)
    maxX = Math.max(maxX, component.x + component.width)
    maxY = Math.max(maxY, component.y + component.height)
  })

  const newGroup: ComponentGroup = {
    id: groupId,
    components: selectedComponents.value.map((c) => c.id),
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }

  // Mark components as grouped
  selectedComponents.value.forEach((component) => {
    component.groupId = groupId
  })

  groups.value.push(newGroup)

  // Select the newly created group
  selectedGroup.value = newGroup
  selectedComponent.value = selectedComponents.value[0] // Keep first component as reference
  // Keep selectedComponents as is to show all components in the group are selected
}

const ungroupComponents = (group: ComponentGroup) => {
  // Remove group ID from components
  group.components.forEach((componentId) => {
    const component = components.value.find((c) => c.id === componentId)
    if (component) {
      component.groupId = null
    }
  })

  // Remove group
  const groupIndex = groups.value.findIndex((g) => g.id === group.id)
  if (groupIndex >= 0) {
    groups.value.splice(groupIndex, 1)
  }

  selectedGroup.value = null
}

const deleteGroup = (group: ComponentGroup) => {
  // Delete all components in the group
  group.components.forEach((componentId) => {
    const componentIndex = components.value.findIndex((c) => c.id === componentId)
    if (componentIndex >= 0) {
      components.value.splice(componentIndex, 1)
    }
  })

  // Remove group
  ungroupComponents(group)
}

// Get components that belong to a group
const getGroupComponents = (groupId: number): DroppedComponent[] => {
  return components.value.filter((c) => c.groupId === groupId)
}

// Update group bounds based on its components
const updateGroupBounds = (group: ComponentGroup) => {
  const groupComponents = components.value.filter((c) => group.components.includes(c.id))

  if (groupComponents.length === 0) return

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  groupComponents.forEach((component) => {
    minX = Math.min(minX, component.x)
    minY = Math.min(minY, component.y)
    maxX = Math.max(maxX, component.x + component.width)
    maxY = Math.max(maxY, component.y + component.height)
  })

  group.x = minX
  group.y = minY
  group.width = maxX - minX
  group.height = maxY - minY
}
const canGroupSelectedComponents = computed(() => {
  return selectedComponents.value.length >= 2 && selectedComponents.value.every((c) => !c.groupId)
})

const startDragComponent = (event: MouseEvent, component: DroppedComponent) => {
  event.stopPropagation()
  event.preventDefault()

  // If component belongs to a group, prevent individual dragging
  // and trigger group selection instead
  if (component.groupId) {
    const group = groups.value.find((g) => g.id === component.groupId)
    if (group) {
      selectedGroup.value = group
      selectedComponent.value = null
      selectedComponents.value = getGroupComponents(group.id)
      // Don't start dragging - let user click on group border to drag
      return
    }
  }

  selectedComponent.value = component
  isDraggingComponent.value = true

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (rect) {
    const canvasX = (event.clientX - rect.left - panX.value) / scale.value
    const canvasY = (event.clientY - rect.top - panY.value) / scale.value

    dragOffset.value = {
      x: canvasX - component.x,
      y: canvasY - component.y,
    }
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDraggingComponent.value || !selectedComponent.value) return

    const rectInner = canvasContainer.value?.getBoundingClientRect()
    if (rectInner) {
      const canvasX = (e.clientX - rectInner.left - panX.value) / scale.value
      const canvasY = (e.clientY - rectInner.top - panY.value) / scale.value

      // Move single component
      selectedComponent.value.x = Math.round((canvasX - dragOffset.value.x) / gridSize) * gridSize
      selectedComponent.value.y = Math.round((canvasY - dragOffset.value.y) / gridSize) * gridSize
    }
  }

  const handleDragEnd = () => {
    isDraggingComponent.value = false
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

// Component resizing
const startResize = (event: MouseEvent, component: DroppedComponent, handle: string) => {
  event.stopPropagation()
  event.preventDefault()

  selectedComponent.value = component
  isResizing.value = true
  resizeHandle.value = handle

  const rect = canvasContainer.value?.getBoundingClientRect()
  if (rect) {
    resizeStartPos.value = {
      x: (event.clientX - rect.left - panX.value) / scale.value,
      y: (event.clientY - rect.top - panY.value) / scale.value,
    }

    resizeStartSize.value = {
      width: component.width,
      height: component.height,
      x: component.x,
      y: component.y,
    }
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.value || !selectedComponent.value) return

    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      const currentX = (e.clientX - rect.left - panX.value) / scale.value
      const currentY = (e.clientY - rect.top - panY.value) / scale.value

      const deltaX = currentX - resizeStartPos.value.x
      const deltaY = currentY - resizeStartPos.value.y

      let newWidth = resizeStartSize.value.width
      let newHeight = resizeStartSize.value.height
      let newX = resizeStartSize.value.x
      let newY = resizeStartSize.value.y

      // Calculate new dimensions based on resize handle
      switch (resizeHandle.value) {
        case 'nw': // Northwest
          newWidth = resizeStartSize.value.width - deltaX
          newHeight = resizeStartSize.value.height - deltaY
          newX = resizeStartSize.value.x + deltaX
          newY = resizeStartSize.value.y + deltaY
          break
        case 'ne': // Northeast
          newWidth = resizeStartSize.value.width + deltaX
          newHeight = resizeStartSize.value.height - deltaY
          newY = resizeStartSize.value.y + deltaY
          break
        case 'se': // Southeast
          newWidth = resizeStartSize.value.width + deltaX
          newHeight = resizeStartSize.value.height + deltaY
          break
        case 'sw': // Southwest
          newWidth = resizeStartSize.value.width - deltaX
          newHeight = resizeStartSize.value.height + deltaY
          newX = resizeStartSize.value.x + deltaX
          break
        case 'n': // North
          newHeight = resizeStartSize.value.height - deltaY
          newY = resizeStartSize.value.y + deltaY
          break
        case 'e': // East
          newWidth = resizeStartSize.value.width + deltaX
          break
        case 's': // South
          newHeight = resizeStartSize.value.height + deltaY
          break
        case 'w': // West
          newWidth = resizeStartSize.value.width - deltaX
          newX = resizeStartSize.value.x + deltaX
          break
      }

      // Enforce minimum size
      const minSize = gridSize
      newWidth = Math.max(minSize, newWidth)
      newHeight = Math.max(minSize, newHeight)

      // Snap to grid
      newWidth = Math.round(newWidth / gridSize) * gridSize
      newHeight = Math.round(newHeight / gridSize) * gridSize
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize

      // Update component
      selectedComponent.value.width = newWidth
      selectedComponent.value.height = newHeight
      selectedComponent.value.x = newX
      selectedComponent.value.y = newY
    }
  }

  const handleResizeEnd = () => {
    isResizing.value = false
    resizeHandle.value = ''
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
}

// Click outside to deselect (simplified)
onMounted(() => {
  // Focus canvas to receive keyboard events
  canvasContainer.value?.focus()

  const handleClickOutside = (event: Event) => {
    if (!canvasContainer.value?.contains(event.target as Node)) {
      selectedComponent.value = null
      selectedComponents.value = []
      selectedGroup.value = null
    }
  }

  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  return () => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
  }
})

// Group event handlers
const handleGroupMouseDown = (event: MouseEvent, group: ComponentGroup) => {
  event.stopPropagation()
  event.preventDefault()

  selectedGroup.value = group
  selectedComponent.value = null
  selectedComponents.value = []

  // Start dragging the group
  const rect = canvasContainer.value?.getBoundingClientRect()
  if (rect) {
    const canvasX = (event.clientX - rect.left - panX.value) / scale.value
    const canvasY = (event.clientY - rect.top - panY.value) / scale.value

    dragOffset.value = {
      x: canvasX - group.x,
      y: canvasY - group.y,
    }

    const handleGroupDrag = (e: MouseEvent) => {
      if (!selectedGroup.value) return

      const rectInner = canvasContainer.value?.getBoundingClientRect()
      if (rectInner) {
        const canvasX = (e.clientX - rectInner.left - panX.value) / scale.value
        const canvasY = (e.clientY - rectInner.top - panY.value) / scale.value

        const deltaX = canvasX - dragOffset.value.x - selectedGroup.value.x
        const deltaY = canvasY - dragOffset.value.y - selectedGroup.value.y

        // Calculate new group position (snapped to grid)
        const newGroupX = Math.round((canvasX - dragOffset.value.x) / gridSize) * gridSize
        const newGroupY = Math.round((canvasY - dragOffset.value.y) / gridSize) * gridSize

        // Calculate actual delta from current position
        const actualDeltaX = newGroupX - selectedGroup.value.x
        const actualDeltaY = newGroupY - selectedGroup.value.y

        // Move group
        selectedGroup.value.x = newGroupX
        selectedGroup.value.y = newGroupY

        // Move all components in the group by the same delta
        selectedGroup.value.components.forEach((componentId) => {
          const component = components.value.find((c) => c.id === componentId)
          if (component) {
            component.x += actualDeltaX
            component.y += actualDeltaY
          }
        })
      }
    }

    const handleGroupDragEnd = () => {
      document.removeEventListener('mousemove', handleGroupDrag)
      document.removeEventListener('mouseup', handleGroupDragEnd)
    }

    document.addEventListener('mousemove', handleGroupDrag)
    document.addEventListener('mouseup', handleGroupDragEnd)
  }
}

const handleGroupClick = (event: MouseEvent, group: ComponentGroup) => {
  event.stopPropagation()
  selectedGroup.value = group
  selectedComponent.value = null
  selectedComponents.value = []
}

const handleGroupRightClick = (event: MouseEvent, group: ComponentGroup) => {
  event.preventDefault()
  event.stopPropagation()

  selectedGroup.value = group

  // Show context menu for group
  contextMenu.value.position = { x: event.clientX, y: event.clientY }
  contextMenu.value.component = null
  contextMenu.value.visible = true
}
const handleComponentRightClick = (event: MouseEvent, component: DroppedComponent) => {
  event.preventDefault()
  event.stopPropagation()

  // Select the component if not already selected
  selectedComponent.value = component

  // Set context menu position and component
  contextMenu.value.position = { x: event.clientX, y: event.clientY }
  contextMenu.value.component = component
  contextMenu.value.visible = true
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.component = null
}

const handleDeleteComponent = () => {
  if (contextMenu.value.component) {
    const index = components.value.findIndex((comp) => comp.id === contextMenu.value.component!.id)
    if (index !== -1) {
      components.value.splice(index, 1)
      // Clear selection if the deleted component was selected
      if (selectedComponent.value?.id === contextMenu.value.component.id) {
        selectedComponent.value = null
      }
    }
  }
}

const handleDuplicateComponent = () => {
  if (contextMenu.value.component) {
    const originalComponent = contextMenu.value.component

    // Generate a new unique ID
    const newId = Date.now() + Math.random()

    // Create a duplicate with offset position
    const duplicateComponent: DroppedComponent = {
      id: newId,
      type: originalComponent.type,
      x: originalComponent.x + 20, // Offset by 20px
      y: originalComponent.y + 20, // Offset by 20px
      width: originalComponent.width,
      height: originalComponent.height,
      direction: originalComponent.direction, // Copy direction if exists
    }

    // Snap the offset position to grid
    duplicateComponent.x = Math.round(duplicateComponent.x / gridSize) * gridSize
    duplicateComponent.y = Math.round(duplicateComponent.y / gridSize) * gridSize

    // Add to components array
    components.value.push(duplicateComponent)

    // Select the duplicate
    selectedComponent.value = duplicateComponent
  }
}

const handleChangeDirection = (direction: 'left' | 'right') => {
  if (contextMenu.value.component) {
    const index = components.value.findIndex((comp) => comp.id === contextMenu.value.component!.id)
    if (index !== -1) {
      components.value[index].direction = direction

      // Update selectedComponent if it's the same component
      if (selectedComponent.value?.id === contextMenu.value.component.id) {
        selectedComponent.value.direction = direction
      }
    }
  }
}

// Exposed methods for parent component
const zoomIn = () => {
  const newScale = Math.min(maxScale, scale.value * 1.1)
  if (newScale !== scale.value) {
    scale.value = newScale
    emit('scale-change', newScale)
  }
}

const zoomOut = () => {
  const newScale = Math.max(minScale, scale.value * 0.9)
  if (newScale !== scale.value) {
    scale.value = newScale
    emit('scale-change', newScale)
  }
}

const resetZoom = () => {
  scale.value = 1
  panX.value = 0
  panY.value = 0
  emit('scale-change', 1)
}

const clearCanvas = () => {
  components.value = []
  groups.value = []
  selectedComponent.value = null
  selectedComponents.value = []
  selectedGroup.value = null
}

// Select all components
const selectAllComponents = () => {
  // Only select components that are not in groups
  const unGroupedComponents = components.value.filter((component) => !component.groupId)

  if (unGroupedComponents.length > 0) {
    selectedComponents.value = [...unGroupedComponents]
    selectedComponent.value = null
    selectedGroup.value = null

    // Auto-group if there are selected components
    if (canGroupSelectedComponents.value) {
      createGroup()
    }
  }
}

// Keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.preventDefault()
    isSpacePressed.value = true
    // Change cursor to grab
    if (canvasContainer.value) {
      canvasContainer.value.style.cursor = 'grab'
    }
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    event.preventDefault()
    selectAllComponents()
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
    event.preventDefault()
    if (canGroupSelectedComponents.value) {
      createGroup()
    }
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
    event.preventDefault()
    if (selectedGroup.value) {
      ungroupComponents(selectedGroup.value)
    }
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    if (selectedGroup.value) {
      deleteGroup(selectedGroup.value)
    } else if (selectedComponents.value.length > 0) {
      selectedComponents.value.forEach((component) => {
        const index = components.value.findIndex((c) => c.id === component.id)
        if (index >= 0) {
          components.value.splice(index, 1)
        }
      })
      selectedComponents.value = []
      selectedComponent.value = null
    }
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    isSpacePressed.value = false
    // Reset cursor - if currently panning, set to grabbing, otherwise default
    if (canvasContainer.value) {
      if (isPanning.value) {
        canvasContainer.value.style.cursor = 'grabbing'
      } else {
        canvasContainer.value.style.cursor = 'default'
      }
    }
  }
}

defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  clearCanvas,
  createGroup,
  selectAllComponents,
  ungroupComponents: () => selectedGroup.value && ungroupComponents(selectedGroup.value),
  canGroupSelectedComponents,
  selectedComponents: readonly(selectedComponents),
  selectedGroup: readonly(selectedGroup),
})
</script>

<style scoped>
.canvas-container {
  cursor: grab;
}

.canvas-container:active {
  cursor: grabbing;
}
</style>
