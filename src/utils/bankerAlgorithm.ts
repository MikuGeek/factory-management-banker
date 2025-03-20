import type { Process, BankerResult, SafeSequence } from '@/types'

/**
 * Calculate the remaining resource needs of a process
 */
export function calculateNeed(process: Process): number[] {
  return process.max.map((max, i) => max - process.allocated[i])
}

/**
 * Check if a process can run with given available resources
 */
export function canProcessRun(process: Process, available: number[]): boolean {
  const need = calculateNeed(process)
  return need.every((n, i) => n <= available[i])
}

/**
 * Recursively find all safe execution sequences in the system
 */
export function findSafeSequences(
  work: number[],
  processes: Process[],
  finish: boolean[],
  path: number[],
  sequences: number[][],
): void {
  let hasNext = false

  processes.forEach((process, i) => {
    if (!finish[i] && canProcessRun(process, work)) {
      hasNext = true

      // Create copies to avoid mutation
      const newWork = [...work]
      const newFinish = [...finish]
      const newPath = [...path, i]

      // Release resources after process execution
      process.allocated.forEach((val, j) => (newWork[j] += val))
      newFinish[i] = true

      // Continue finding sequences with updated state
      findSafeSequences(newWork, processes, newFinish, newPath, sequences)
    }
  })

  // If we can't find any more processes and we've included all processes,
  // we have a complete safe sequence
  if (!hasNext && path.length === processes.length) {
    sequences.push([...path])
  }
}

/**
 * Calculate efficiency score for a sequence
 * Higher scores indicate more efficient resource utilization
 */
export function calculateEfficiency(
  sequence: number[],
  available: number[],
  processes: Process[],
): number {
  let efficiency = 0
  const tempResources = [...available]

  sequence.forEach((pid, index) => {
    // Calculate resource utilization efficiency based on:
    // 1. Amount of resources released
    // 2. How early they're released in the sequence (earlier is better)
    const resourcesBefore = tempResources.reduce((sum, value) => sum + value, 0)

    // Release resources
    processes[pid].allocated.forEach((val, i) => (tempResources[i] += val))

    const resourcesAfter = tempResources.reduce((sum, value) => sum + value, 0)
    const resourcesReleased = resourcesAfter - resourcesBefore

    // Weight by position in sequence (earlier releases are more valuable)
    const positionWeight = sequence.length - index

    efficiency += resourcesReleased * positionWeight
  })

  return efficiency
}

/**
 * Generate detailed calculation steps for a specific sequence
 */
export function generateSequenceSteps(
  sequence: number[],
  available: number[],
  processes: Process[],
): string[] {
  const steps: string[] = []
  const tempAvailable = [...available]

  steps.push(`最优序列执行过程详解:`)

  sequence.forEach((pid, index) => {
    // Current state
    steps.push(
      `步骤 ${index + 1}: 执行进程 P${pid}${processes[pid].name ? ` (${processes[pid].name})` : ''}`,
    )
    steps.push(`  • 执行前可用资源: ${tempAvailable.join(', ')}`)

    // Check if process can run
    const need = calculateNeed(processes[pid])
    const canRun = need.every((n, i) => n <= tempAvailable[i])

    steps.push(`  • 进程 P${pid} 当前需求: ${need.join(', ')}`)
    steps.push(`  • 检查是否可以执行: ${canRun ? '✅ 可以' : '❌ 不可以'}`)

    // Update resources after process completes
    processes[pid].allocated.forEach((val, i) => (tempAvailable[i] += val))

    steps.push(`  • 进程 P${pid} 释放资源: ${processes[pid].allocated.join(', ')}`)
    steps.push(`  • 执行后可用资源: ${tempAvailable.join(', ')}`)

    if (index < sequence.length - 1) {
      steps.push(`  ↓`)
    }
  })

  // Final state
  steps.push(`✅ 所有进程执行完毕，系统安全！`)
  steps.push(`最终可用资源: ${tempAvailable.join(', ')}`)

  return steps
}

/**
 * Validate if a request is valid (within process needs and available resources)
 */
export function validateRequest(
  processId: number,
  request: number[],
  available: number[],
  processes: Process[],
): { isValid: boolean; errorMessage: string } {
  const process = processes[processId]
  const need = calculateNeed(process)

  // Check if request exceeds process needs
  if (request.some((val, i) => val > need[i])) {
    return {
      isValid: false,
      errorMessage: '错误：请求超过最大需求',
    }
  }

  // Check if enough resources are available
  if (request.some((val, i) => val > available[i])) {
    return {
      isValid: false,
      errorMessage: '错误：可用资源不足',
    }
  }

  return { isValid: true, errorMessage: '' }
}

/**
 * Process a resource request using the banker's algorithm
 */
export function processRequest(
  processId: number,
  request: number[],
  available: number[],
  processes: Process[],
): BankerResult {
  const result: BankerResult = {
    isSafe: false,
    steps: [],
    resultMessage: '',
    safeSequences: [],
    processNames: [],
  }

  // Step 1: Validate request
  const validation = validateRequest(processId, request, available, processes)

  if (!validation.isValid) {
    result.resultMessage = validation.errorMessage
    result.steps.push(validation.errorMessage + '，请求被拒绝')
    return result
  }

  // Step 2: Temporarily allocate resources
  const tempAvailable = available.map((val, i) => val - request[i])

  // Create temporary processes with updated allocations
  const tempProcesses = processes.map((p, i) => {
    if (i === processId) {
      return {
        ...p,
        allocated: p.allocated.map((a, j) => a + request[j]),
      }
    }
    return p
  })

  result.steps.push('开始安全检查...')
  result.steps.push(`当前可用资源: ${tempAvailable.join(', ')}`)
  result.steps.push(
    `进程 ${processId}${processes[processId].name ? ` (${processes[processId].name})` : ''} 请求资源: ${request.join(', ')}`,
  )

  // Step 3: Find all safe sequences
  const allSequences: number[][] = []
  findSafeSequences(
    [...tempAvailable],
    tempProcesses,
    Array(processes.length).fill(false),
    [],
    allSequences,
  )

  // Step 4: Evaluate results
  result.isSafe = allSequences.length > 0

  if (result.isSafe) {
    // Calculate efficiency for each sequence
    const safeSequences: SafeSequence[] = allSequences.map((sequence) => ({
      sequence,
      efficiency: calculateEfficiency(sequence, tempAvailable, tempProcesses),
    }))

    // Sort by efficiency (descending)
    safeSequences.sort((a, b) => b.efficiency - a.efficiency)

    result.safeSequences = safeSequences
    result.optimalSequence = safeSequences[0].sequence

    // Add process names for display
    result.processNames = tempProcesses.map((p) => p.name || '')

    // Format the result message
    const optimalSequenceStr = result.optimalSequence
      .map((id) => `P${id}${tempProcesses[id].name ? ` (${tempProcesses[id].name})` : ''}`)
      .join(' → ')

    result.resultMessage = `系统安全 (找到 ${safeSequences.length} 个序列)。最优序列: ${optimalSequenceStr}`

    // Generate detailed steps
    result.steps = [
      '安全检查步骤:',
      `当前可用资源: ${tempAvailable.join(', ')}`,
      `进程 ${processId}${processes[processId].name ? ` (${processes[processId].name})` : ''} 请求资源: ${request.join(', ')}`,
      '检查每个进程的需求:',
      ...tempProcesses.map(
        (p, i) => `  P${i}${p.name ? ` (${p.name})` : ''}: 需求 = ${calculateNeed(p).join(', ')}`,
      ),
      '寻找安全序列...',
      ...safeSequences.slice(0, 5).map(
        (
          seq,
          i, // Show top 5 sequences
        ) =>
          `安全序列 ${i + 1}: ${seq.sequence
            .map((id) => `P${id}${tempProcesses[id].name ? ` (${tempProcesses[id].name})` : ''}`)
            .join(' → ')} ` + `(效率得分: ${seq.efficiency.toFixed(2)})`,
      ),
      `🏆 使用最高效序列: ${optimalSequenceStr}`,
    ]

    // Add detailed calculation steps for the optimal sequence
    const detailedSteps = generateSequenceSteps(
      result.optimalSequence,
      tempAvailable,
      tempProcesses,
    )

    result.steps = [...result.steps, ...detailedSteps]
  } else {
    result.resultMessage = '系统将处于不安全状态！请求被拒绝'
    result.steps.push('安全检查失败：未找到安全序列')
    result.steps.push('当前资源分配可能导致死锁，请求被拒绝')
  }

  return result
}
