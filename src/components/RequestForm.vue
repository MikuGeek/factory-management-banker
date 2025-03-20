<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">📨 资源请求</h2>
    <div class="space-y-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">生产进程:</label>
        <select v-model.number="localRequest.processId" class="w-full px-2 py-1 border rounded-md">
          <option v-for="process in processes" :key="process.id" :value="process.id">
            P{{ process.id }} - {{ process.name }}
          </option>
        </select>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div v-for="(_, index) in available" :key="index" class="flex flex-col gap-1">
          <label class="text-sm font-medium">{{ resourceNames[index] }}</label>
          <input
            type="number"
            v-model.number="localRequest.resources[index]"
            min="0"
            class="w-full px-2 py-1 border rounded-md text-center"
          />
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button
          @click="submitRequest"
          class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded transition-colors text-sm font-medium"
        >
          ✅ 提交请求
        </button>
        <button
          @click="generateRandomRequest"
          class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded transition-colors text-sm font-medium"
        >
          🎲 随机请求
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Request, Process } from '@/types'

const props = defineProps<{
  request: Request
  available: number[]
  resourceNames: string[]
  processes: Process[]
}>()

const emit = defineEmits<{
  (e: 'submit', request: Request): void
  (e: 'generateRandom'): void
}>()

// Create a local copy of the request to avoid mutating props directly
const localRequest = ref<Request>({
  processId: props.request.processId,
  resources: [...props.request.resources],
})

// Keep localRequest in sync with props.request
watch(
  () => props.request,
  (newValue) => {
    localRequest.value = {
      processId: newValue.processId,
      resources: [...newValue.resources],
    }
  },
  { deep: true },
)

function submitRequest() {
  // Create a new request object to avoid mutating props
  const newRequest: Request = {
    processId: localRequest.value.processId,
    resources: [...localRequest.value.resources],
  }

  // Emit the submit event with the new request
  emit('submit', newRequest)
}

function generateRandomRequest() {
  emit('generateRandom')
}
</script>
