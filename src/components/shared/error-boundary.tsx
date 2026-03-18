"use client"

import { Component, ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-12 text-center">
            <div className="rounded-lg bg-destructive/20 p-3">
              <AlertCircle className="size-6 text-destructive" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-destructive">
                Something went wrong
              </h3>
              {this.state.error && (
                <p className="text-sm text-muted-foreground">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <Button onClick={this.resetError} variant="default" size="sm">
              Try again
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
