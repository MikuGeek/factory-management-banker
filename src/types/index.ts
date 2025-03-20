export interface Resource {
  id: number
  name: string
  available: number
}

export interface Process {
  id: number
  name: string
  max: number[] // Maximum resource requirements
  allocated: number[] // Currently allocated resources
}

export interface SystemState {
  resources: Resource[]
  processes: Process[]
  available: number[] // Available resources (convenience array of resource.available values)
}

export interface Request {
  processId: number
  resources: number[]
}

export interface SafeSequence {
  sequence: number[]
  efficiency: number
}

export interface BankerResult {
  isSafe: boolean
  steps: string[]
  resultMessage: string
  safeSequences: SafeSequence[]
  optimalSequence?: number[]
  processNames?: string[] // Process names for display purposes
}
