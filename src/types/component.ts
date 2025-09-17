export type ComponentKey =
  | 'watertank'
  | 'waterpumb'
  | 'gatewave'
  | 'pressure-gauge'
  | 'water-level-sensor'
  | 'device'
  | 'water-pipe'
  | 'pipe'
  | 'grid-square'
export interface ComponentData {
  id: number
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: string
  groupId?: string
}

export interface DroppedComponent<T = any> {
  id: number
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: 'left' | 'right'
  groupId?: number | null
  data?: T | null
}
export interface ComponentGroup {
  id: number
  components: number[] // Array of component IDs
  groups?: number[] // Array of nested group IDs (for group nesting)
  x: number
  y: number
  width: number
  height: number
  parentGroupId?: number | null // ID of parent group if this is nested
}
