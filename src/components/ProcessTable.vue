<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">进程分配表</h2>
    <p class="text-sm text-gray-500 mb-2">最大需求 → 已分配 (需求)</p>

    <!-- Table for larger screens -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full table-auto border-collapse">
        <thead>
          <tr class="bg-gray-50 text-sm font-medium">
            <th class="p-2 text-left">进程</th>
            <th v-for="(_, index) in available" :key="index" class="p-2 text-center">
              {{ resourceNames[index] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="process in processes" :key="process.id" class="border-t hover:bg-gray-50">
            <td class="p-2 font-medium">{{ process.name }}</td>
            <td v-for="(_, resIndex) in available" :key="resIndex" class="p-2">
              <div class="flex items-center justify-center gap-1">
                <input
                  type="number"
                  v-model.number="process.max[resIndex]"
                  min="0"
                  class="w-14 px-2 py-1 border rounded-md text-center"
                />
                <span>→</span>
                <input
                  type="number"
                  v-model.number="process.allocated[resIndex]"
                  min="0"
                  class="w-14 px-2 py-1 border rounded-md text-center"
                />
                <span class="text-sm text-gray-500">({{ calculateNeed(process)[resIndex] }})</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards for mobile view -->
    <div class="md:hidden space-y-3">
      <div
        v-for="process in processes"
        :key="process.id"
        class="border rounded-md p-3 hover:bg-gray-50"
      >
        <div class="font-medium mb-2">{{ process.name }}</div>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="(_, resIndex) in available" :key="resIndex" class="bg-gray-50 p-2 rounded">
            <div class="text-xs font-medium mb-1">{{ resourceNames[resIndex] }}</div>
            <div class="flex items-center gap-1">
              <input
                type="number"
                v-model.number="process.max[resIndex]"
                min="0"
                class="w-12 px-1 py-0.5 border rounded-md text-center text-sm"
              />
              <span class="text-xs">→</span>
              <input
                type="number"
                v-model.number="process.allocated[resIndex]"
                min="0"
                class="w-12 px-1 py-0.5 border rounded-md text-center text-sm"
              />
            </div>
            <div class="text-xs text-gray-500 mt-1">
              需求: {{ calculateNeed(process)[resIndex] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Process } from '@/types'
import { calculateNeed } from '@/utils/bankerAlgorithm'

defineProps<{
  processes: Process[]
  available: number[]
  resourceNames: string[]
}>()
</script>

<style>
@media (max-width: 640px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
