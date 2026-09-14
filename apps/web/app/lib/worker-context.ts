import { createContext } from 'react-router'

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
  cache?: {
    purge(
      options:
        | { tags: string[] }
        | { files: string[] }
        | { hosts: string[] }
        | { prefixes: string[] },
    ): Promise<unknown>
  }
}

export const executionContext = createContext<WorkerExecutionContext>()
