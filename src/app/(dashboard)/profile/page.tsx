"use client";

/**
 * Profile Page - Personal info and resume management
 * Author: Ahmed Adel Bakr Alderai
 */

import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Save,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  Loader2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api-client";
import type { Profile, UpdateProfileRequest, Resume, ResumesResponse, OnboardingStatus, ParsedProfileData } from "@/types/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as any;

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<{ profile: Profile }>("/api/v1/profiles/me"),
  });

  const { data: resumesData, isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => apiGet<ResumesResponse>("/api/v1/profiles/resumes"),
  });

  const { data: onboardingData } = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => apiGet<{ status: OnboardingStatus }>("/api/v1/onboarding/status"),
  });

  const profile = profileData?.profile;
  const resumes = resumesData?.resumes ?? [];
  const onboarding = onboardingData?.status;

  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and resumes
        </p>
      </div>

      {/* Onboarding Progress */}
      {onboarding && !onboarding.completed_at && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Profile Setup Progress</p>
                <span className="text-sm text-muted-foreground">Step {onboarding.step}/4</span>
              </div>
              <Progress value={(onboarding.step / 4) * 100} className="h-2" />
              <motion.div
                className="flex gap-4 mt-3 text-xs"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <StepIndicator done={onboarding.email_verified} label="Email Verified" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StepIndicator done={onboarding.profile_completed} label="Profile" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StepIndicator done={onboarding.resume_uploaded} label="Resume" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StepIndicator done={onboarding.preferences_set} label="Preferences" />
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">
            <User className="w-4 h-4 me-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="resumes">
            <FileText className="w-4 h-4 me-2" />
            Resumes ({resumes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          {profileLoading ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : profile ? (
            <ProfileForm profile={profile} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Unable to load profile</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resumes" className="mt-6">
          <div className="space-y-4">
            <ResumeUpload />
            {resumesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No resumes uploaded. Upload your first resume to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {resumes.map((resume) => (
                  <motion.div key={resume.id} variants={itemVariants}>
                    <ResumeCard resume={resume} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function StepIndicator({ done, label }: { done: boolean; label: string }) {
  return (
    <motion.div
      className="flex items-center gap-1"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring" as const, stiffness: 120, damping: 12 }}
    >
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={done ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>{label}</span>
    </motion.div>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpdateProfileRequest>({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiPut<{ profile: Profile }>("/api/v1/profiles/me", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input value={profile.email} disabled className="bg-muted" />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </Label>
              <Input
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+353 ..."
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location
              </Label>
              <Input
                value={form.location ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Dublin, Ireland"
              />
            </motion.div>
          </motion.div>
          <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Label>Bio</Label>
            <Textarea
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A brief professional summary..."
              rows={4}
            />
          </motion.div>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Button
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 me-2" />
              )}
              Save Changes
            </Button>
            {updateMutation.isSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResumeUpload() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiUrl}/api/v1/profiles/resumes`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const handleFile = useCallback((file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardContent className="p-4">
          <motion.div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring" as const, stiffness: 120, damping: 12 }}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            ) : (
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {uploadMutation.isPending ? "Uploading..." : "Drop your resume here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF or DOCX, up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const queryClient = useQueryClient();

  const setPrimaryMutation = useMutation({
    mutationFn: () => apiPost<{ status: string }>(`/api/v1/profiles/resumes/${resume.id}/primary`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete<{ status: string }>(`/api/v1/profiles/resumes/${resume.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const parsed = resume.parsed_data as ParsedProfileData | undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring" as const, stiffness: 120, damping: 12 }}
    >
      <Card className={resume.is_primary ? "border-primary" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{resume.filename}</p>
                  {resume.is_primary && (
                    <Badge className="bg-primary text-xs">
                      <Star className="w-3 h-3 me-1" /> Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(resume.file_size / 1024).toFixed(1)} KB · Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {!resume.is_primary && (
                <Button variant="ghost" size="sm" onClick={() => setPrimaryMutation.mutate()} disabled={setPrimaryMutation.isPending}>
                  <Star className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Parsed Data Preview */}
          {parsed && (
            <motion.div
              className="mt-3 pt-3 border-t space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {parsed.skills?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Award className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {parsed.skills.slice(0, 10).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                    {parsed.skills.length > 10 && (
                      <Badge variant="outline" className="text-xs">+{parsed.skills.length - 10} more</Badge>
                    )}
                  </div>
                </div>
              )}
              {parsed.experience?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {parsed.experience.length} positions · Latest: {parsed.experience[0]?.title} at {parsed.experience[0]?.company}
                  </p>
                </div>
              )}
              {parsed.education?.length > 0 && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {parsed.education[0]?.degree} · {parsed.education[0]?.school}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
