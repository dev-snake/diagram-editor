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
      class="absolute origin-top-left"
      style="will-change: transform; transform: translateZ(0)"
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
      :selectedGroupIds="selectedGroupIds"
      :canGroup="canGroupSelectedComponents"
      :canCreateSuperGroup="canCreateSuperGroup"
      @delete="handleDeleteComponent"
      @duplicate="handleDuplicateComponent"
      @duplicate-group="() => selectedGroup && duplicateGroup(selectedGroup)"
      @create-super-group="createSuperGroup"
      @change-direction="handleChangeDirection"
      @create-group="createGroup"
      @ungroup="() => selectedGroup && ungroupComponents(selectedGroup)"
      @delete-group="() => selectedGroup && deleteGroup(selectedGroup)"
      @close="closeContextMenu"
    />

    <!-- Component Info Modal -->
    <ComponentInfoModal
      :isVisible="componentModal.visible"
      :componentData="componentModal.componentData"
      :deviceData="componentModal.deviceData"
      @close="closeComponentModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, readonly, provide, reactive } from 'vue'
import ComponentShape from './ComponentShape.vue'
import ContextMenu from './ContextMenu.vue'
import GroupContainer from './GroupContainer.vue'
import ComponentInfoModal from './ComponentInfoModal.vue'
import { SaveLoadManager, type DiagramConfiguration } from '../utils/saveLoad'

interface DroppedComponent<T = any> {
  id: number
  type: string
  x: number
  y: number
  width: number
  data?: T | null
  height: number
  direction?: 'left' | 'right'
  groupId?: number | null
}

interface ComponentGroup {
  id: number
  components: number[] // Array of component IDs
  groups?: number[] // Array of nested group IDs (for group nesting)
  x: number
  y: number
  width: number
  height: number
  parentGroupId?: number | null // ID of parent group if this is nested
}

interface ModalComponentData {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: string
  groupId?: string
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
const selectedGroupIds = ref<number[]>([]) // For multiple group selection
const isDraggingComponent = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// Create reactive state object for provide
const canvasState = reactive({
  components: components.value,
  groups: groups.value,
  selectedComponents: selectedComponents.value,
  selectedComponent: selectedComponent.value,
  selectedGroup: selectedGroup.value,
  selectedGroupIds: selectedGroupIds.value,
  isDraggingComponent: isDraggingComponent.value,
  dragOffset: dragOffset.value,
})

// Provide the canvas state to child components
provide('canvasState', canvasState)

// Watch for changes and update the provided state
watch(
  components,
  (newVal) => {
    canvasState.components = newVal
  },
  { deep: true },
)

watch(
  groups,
  (newVal) => {
    canvasState.groups = newVal
  },
  { deep: true },
)

watch(
  selectedComponents,
  (newVal) => {
    canvasState.selectedComponents = newVal
  },
  { deep: true },
)

watch(
  selectedComponent,
  (newVal) => {
    canvasState.selectedComponent = newVal
  },
  { deep: true },
)

watch(
  selectedGroup,
  (newVal) => {
    canvasState.selectedGroup = newVal
  },
  { deep: true },
)

watch(
  selectedGroupIds,
  (newVal) => {
    canvasState.selectedGroupIds = newVal
  },
  { deep: true },
)

watch(isDraggingComponent, (newVal) => {
  canvasState.isDraggingComponent = newVal
})

watch(
  dragOffset,
  (newVal) => {
    canvasState.dragOffset = newVal
  },
  { deep: true },
)

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

// Component info modal state
const componentModal = ref({
  visible: false,
  componentData: null as ModalComponentData | null,
  deviceData: null as any | null,
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

    if (isCanvasArea && isSpacePressed.value) {
      // Start panning when Space is pressed
      event.preventDefault()
      isPanning.value = true
      lastMouseX.value = event.clientX
      lastMouseY.value = event.clientY
      // Change cursor to grabbing
      if (canvasContainer.value) {
        canvasContainer.value.style.cursor = 'grabbing'
      }
    } else if (isCanvasArea && (event.ctrlKey || event.metaKey)) {
      // Also allow panning with Ctrl/Cmd for alternative control
      event.preventDefault()
      isPanning.value = true
      lastMouseX.value = event.clientX
      lastMouseY.value = event.clientY
      if (canvasContainer.value) {
        canvasContainer.value.style.cursor = 'grabbing'
      }
    } else if (isCanvasArea && !event.ctrlKey && !event.metaKey && !isSpacePressed.value) {
      // Start selection box only if not holding any modifier keys
      const rect = canvasContainer.value?.getBoundingClientRect()
      if (rect) {
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        // Clear existing selections if not holding Ctrl/Cmd
        selectedComponents.value = []
        selectedComponent.value = null
        selectedGroup.value = null
        selectedGroupIds.value = []

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
      event.preventDefault()
    }
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isPanning.value) {
    event.preventDefault()
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value

    // Only update if there's actually movement to avoid unnecessary re-renders
    if (deltaX !== 0 || deltaY !== 0) {
      panX.value += deltaX
      panY.value += deltaY

      lastMouseX.value = event.clientX
      lastMouseY.value = event.clientY
    }
  } else if (isMultiSelecting.value) {
    event.preventDefault()
    // Update selection box
    const rect = canvasContainer.value?.getBoundingClientRect()
    if (rect) {
      selectionBox.value.endX = event.clientX - rect.left
      selectionBox.value.endY = event.clientY - rect.top
    }
  }
}

const handleMouseUp = (event: MouseEvent) => {
  if (isMultiSelecting.value) {
    // Finish selection
    finishSelection()
  }

  const wasPanning = isPanning.value

  isPanning.value = false
  isDraggingComponent.value = false
  isResizing.value = false
  isMultiSelecting.value = false
  selectionBox.value.visible = false

  // Reset cursor based on current state
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
        // console.log('[Type]: ', type)

        switch (type) {
          case 'device':
            return { width: 360, height: 440 } // [18x22]:[w x h]
          case 'water-level-sensor':
            return { width: 260, height: 380 } // [13x19]:[w x h]
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
        data: null,
      }

      console.log('🚀 Adding new component:', newComponent)
      components.value.push(newComponent)
      selectedComponent.value = newComponent
      console.log('✅ Component added successfully. Total components:', components.value.length)
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

  // Check for double click to open modal (but not for pipe, grid-square, water-pipe)
  const excludedTypes = ['pipe', 'grid-square', 'water-pipe']
  if (event.detail === 2 && !excludedTypes.includes(component.type)) {
    openComponentModal(component)
    return
  }

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
    groups: [], // Initialize empty array for nested groups
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    parentGroupId: null, // Initialize as null
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
  // Check if it's a super group (contains other groups)
  if (group.groups && group.groups.length > 0) {
    // Handle super group ungrouping
    ungroupSuperGroup(group)
  } else {
    // Handle regular group ungrouping
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
    selectedGroupIds.value = []
  }
}

const deleteGroup = (group: ComponentGroup) => {
  // Check if it's a super group
  if (group.groups && group.groups.length > 0) {
    // Delete all nested groups first
    group.groups.forEach((nestedGroupId) => {
      const nestedGroup = groups.value.find((g) => g.id === nestedGroupId)
      if (nestedGroup) {
        deleteGroup(nestedGroup) // Recursively delete nested groups
      }
    })
  }

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

const duplicateGroup = (group: ComponentGroup) => {
  // Check if it's a super group (contains nested groups)
  if (group.groups && group.groups.length > 0) {
    // Handle super group duplication
    duplicateSuperGroup(group)
  } else {
    // Handle regular group duplication
    duplicateRegularGroup(group)
  }
}

const duplicateRegularGroup = (group: ComponentGroup) => {
  // Generate new IDs
  const newGroupId = Date.now()
  const componentIdMap = new Map<number, number>()

  // Create mapping of old IDs to new IDs
  group.components.forEach((oldId) => {
    const newId = Date.now() + oldId
    componentIdMap.set(oldId, newId)
  })

  // Calculate offset position (20px to the right and down)
  const offsetX = 20
  const offsetY = 20

  // Duplicate all components in the group
  const duplicatedComponents: DroppedComponent[] = []
  group.components.forEach((componentId) => {
    const originalComponent = components.value.find((c) => c.id === componentId)
    if (originalComponent) {
      const newId = componentIdMap.get(componentId)!
      const duplicatedComponent: DroppedComponent = {
        id: newId,
        type: originalComponent.type,
        x: originalComponent.x + offsetX,
        y: originalComponent.y + offsetY,
        width: originalComponent.width,
        height: originalComponent.height,
        direction: originalComponent.direction,
        groupId: newGroupId,
      }

      // Snap to grid
      duplicatedComponent.x = Math.round(duplicatedComponent.x / gridSize) * gridSize
      duplicatedComponent.y = Math.round(duplicatedComponent.y / gridSize) * gridSize

      duplicatedComponents.push(duplicatedComponent)
      components.value.push(duplicatedComponent)
    }
  })

  // Create new group
  const newGroup: ComponentGroup = {
    id: newGroupId,
    components: Array.from(componentIdMap.values()),
    groups: [],
    x: group.x + offsetX,
    y: group.y + offsetY,
    width: group.width,
    height: group.height,
    parentGroupId: group.parentGroupId,
  }

  // Snap group position to grid
  newGroup.x = Math.round(newGroup.x / gridSize) * gridSize
  newGroup.y = Math.round(newGroup.y / gridSize) * gridSize

  groups.value.push(newGroup)

  // Select the duplicated group
  selectedGroup.value = newGroup
  selectedComponents.value = duplicatedComponents
  selectedComponent.value = duplicatedComponents[0] || null
}

const duplicateSuperGroup = (superGroup: ComponentGroup) => {
  // Calculate offset
  const offsetX = 20
  const offsetY = 20

  // Map to store old group ID -> new group ID mapping
  const groupIdMap = new Map<number, number>()
  const newSuperGroupId = Date.now()
  groupIdMap.set(superGroup.id, newSuperGroupId)

  // Create mapping for all nested groups first
  if (superGroup.groups) {
    superGroup.groups.forEach((nestedGroupId) => {
      const newNestedGroupId = Date.now() + Math.random() + nestedGroupId
      groupIdMap.set(nestedGroupId, newNestedGroupId)
    })
  }

  // Duplicate all nested groups
  const duplicatedNestedGroupIds: number[] = []
  if (superGroup.groups) {
    superGroup.groups.forEach((nestedGroupId) => {
      const originalNestedGroup = groups.value.find((g) => g.id === nestedGroupId)
      if (originalNestedGroup) {
        const newNestedGroupId = groupIdMap.get(nestedGroupId)!

        // Duplicate the nested group's components
        const componentIdMap = new Map<number, number>()
        originalNestedGroup.components.forEach((oldId) => {
          const newId = Date.now() + Math.random() + oldId
          componentIdMap.set(oldId, newId)
        })

        // Duplicate components
        originalNestedGroup.components.forEach((componentId) => {
          const originalComponent = components.value.find((c) => c.id === componentId)
          if (originalComponent) {
            const newComponentId = componentIdMap.get(componentId)!
            const duplicatedComponent: DroppedComponent = {
              id: newComponentId,
              type: originalComponent.type,
              x: originalComponent.x + offsetX,
              y: originalComponent.y + offsetY,
              width: originalComponent.width,
              height: originalComponent.height,
              direction: originalComponent.direction,
              groupId: newNestedGroupId,
            }

            // Snap to grid
            duplicatedComponent.x = Math.round(duplicatedComponent.x / gridSize) * gridSize
            duplicatedComponent.y = Math.round(duplicatedComponent.y / gridSize) * gridSize

            components.value.push(duplicatedComponent)
          }
        })

        // Create duplicated nested group
        const duplicatedNestedGroup: ComponentGroup = {
          id: newNestedGroupId,
          components: Array.from(componentIdMap.values()),
          groups: [],
          x: originalNestedGroup.x + offsetX,
          y: originalNestedGroup.y + offsetY,
          width: originalNestedGroup.width,
          height: originalNestedGroup.height,
          parentGroupId: newSuperGroupId,
        }

        // Snap group position to grid
        duplicatedNestedGroup.x = Math.round(duplicatedNestedGroup.x / gridSize) * gridSize
        duplicatedNestedGroup.y = Math.round(duplicatedNestedGroup.y / gridSize) * gridSize

        groups.value.push(duplicatedNestedGroup)
        duplicatedNestedGroupIds.push(newNestedGroupId)
      }
    })
  }

  // Create new super group
  const newSuperGroup: ComponentGroup = {
    id: newSuperGroupId,
    components: [], // Super group doesn't directly contain components
    groups: duplicatedNestedGroupIds,
    x: superGroup.x + offsetX,
    y: superGroup.y + offsetY,
    width: superGroup.width,
    height: superGroup.height,
    parentGroupId: null,
  }

  // Snap super group position to grid
  newSuperGroup.x = Math.round(newSuperGroup.x / gridSize) * gridSize
  newSuperGroup.y = Math.round(newSuperGroup.y / gridSize) * gridSize

  groups.value.push(newSuperGroup)

  // Select the duplicated super group
  selectedGroup.value = newSuperGroup
  selectedGroupIds.value = [newSuperGroupId]
  selectedComponents.value = []
  selectedComponent.value = null
}

const createSuperGroup = () => {
  // Get all selected groups (when multiple groups are selected)
  const selectedGroups = groups.value.filter((group) => selectedGroupIds.value.includes(group.id))

  if (selectedGroups.length < 2) return

  const superGroupId = Date.now()

  // Calculate bounds that encompass all selected groups
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  selectedGroups.forEach((group) => {
    minX = Math.min(minX, group.x)
    minY = Math.min(minY, group.y)
    maxX = Math.max(maxX, group.x + group.width)
    maxY = Math.max(maxY, group.y + group.height)
  })

  // Create super group
  const superGroup: ComponentGroup = {
    id: superGroupId,
    components: [], // Super group doesn't directly contain components
    groups: selectedGroups.map((g) => g.id), // Contains other groups
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    parentGroupId: null,
  }

  // Mark selected groups as nested in super group
  selectedGroups.forEach((group) => {
    group.parentGroupId = superGroupId
  })

  groups.value.push(superGroup)

  // Select the newly created super group
  selectedGroup.value = superGroup
  selectedGroupIds.value = [superGroupId]
  selectedComponents.value = []
  selectedComponent.value = null
}

const ungroupSuperGroup = (superGroup: ComponentGroup) => {
  if (!superGroup.groups || superGroup.groups.length === 0) return

  // Remove parent reference from nested groups
  superGroup.groups.forEach((groupId) => {
    const nestedGroup = groups.value.find((g) => g.id === groupId)
    if (nestedGroup) {
      nestedGroup.parentGroupId = null
    }
  })

  // Remove super group
  const superGroupIndex = groups.value.findIndex((g) => g.id === superGroup.id)
  if (superGroupIndex >= 0) {
    groups.value.splice(superGroupIndex, 1)
  }

  selectedGroup.value = null
}

// Get components that belong to a group
const getGroupComponents = (groupId: number): DroppedComponent[] => {
  return components.value.filter((c) => c.groupId === groupId)
}

// Helper function to move a group and all its nested content recursively
const moveGroupRecursive = (group: ComponentGroup, deltaX: number, deltaY: number) => {
  // Move the group itself
  group.x += deltaX
  group.y += deltaY

  // Move all components in the group
  group.components.forEach((componentId) => {
    const component = components.value.find((c) => c.id === componentId)
    if (component) {
      component.x += deltaX
      component.y += deltaY
    }
  })

  // Recursively move all nested groups
  if (group.groups && group.groups.length > 0) {
    group.groups.forEach((nestedGroupId) => {
      const nestedGroup = groups.value.find((g) => g.id === nestedGroupId)
      if (nestedGroup) {
        moveGroupRecursive(nestedGroup, deltaX, deltaY)
      }
    })
  }
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

const canCreateSuperGroup = computed(() => {
  return selectedGroupIds.value.length >= 2
})

const startDragComponent = (event: MouseEvent, component: DroppedComponent) => {
  event.stopPropagation()
  event.preventDefault()

  // If component belongs to a group, start dragging the group instead
  if (component.groupId) {
    const group = groups.value.find((g) => g.id === component.groupId)
    if (group) {
      selectedGroup.value = group
      selectedComponent.value = null
      selectedComponents.value = getGroupComponents(group.id)

      // Start dragging the group using the same logic as handleGroupMouseDown
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

            // Calculate new group position (snapped to grid)
            const newGroupX = Math.round((canvasX - dragOffset.value.x) / gridSize) * gridSize
            const newGroupY = Math.round((canvasY - dragOffset.value.y) / gridSize) * gridSize

            // Calculate actual delta from current position
            const actualDeltaX = newGroupX - selectedGroup.value.x
            const actualDeltaY = newGroupY - selectedGroup.value.y

            // Use the helper function to move group and all nested content
            moveGroupRecursive(selectedGroup.value, actualDeltaX, actualDeltaY)
          }
        }

        const handleGroupDragEnd = () => {
          document.removeEventListener('mousemove', handleGroupDrag)
          document.removeEventListener('mouseup', handleGroupDragEnd)
        }

        document.addEventListener('mousemove', handleGroupDrag)
        document.addEventListener('mouseup', handleGroupDragEnd)
      }
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
      selectedGroupIds.value = []
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

        // Use the helper function to move group and all nested content
        moveGroupRecursive(selectedGroup.value, actualDeltaX, actualDeltaY)
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

  if (event.ctrlKey || event.metaKey) {
    // Multi-select mode for groups
    const index = selectedGroupIds.value.findIndex((id) => id === group.id)
    if (index >= 0) {
      // Remove from selection
      selectedGroupIds.value.splice(index, 1)
    } else {
      // Add to selection
      selectedGroupIds.value.push(group.id)
    }
    selectedGroup.value =
      selectedGroupIds.value.length === 1
        ? groups.value.find((g) => g.id === selectedGroupIds.value[0]) || null
        : null
  } else {
    // Single select mode
    selectedGroup.value = group
    selectedGroupIds.value = [group.id]
  }

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

// Component info modal functions
const openComponentModal = (component: DroppedComponent) => {
  // Convert component ID from number to string for modal
  const componentData = {
    ...component,
    id: component.id.toString(),
    groupId: component.groupId?.toString() || undefined,
  }

  componentModal.value.componentData = componentData

  // Generate mock device data if component is a device
  if (component.type === 'device') {
    componentModal.value.deviceData = {
      temperature: Math.round((Math.random() * 10 + 20) * 10) / 10, // 20-30°C
      humidity: Math.round((Math.random() * 40 + 40) * 10) / 10, // 40-80%
      pressure: Math.round((Math.random() * 50 + 1000) * 100) / 100, // 1000-1050 hPa
      voltage: Math.round((Math.random() * 2 + 11) * 10) / 10, // 11-13V
      current: Math.round((Math.random() * 2 + 1) * 10) / 10, // 1-3A
      power: Math.round((Math.random() * 20 + 20) * 10) / 10, // 20-40W
      status: Math.random() > 0.8 ? 'OFFLINE' : ('ONLINE' as 'ONLINE' | 'OFFLINE' | 'ERROR'),
    }
  } else {
    componentModal.value.deviceData = null
  }

  componentModal.value.visible = true
}

const closeComponentModal = () => {
  componentModal.value.visible = false
  componentModal.value.componentData = null
  componentModal.value.deviceData = null
}

const handleDeleteComponent = () => {
  if (contextMenu.value.component) {
    console.log('🗑️ Deleting component:', contextMenu.value.component)
    const index = components.value.findIndex((comp) => comp.id === contextMenu.value.component!.id)
    if (index !== -1) {
      const deletedComponent = components.value[index]
      components.value.splice(index, 1)
      console.log('✅ Component deleted successfully:', deletedComponent)
      console.log('📊 Remaining components count:', components.value.length)

      // Clear selection if the deleted component was selected
      if (selectedComponent.value?.id === contextMenu.value.component.id) {
        selectedComponent.value = null
        console.log('🔄 Cleared selection due to component deletion')
      }
    } else {
      console.log('❌ Component not found for deletion')
    }
  } else {
    console.log('⚠️ No component selected for deletion')
  }
}

const handleDuplicateComponent = () => {
  if (contextMenu.value.component) {
    const originalComponent = contextMenu.value.component
    console.log('📋 Duplicating component:', originalComponent)

    // Generate a new unique ID
    const newId = Date.now()

    // Create a duplicate with offset position
    const duplicateComponent: DroppedComponent = {
      id: newId,
      type: originalComponent.type,
      x: originalComponent.x + 20, // Offset by 20px
      y: originalComponent.y + 20, // Offset by 20px
      width: originalComponent.width,
      height: originalComponent.height,
      direction: originalComponent.direction, // Copy direction if exists
      data: originalComponent.data,
    }

    // Snap the offset position to grid
    duplicateComponent.x = Math.round(duplicateComponent.x / gridSize) * gridSize
    duplicateComponent.y = Math.round(duplicateComponent.y / gridSize) * gridSize

    console.log('✨ Created duplicate component:', duplicateComponent)

    // Add to components array
    components.value.push(duplicateComponent)
    console.log('✅ Duplicate added successfully. Total components:', components.value.length)

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
  selectedGroupIds.value = []
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
    if (!isSpacePressed.value) {
      isSpacePressed.value = true
      // Change cursor to grab only if not already panning
      if (canvasContainer.value && !isPanning.value) {
        canvasContainer.value.style.cursor = 'grab'
      }
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
  } else if (event.key === 'Delete') {
    // || event.key === 'Backspace'
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
    event.preventDefault()
    isSpacePressed.value = false
    // Reset cursor properly based on current state
    if (canvasContainer.value) {
      if (isPanning.value) {
        canvasContainer.value.style.cursor = 'grabbing'
      } else {
        canvasContainer.value.style.cursor = 'default'
      }
    }
  }
}

// Save/Load functionality
const saveConfiguration = (name: string, description?: string): boolean => {
  try {
    const canvasState = {
      scale: scale.value,
      panX: panX.value,
      panY: panY.value,
    }

    return SaveLoadManager.saveConfiguration(
      name,
      components.value,
      groups.value,
      canvasState,
      description,
    )
  } catch (error) {
    console.error('Failed to save configuration:', error)
    return false
  }
}

const loadConfiguration = (config: DiagramConfiguration): boolean => {
  try {
    // Clear current state
    clearCanvas()

    // Restore canvas state
    scale.value = config.canvas.scale
    panX.value = config.canvas.panX
    panY.value = config.canvas.panY

    // Restore components
    components.value = [...config.components]

    // Restore groups
    groups.value = [...config.groups]

    // Emit scale change
    emit('scale-change', scale.value)

    // Clear selections
    selectedComponent.value = null
    selectedComponents.value = []
    selectedGroup.value = null

    return true
  } catch (error) {
    console.error('Failed to load configuration:', error)
    return false
  }
}

const exportConfiguration = (name: string, description?: string): void => {
  const canvasState = {
    scale: scale.value,
    panX: panX.value,
    panY: panY.value,
  }

  const config: DiagramConfiguration = {
    name,
    description,
    timestamp: Date.now(),
    version: '1.0.0',
    canvas: canvasState,
    components: [...components.value],
    groups: [...groups.value],
  }

  SaveLoadManager.exportConfiguration(config)
}

const importConfiguration = async (file: File): Promise<boolean> => {
  try {
    const config = await SaveLoadManager.importConfiguration(file)
    if (config) {
      return loadConfiguration(config)
    }
    return false
  } catch (error) {
    console.error('Failed to import configuration:', error)
    return false
  }
}

defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  clearCanvas,
  createGroup,
  createSuperGroup,
  duplicateGroup: () => selectedGroup.value && duplicateGroup(selectedGroup.value),
  selectAllComponents,
  ungroupComponents: () => selectedGroup.value && ungroupComponents(selectedGroup.value),
  canGroupSelectedComponents,
  canCreateSuperGroup,
  selectedComponents: readonly(selectedComponents),
  selectedGroup: readonly(selectedGroup),
  selectedGroupIds: readonly(selectedGroupIds),
  saveConfiguration,
  loadConfiguration,
  exportConfiguration,
  importConfiguration,
  openComponentModal,
  closeComponentModal,
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
