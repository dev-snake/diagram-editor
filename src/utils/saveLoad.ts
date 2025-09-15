// saveLoad.ts - Utility for saving and loading diagram configurations

export interface SavedComponent {
  id: number
  type: string
  x: number
  y: number
  width: number
  height: number
  direction?: 'left' | 'right'
  groupId?: number | null
}

export interface SavedGroup {
  id: number
  components: number[]
  groups?: number[] // Array of nested group IDs
  x: number
  y: number
  width: number
  height: number
  parentGroupId?: number | null // ID of parent group if nested
}

export interface DiagramConfiguration {
  name: string
  description?: string
  timestamp: number
  version: string
  canvas: {
    scale: number
    panX: number
    panY: number
  }
  components: SavedComponent[]
  groups: SavedGroup[]
}

export class SaveLoadManager {
  private static readonly STORAGE_KEY = 'scada-diagram-configs'
  private static readonly VERSION = '1.0.0'

  /**
   * Save current diagram configuration to localStorage
   */
  static saveConfiguration(
    name: string,
    components: SavedComponent[],
    groups: SavedGroup[],
    canvasState: { scale: number; panX: number; panY: number },
    description?: string,
  ): boolean {
    try {
      const config: DiagramConfiguration = {
        name,
        description,
        timestamp: Date.now(),
        version: this.VERSION,
        canvas: canvasState,
        components: [...components], // Deep clone to avoid reference issues
        groups: [...groups],
      }

      const savedConfigs = this.getAllConfigurations()

      // Remove existing config with same name if exists
      const filteredConfigs = savedConfigs.filter((c) => c.name !== name)

      // Add new config
      filteredConfigs.push(config)

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredConfigs))

      return true
    } catch (error) {
      console.error('Failed to save configuration:', error)
      return false
    }
  }

  /**
   * Load a specific configuration by name
   */
  static loadConfiguration(name: string): DiagramConfiguration | null {
    try {
      const savedConfigs = this.getAllConfigurations()
      return savedConfigs.find((config) => config.name === name) || null
    } catch (error) {
      console.error('Failed to load configuration:', error)
      return null
    }
  }

  /**
   * Get all saved configurations
   */
  static getAllConfigurations(): DiagramConfiguration[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const configs = JSON.parse(stored) as DiagramConfiguration[]

      // Sort by timestamp (newest first)
      return configs.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Failed to get configurations:', error)
      return []
    }
  }

  /**
   * Delete a configuration by name
   */
  static deleteConfiguration(name: string): boolean {
    try {
      const savedConfigs = this.getAllConfigurations()
      const filteredConfigs = savedConfigs.filter((c) => c.name !== name)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredConfigs))
      return true
    } catch (error) {
      console.error('Failed to delete configuration:', error)
      return false
    }
  }

  /**
   * Export configuration as downloadable JSON file
   */
  static exportConfiguration(config: DiagramConfiguration): void {
    try {
      const dataStr = JSON.stringify(config, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `${config.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.scada.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Failed to export configuration:', error)
    }
  }

  /**
   * Import configuration from JSON file
   */
  static importConfiguration(file: File): Promise<DiagramConfiguration | null> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string) as DiagramConfiguration

            // Validate configuration structure
            if (this.validateConfiguration(config)) {
              resolve(config)
            } else {
              console.error('Invalid configuration format')
              resolve(null)
            }
          } catch (error) {
            console.error('Failed to parse configuration file:', error)
            resolve(null)
          }
        }

        reader.onerror = () => {
          console.error('Failed to read file')
          resolve(null)
        }

        reader.readAsText(file)
      } catch (error) {
        console.error('Failed to import configuration:', error)
        resolve(null)
      }
    })
  }

  /**
   * Validate configuration structure
   */
  private static validateConfiguration(config: any): config is DiagramConfiguration {
    return (
      config &&
      typeof config.name === 'string' &&
      typeof config.timestamp === 'number' &&
      typeof config.version === 'string' &&
      config.canvas &&
      typeof config.canvas.scale === 'number' &&
      typeof config.canvas.panX === 'number' &&
      typeof config.canvas.panY === 'number' &&
      Array.isArray(config.components) &&
      Array.isArray(config.groups)
    )
  }
}
