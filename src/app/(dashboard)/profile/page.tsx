"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Trash2, CheckCircle2, Loader2 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CardSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { FileUpload } from "@/components/forms/file-upload"
import {
  useProfile,
  useUpdateProfile,
  useUploadCV,
  useResumes,
  useDeleteResume,
  useSetPrimaryResume,
} from "@/hooks/use-profile"
import { cn } from "@/lib/utils"

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

/**
 * Profile Page - User account management
 */
export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null)

  // Queries and mutations
  const profileQuery = useProfile()
  const resumesQuery = useResumes()
  const updateProfileMutation = useUpdateProfile()
  const uploadCVMutation = useUploadCV()
  const deleteResumeMutation = useDeleteResume()
  const setPrimaryResumeMutation = useSetPrimaryResume()

  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileQuery.data?.name || "",
      phone: profileQuery.data?.phone || "",
      location: profileQuery.data?.location || "",
      bio: profileQuery.data?.bio || "",
    },
  })

  // Update form when profile data loads
  React.useEffect(() => {
    if (profileQuery.data) {
      form.reset({
        name: profileQuery.data.name || "",
        phone: profileQuery.data.phone || "",
        location: profileQuery.data.location || "",
        bio: profileQuery.data.bio || "",
      })
    }
  }, [profileQuery.data, form])

  // Handle profile form submission
  const handleProfileSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data)
    setIsEditingProfile(false)
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    await uploadCVMutation.mutateAsync(file)
  }

  // Handle resume deletion
  const handleDeleteResume = async () => {
    if (deleteResumeId) {
      await deleteResumeMutation.mutateAsync(deleteResumeId)
      setDeleteResumeId(null)
    }
  }

  // Handle set primary resume
  const handleSetPrimary = async (resumeId: string) => {
    await setPrimaryResumeMutation.mutateAsync(resumeId)
  }

  const isLoading = profileQuery.isPending || profileQuery.isLoading
  const isLoadingResumes = resumesQuery.isPending || resumesQuery.isLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (profileQuery.isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and CV
          </p>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your basic profile details
            </CardDescription>
          </div>
          <Button
            variant={isEditingProfile ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {isEditingProfile ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleProfileSubmit)}
            className="space-y-4"
          >
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                disabled={!isEditingProfile}
                {...form.register("name")}
                className={form.formState.errors.name ? "border-red-500" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileQuery.data?.email || ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled={!isEditingProfile}
                {...form.register("phone")}
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="San Francisco, CA"
                disabled={!isEditingProfile}
                {...form.register("location")}
              />
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                disabled={!isEditingProfile}
                {...form.register("bio")}
                className={cn(
                  "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  !isEditingProfile && "bg-muted text-muted-foreground"
                )}
                rows={4}
              />
            </div>

            {isEditingProfile && (
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Section 2: CV Manager */}
      <Card>
        <CardHeader>
          <CardTitle>CV Manager</CardTitle>
          <CardDescription>
            Upload and manage your resume/CV files
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div>
            <h4 className="font-medium mb-3">Upload New CV</h4>
            <FileUpload
              onFileSelect={handleFileUpload}
              isLoading={uploadCVMutation.isPending}
              maxSizeMB={10}
            />
          </div>

          {/* Existing Resumes List */}
          <div>
            <h4 className="font-medium mb-3">Your Resumes</h4>
            {isLoadingResumes ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg border border-border bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : resumesQuery.data?.resumes && resumesQuery.data.resumes.length > 0 ? (
              <div className="space-y-2">
                {resumesQuery.data.resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{resume.filename}</p>
                        {resume.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{Math.round(resume.file_size / 1024)} KB</span>
                        <span>•</span>
                        <span>
                          {new Date(resume.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!resume.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(resume.id)}
                          disabled={setPrimaryResumeMutation.isPending}
                        >
                          {setPrimaryResumeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">Set Primary</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteResumeId(resume.id)}
                        disabled={deleteResumeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No CVs uploaded yet"
                description="Upload your first CV to get started"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Parsed Profile Data */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
          <CardDescription>
            Information extracted from your resume
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Skills */}
          <div>
            <h4 className="font-medium mb-3">Skills</h4>
            {profileQuery.data?.bio ? (
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "JavaScript"].map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skills extracted yet
              </p>
            )}
          </div>

          {/* Experience */}
          <div>
            <h4 className="font-medium mb-3">Experience</h4>
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-sm">Senior Software Engineer</p>
                <p className="text-xs text-muted-foreground">TechCorp Inc.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  2021 - Present
                </p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="font-medium mb-3">Education</h4>
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-sm">Bachelor of Science</p>
                <p className="text-xs text-muted-foreground">Computer Science</p>
                <p className="text-xs text-muted-foreground mt-1">
                  University of California, 2021
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Onboarding Status */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            Complete these steps to unlock all features
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Email Verified", completed: true },
              { title: "Profile Completed", completed: true },
              { title: "Resume Uploaded", completed: resumesQuery.data?.resumes && resumesQuery.data.resumes.length > 0 },
              { title: "Preferences Set", completed: false },
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                    step.completed
                      ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <span className="text-xs font-bold">✓</span>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.completed ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Resume Confirmation Dialog */}
      <AlertDialog open={!!deleteResumeId} onOpenChange={() => setDeleteResumeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resume? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResume} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
