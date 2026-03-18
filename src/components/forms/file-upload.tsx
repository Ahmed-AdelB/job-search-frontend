"use client"

import React, { useRef, useState } from "react"
import { Cloud, File, X, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  acceptedTypes?: string[]
  maxSizeMB?: number
  className?: string
}

/**
 * File upload component with drag-and-drop support
 * Accepts PDF and DOCX files
 */
export function FileUpload({
  onFileSelect,
  isLoading = false,
  acceptedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  maxSizeMB = 10,
  className,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "PDF"
    if (mimeType.includes("wordprocessingml")) return "Word Document"
    return "Document"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return "Only PDF and Word documents are accepted"
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileChange(files[0])
    }
  }

  const handleFileChange = (file: File) => {
    setError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)

    // Simulate upload progress
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 30
      })
    }, 200)

    // Call the callback
    onFileSelect(file)

    // Complete progress after a short delay
    setTimeout(() => {
      setProgress(100)
    }, 500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setProgress(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const fileTypeIcon = selectedFile ? (
    selectedFile.type.includes("pdf") ? (
      <FileText className="h-8 w-8 text-red-500" />
    ) : (
      <File className="h-8 w-8 text-blue-500" />
    )
  ) : null

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors cursor-pointer",
            isDragActive && "bg-muted border-primary/50",
            !isDragActive && "hover:bg-muted/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept={acceptedTypes.join(",")}
            disabled={isLoading}
            className="hidden"
            aria-label="Upload file"
          />

          <div className="rounded-lg bg-muted p-3">
            <Cloud className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isDragActive ? "Drop your file here" : "Drag and drop your file here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select PDF or Word document (max {maxSizeMB}MB)
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <Button variant="default" size="sm" disabled>
              Uploading...
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
          {/* File Info */}
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-muted p-2">
              {fileTypeIcon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{getFileTypeLabel(selectedFile.type)}</span>
                <span>•</span>
                <span>{formatFileSize(selectedFile.size)}</span>
              </div>
            </div>

            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"
              aria-label="Remove file"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Progress Bar */}
          {isLoading && progress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {/* Success State */}
          {!isLoading && progress === 100 && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950 dark:text-green-200">
              <span>✓ File ready to upload</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
