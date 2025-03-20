<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      📦 可用资源
      <span class="text-sm font-normal text-gray-500">(系统生成)</span>
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="(val, index) in available"
        :key="index"
        class="flex flex-col items-center gap-1 bg-gray-50 p-2 rounded-md"
      >
        <label class="text-sm font-medium">{{ resourceNames[index] }}</label>
        <span class="w-16 px-2 py-1 border rounded-md bg-white text-center">{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  available: number[]
  resourceNames: string[]
}>()
</script>
