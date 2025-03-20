<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">⚙️ 系统配置</h2>
    <div class="space-y-3 flex flex-row justify-evenly gap-2">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">资源数量:</label>
        <input
          type="number"
          v-model.number="localNumResources"
          min="1"
          max="7"
          class="w-24 px-3 py-2 border rounded-md text-center"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">进程数量:</label>
        <input
          type="number"
          v-model.number="localNumProcesses"
          min="1"
          max="8"
          class="w-24 px-3 py-2 border rounded-md text-center"
        />
      </div>
    </div>
    <button
      @click="initialize"
      class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
    >
      🚀 初始化系统(随机生成)
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  numResources: number
  numProcesses: number
}>()

const emit = defineEmits<{
  (e: 'update:numResources', value: number): void
  (e: 'update:numProcesses', value: number): void
  (e: 'initialize'): void
}>()

const localNumResources = ref(props.numResources)
const localNumProcesses = ref(props.numProcesses)

watch(localNumResources, (newValue) => {
  emit('update:numResources', newValue)
})

watch(localNumProcesses, (newValue) => {
  emit('update:numProcesses', newValue)
})

function initialize() {
  emit('initialize')
}
</script>
