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
  | 'pressure-meter'
// Base interface chứa các properties chung
export interface BaseComponent {
  component_id: number
  type: string
  x: number
  y: number
  width: number
  height: number
}

// Interface cho component data cơ bản
export interface ComponentData extends BaseComponent {
  direction?: string
  groupId?: string
}

// Interface cho dropped component với type safety tốt hơn
export interface DroppedComponent<T = any> extends BaseComponent {
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

// Auth related types
export interface UserData {
  id: string
  avatar: string
  email: string
  role: string
  permissions: string
  roleId: string
  isRoleDevice: boolean
  username: string
  superUser: boolean
  manageSupers: boolean
  createdAt: string
  updatedAt: string
}

export interface UserAbilityRules {
  id: string
  name: string
  permissions: string
  description: string
  isDefault: boolean
  isRoleDevice: boolean
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  userData: UserData
  userAbilityRules: UserAbilityRules
}
