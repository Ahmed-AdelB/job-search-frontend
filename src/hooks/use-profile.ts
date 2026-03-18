"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api-client"
import type { Profile, UpdateProfileRequest, Resume, ResumesResponse } from "@/types/api"
import { toast } from "sonner"

/**
 * Fetch current user's profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<Profile>("/api/profiles/me"),
    staleTime: 60000,
  })
}

/**
 * Update user profile information
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiPut<Profile>("/api/profiles/me", data),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data)
      toast.success("Profile updated successfully")
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })
}

/**
 * Upload CV/Resume file (multipart/form-data)
 */
export function useUploadCV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082"}/api/onboarding/cv`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error((error as { detail?: string }).detail || "Upload failed")
      }

      return response.json() as Promise<Resume>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] })
      toast.success("CV uploaded successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to upload CV")
    },
  })
}

/**
 * Fetch list of user's resumes
 */
export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: () => apiGet<ResumesResponse>("/api/profiles/resumes"),
    staleTime: 30000,
  })
}

/**
 * Delete a resume by ID
 */
export function useDeleteResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resumeId: string) =>
      apiDelete(`/api/profiles/resumes/${resumeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] })
      toast.success("Resume deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete resume")
    },
  })
}

/**
 * Set a resume as primary
 */
export function useSetPrimaryResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resumeId: string) =>
      apiPut<Resume>(`/api/profiles/resumes/${resumeId}/primary`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] })
      toast.success("Primary resume updated")
    },
    onError: () => {
      toast.error("Failed to set primary resume")
    },
  })
}
