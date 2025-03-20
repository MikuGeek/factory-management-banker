<template>
  <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-300">
    <h2 class="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800">
      <span class="text-blue-600 bg-blue-50 p-1.5 rounded-lg shadow-sm">📝</span> 安全检查结果
    </h2>

    <!-- Result status banner -->
    <div
      :class="[
        'p-4 rounded-xl font-medium flex items-center gap-3 mb-5 shadow-md transition-all duration-300',
        calculationResult.isSafe
          ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200'
          : 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200',
      ]"
    >
      <span class="text-2xl">{{ calculationResult.isSafe ? '✅' : '❌' }}</span>
      <span class="text-base">{{ calculationResult.resultMessage }}</span>
    </div>

    <!-- Calculation details section -->
    <div
      class="max-h-[700px] overflow-y-auto space-y-5 pr-2 border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-md"
    >
      <!-- Safe sequences visualization (if system is safe) -->
      <div
        v-if="calculationResult.isSafe && calculationResult.safeSequences.length > 0"
        class="mb-6"
      >
        <h3 class="text-md font-medium mb-4 flex items-center gap-2 text-gray-800">
          <span class="text-green-600 bg-green-50 p-1 rounded-lg shadow-sm">🔄</span> 可行安全序列
        </h3>
        <div class="space-y-4">
          <div
            v-for="(seq, index) in showingAll
              ? calculationResult.safeSequences
              : calculationResult.safeSequences.slice(0, maxSequencesToShow)"
            :key="index"
            :class="[
              'border rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5',
              index === 0
                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                : 'bg-white hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center gap-2 mb-3">
              <div
                :class="[
                  'font-mono text-sm rounded-full w-7 h-7 flex items-center justify-center shadow-md transition-all duration-300',
                  index === 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700',
                ]"
              >
                {{ index + 1 }}
              </div>
              <div
                class="text-sm font-medium flex items-center flex-wrap"
                :class="index === 0 ? 'text-green-700' : 'text-gray-700'"
              >
                安全序列 {{ index + 1 }}
                <span
                  class="text-xs font-normal ml-2 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg"
                >
                  效率得分: {{ seq.efficiency.toFixed(2) }}
                </span>
                <span
                  v-if="index === 0"
                  class="ml-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md"
                  >最优</span
                >
              </div>
            </div>

            <div class="pl-8 relative">
              <!-- Path line -->
              <div
                class="absolute left-[13px] top-1 bottom-1 w-1"
                :class="index === 0 ? 'bg-green-200' : 'bg-gray-200'"
              ></div>

              <!-- Sequence items -->
              <div class="flex items-center flex-wrap gap-x-3 gap-y-3">
                <template v-for="(pid, seqIndex) in seq.sequence" :key="seqIndex">
                  <div class="flex items-center">
                    <span
                      class="px-3 py-1.5 rounded-full text-xs font-medium shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                      :class="
                        index === 0
                          ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      "
                    >
                      P{{ pid
                      }}{{
                        calculationResult.processNames && calculationResult.processNames[pid]
                          ? ` (${calculationResult.processNames[pid]})`
                          : ''
                      }}
                    </span>
                    <span
                      v-if="seqIndex < seq.sequence.length - 1"
                      :class="[
                        'text-xs mx-1 font-bold',
                        index === 0 ? 'text-green-500' : 'text-gray-400',
                      ]"
                      >→</span
                    >
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Show more/less button when there are more sequences than the default limit -->
          <button
            v-if="calculationResult.safeSequences.length > maxSequencesToShow"
            @click="toggleShowAll"
            class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-blue-100 shadow-sm hover:shadow-md"
          >
            <span v-if="showingAll" class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
              收起 (显示少些序列)
            </span>
            <span v-else class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              展开 (显示全部 {{ calculationResult.safeSequences.length }} 个序列)
            </span>
          </button>
        </div>
      </div>

      <!-- Calculation steps -->
      <div class="mt-8">
        <h3 class="text-md font-medium mb-4 flex items-center gap-2 text-gray-800">
          <span class="text-blue-600 bg-blue-50 p-1 rounded-lg shadow-sm">📊</span> 详细计算步骤
        </h3>
        <div class="space-y-2 bg-white rounded-xl border border-gray-200 shadow-md p-4">
          <div
            v-for="(step, index) in calculationResult.steps"
            :key="index"
            class="text-sm py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-sm"
            :class="{
              'font-semibold text-blue-800 bg-blue-50 border border-blue-100 shadow-sm':
                step.startsWith('📋') || step.startsWith('📊'),
              'bg-green-50 border-l-4 border-green-500 pl-4 text-green-800': step.startsWith('✅'),
              'bg-gray-50 border-l-4 border-gray-300 pl-4 shadow-sm': step.includes('步骤'),
              'text-gray-600 pl-8 hover:bg-gray-50': step.startsWith('  •'),
              'text-xs': step.startsWith('  •'),
              'italic text-gray-400 text-xs pl-6': step === '  ↓',
              'border-b border-gray-100 pb-3 font-medium': step.startsWith('🏆'),
            }"
          >
            <div class="flex items-center gap-2">
              <span
                v-if="step.startsWith('📋') || step.startsWith('📊')"
                class="text-lg bg-blue-100 p-1 rounded-md"
                >{{ step.charAt(0) }}</span
              >
              <span v-else-if="step.startsWith('✅')" class="text-lg bg-green-100 p-1 rounded-md"
                >✅</span
              >
              <span v-else-if="step.startsWith('🏆')" class="text-lg bg-yellow-100 p-1 rounded-md"
                >🏆</span
              >
              <span
                v-else-if="step.includes('步骤')"
                class="text-blue-600 bg-blue-50 p-1 rounded-md"
                >⚙️</span
              >
              <span v-else-if="step.startsWith('  •')" class="text-gray-400">•</span>
              <span v-else-if="step === '  ↓'" class="text-gray-400">↓</span>
              <span v-else class="text-gray-400">→</span>
              <span class="flex-1">{{ step.replace(/^[📋📊✅🏆⚙️•↓→\s]+/, '') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BankerResult } from '@/types'
import { ref } from 'vue'

defineProps<{
  calculationResult: BankerResult
}>()

const maxSequencesToShow = 5
const showingAll = ref(false)

const toggleShowAll = () => {
  showingAll.value = !showingAll.value
}
</script>

<style scoped>
/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 10px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 10px;
  border: 2px solid #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* Subtle animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.text-green-800,
.text-blue-800 {
  position: relative;
  overflow: hidden;
}
</style>
