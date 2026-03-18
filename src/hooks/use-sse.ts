"use client"

import { useEffect, useRef, useCallback } from "react"
import { connectSSE, disconnectSSE } from "@/lib/sse"

type MessageHandler = (data: unknown) => void
type ErrorHandler = (error: Event) => void

interface UseSSEOptions {
  enabled?: boolean
  onError?: ErrorHandler
}

/**
 * Hook for subscribing to Server-Sent Events
 * Handles connection, reconnection, and cleanup automatically
 */
export function useSSE(
  endpoint: string,
  onMessage: MessageHandler,
  options: UseSSEOptions = {}
) {
  const { enabled = true, onError } = options
  const messageHandlerRef = useRef(onMessage)
  const errorHandlerRef = useRef(onError)

  // Keep refs in sync with props
  useEffect(() => {
    messageHandlerRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    errorHandlerRef.current = onError
  }, [onError])

  // Connect to SSE endpoint
  useEffect(() => {
    if (!enabled) return

    // Wrap handlers to use current refs
    const handleMessage = (data: unknown) => {
      messageHandlerRef.current(data)
    }

    const handleError = (error: Event) => {
      errorHandlerRef.current?.(error)
    }

    try {
      connectSSE(endpoint, handleMessage, handleError)
    } catch (error) {
      console.error("Failed to connect to SSE:", error)
    }

    // Cleanup on unmount
    return () => {
      disconnectSSE(endpoint)
    }
  }, [endpoint, enabled])

  // Return disconnect function for manual control
  const disconnect = useCallback(() => {
    disconnectSSE(endpoint)
  }, [endpoint])

  return { disconnect }
}
