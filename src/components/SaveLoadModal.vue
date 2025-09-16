<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">
          {{ mode === 'save' ? 'Lưu cấu hình' : 'Tải cấu hình' }}
        </h2>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Save Mode -->
        <div v-if="mode === 'save'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Tên cấu hình * </label>
            <input
              v-model="saveForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên cho cấu hình..."
              @keydown.enter="handleSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Mô tả (tùy chọn) </label>
            <textarea
              v-model="saveForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Mô tả ngắn về cấu hình này..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="close"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="handleSave"
              :disabled="!saveForm.name.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Lưu
            </button>
          </div>
        </div>

        <!-- Load Mode -->
        <div v-else class="space-y-4">
          <!-- Import from file -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref="fileInput"
              type="file"
              accept=".json,.scada.json"
              @change="handleFileImport"
              class="hidden"
            />
            <div class="space-y-2">
              <svg
                class="w-12 h-12 text-gray-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p class="text-gray-600">Nhập từ file</p>
              <button
                @click="fileInput?.click()"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Chọn file
              </button>
            </div>
          </div>

          <!-- Saved configurations -->
          <div v-if="savedConfigs.length > 0">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Cấu hình đã lưu</h3>
            <div class="max-h-60 overflow-y-auto space-y-2">
              <div
                v-for="config in savedConfigs"
                :key="config.name"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ config.name }}
                  </h4>
                  <p v-if="config.description" class="text-xs text-gray-500 truncate">
                    {{ config.description }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ formatDate(config.timestamp) }} - {{ config.components.length }} components,
                    {{ config.groups.length }} groups
                  </p>
                </div>
                <div class="flex space-x-2 ml-4">
                  <button
                    @click="handleLoad(config)"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="Tải cấu hình"
                  >
                    Tải
                  </button>
                  <button
                    @click="handleExport(config)"
                    class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    title="Xuất file"
                  >
                    Xuất
                  </button>
                  <button
                    @click="handleDelete(config.name)"
                    class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Xóa cấu hình"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">Chưa có cấu hình nào được lưu</div>

          <div class="flex justify-end pt-4">
            <button
              @click="close"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { SaveLoadManager, type DiagramConfiguration } from '../utils/saveLoad'

const props = defineProps<{
  isVisible: boolean
  mode: 'save' | 'load'
}>()

const emit = defineEmits<{
  close: []
  save: [name: string, description?: string]
  load: [config: DiagramConfiguration]
  import: [file: File]
}>()

// Save form
const saveForm = ref({
  name: '',
  description: '',
})

// File input ref
const fileInput = ref<HTMLInputElement>()

// Saved configurations
const savedConfigs = ref<DiagramConfiguration[]>([])

// Load saved configurations when modal opens
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      savedConfigs.value = SaveLoadManager.getAllConfigurations()
      if (props.mode === 'save') {
        // Clear form and focus on name input
        saveForm.value = { name: '', description: '' }
        nextTick(() => {
          const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement
          nameInput?.focus()
        })
      }
    }
  },
)

const close = () => {
  emit('close')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

const handleSave = () => {
  if (saveForm.value.name.trim()) {
    emit('save', saveForm.value.name.trim(), saveForm.value.description.trim() || undefined)
  }
}

const handleLoad = (config: DiagramConfiguration) => {
  emit('load', config)
}

const handleExport = (config: DiagramConfiguration) => {
  SaveLoadManager.exportConfiguration(config)
}

const handleDelete = (name: string) => {
  if (confirm(`Bạn có chắc muốn xóa cấu hình "${name}"?`)) {
    if (SaveLoadManager.deleteConfiguration(name)) {
      // Refresh the list
      savedConfigs.value = SaveLoadManager.getAllConfigurations()
    }
  }
}

const handleFileImport = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('import', file)
    // Reset input
    input.value = ''
  }
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
