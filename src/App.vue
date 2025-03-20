<template>
  <div class="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
    <header class="mb-4 text-center">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">🏭 工厂资源管理系统</h1>
      <p class="text-gray-600 mt-0.5">银行家算法实现</p>
    </header>

    <div class="max-w-7xl mx-auto">
      <!-- Main Layout Grid -->
      <div class="grid lg:grid-cols-12 gap-4">
        <!-- Left column: setup and controls -->
        <div class="lg:col-span-4 space-y-4">
          <!-- System Setup Section -->
          <SystemConfig
            v-model:numResources="config.numResources"
            v-model:numProcesses="config.numProcesses"
            @initialize="initializeSystem"
          />

          <!-- Available Resources Display -->
          <ResourcesDisplay
            v-if="systemInitialized"
            :available="systemState.available"
            :resourceNames="resourceNames.slice(0, systemState.available.length)"
          />

          <!-- Request Form -->
          <RequestForm
            v-if="systemInitialized"
            :request="request"
            :available="systemState.available"
            :resourceNames="resourceNames.slice(0, systemState.available.length)"
            :processes="systemState.processes"
            @submit="handleRequest"
            @generateRandom="generateRandomRequest"
          />
        </div>

        <!-- Right column: tables and results -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Process Table -->
          <ProcessTable
            v-if="systemInitialized"
            :processes="systemState.processes"
            :available="systemState.available"
            :resourceNames="resourceNames.slice(0, systemState.available.length)"
          />

          <!-- Calculation Results -->
          <CalculationResults
            v-if="systemInitialized && calculationResult.steps.length"
            :calculationResult="calculationResult"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Request, SystemState, BankerResult } from '@/types'
import { processRequest, calculateNeed } from '@/utils/bankerAlgorithm'

// Import components
import SystemConfig from '@/components/SystemConfig.vue'
import ResourcesDisplay from '@/components/ResourcesDisplay.vue'
import RequestForm from '@/components/RequestForm.vue'
import ProcessTable from '@/components/ProcessTable.vue'
import CalculationResults from '@/components/CalculationResults.vue'

// System configuration
const config = reactive({
  numResources: 3,
  numProcesses: 5,
})

// Track if system is initialized
const systemInitialized = ref(false)

// Available resource and process names
const resourceNames = ref<string[]>([
  '钢材',
  '数控机床',
  '技术工人',
  '原料仓库',
  '叉车',
  '电力',
  '流动资金',
  '研发团队',
  '生产管理系统',
  '质检设备',
  '包装材料',
  '维修工具',
  '备品备件',
  '办公设施',
  '安全设备',
  '环保设施',
  '通讯设备',
])

const processNames = ref<string[]>([
  '冲压成型',
  '焊接组装',
  '表面处理',
  '零件分拣',
  '成品配送',
  '设备维护',
  '原料预处理',
  '成品检验',
  '包装入库',
  '废料回收',
  '品质管控',
  '工艺改进',
  '安全监督',
  '环境监测',
  '生产调度',
])

// Initialize system state
const systemState = reactive<SystemState>({
  resources: [],
  processes: [],
  available: [],
})

// Initialize current request state
const request = reactive<Request>({
  processId: 0,
  resources: [],
})

// Store calculation results
const calculationResult = reactive<BankerResult>({
  isSafe: false,
  steps: [],
  resultMessage: '',
  safeSequences: [],
})

/**
 * Initialize the system with random processes and resources
 */
function initializeSystem() {
  // Reset the system state
  systemState.resources = []
  systemState.processes = []
  systemState.available = []

  // Generate random available resources (between 1-10 for each resource type)
  systemState.available = Array.from(
    { length: config.numResources },
    () => Math.floor(Math.random() * 10) + 1,
  )

  // Create resource objects
  systemState.resources = Array.from({ length: config.numResources }, (_, i) => ({
    id: i,
    name: i < resourceNames.value.length ? resourceNames.value[i] : `资源${i + 1}`,
    available: systemState.available[i],
  }))

  // Create processes with random allocations
  systemState.processes = Array.from({ length: config.numProcesses }, (_, i) => {
    const allocated = Array.from({ length: config.numResources }, () =>
      Math.floor(Math.random() * 5),
    )

    const max = allocated.map((val) => val + Math.floor(Math.random() * 5))

    return {
      id: i,
      name: i < processNames.value.length ? processNames.value[i] : `进程${i + 1}`,
      max,
      allocated,
    }
  })

  // Reset request
  request.processId = 0
  request.resources = Array(config.numResources).fill(0)

  // Clear previous calculation result
  calculationResult.steps = []
  calculationResult.resultMessage = ''
  calculationResult.safeSequences = []
  calculationResult.isSafe = false
  calculationResult.optimalSequence = undefined

  // Mark system as initialized
  systemInitialized.value = true
}

/**
 * Handle a resource request by processing it through the banker's algorithm
 */
function handleRequest(newRequest?: Request) {
  // If a new request is provided by the component, update our local request
  if (newRequest) {
    request.processId = newRequest.processId
    request.resources = [...newRequest.resources]
  }

  const result = processRequest(
    request.processId,
    request.resources,
    systemState.available,
    systemState.processes,
  )

  // Update the calculation result state
  Object.assign(calculationResult, result)
}

/**
 * Generate a random resource request for a random process
 */
function generateRandomRequest() {
  const processes = systemState.processes
  const pid = Math.floor(Math.random() * processes.length)

  // Get the current needed resources for this process
  const need = calculateNeed(processes[pid])

  // Generate random resource request (that doesn't exceed need)
  request.processId = pid
  request.resources = need.map((n) => (n > 0 ? Math.floor(Math.random() * (n + 1)) : 0))
}
</script>

<style>
@media (max-width: 640px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
