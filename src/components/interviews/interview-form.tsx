"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useScheduleInterview, useUpdateInterview } from "@/hooks/use-interviews"
import type { Interview } from "@/types/api"

const interviewFormSchema = z.object({
  type: z.enum(["phone", "video", "onsite", "technical", "behavioral", "final"]),
  scheduled_at: z.string().min(1, "Date and time are required"),
  duration_minutes: z.coerce.number().min(15, "Duration must be at least 15 minutes").optional() as z.ZodOptional<z.ZodNumber>,
  location: z.string().optional(),
  meeting_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  interviewer_names: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type InterviewFormValues = z.infer<typeof interviewFormSchema>

export interface InterviewFormProps {
  interview?: Interview
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function InterviewForm({ interview, onSuccess, trigger }: InterviewFormProps) {
  const [open, setOpen] = useState(false)
  const [interviewerInput, setInterviewerInput] = useState("")
  const scheduleInterviewMutation = useScheduleInterview()
  const updateInterviewMutation = useUpdateInterview()

  const isEditing = !!interview
  const isLoading = isEditing
    ? updateInterviewMutation.isPending
    : scheduleInterviewMutation.isPending

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: interview
      ? {
          type: interview.type,
          scheduled_at: interview.scheduled_at,
          duration_minutes: interview.duration_minutes,
          location: interview.location,
          meeting_url: interview.meeting_url,
          interviewer_names: interview.interviewer_names,
          notes: interview.notes,
        }
      : {
          duration_minutes: 60,
          type: "phone",
          interviewer_names: [],
        },
  })

  function onSubmit(data: InterviewFormValues) {
    if (isEditing) {
      updateInterviewMutation.mutate(
        {
          interviewId: interview!.interview_id,
          data,
        },
        {
          onSuccess: () => {
            setOpen(false)
            form.reset()
            onSuccess?.()
          },
        }
      )
    } else {
      scheduleInterviewMutation.mutate(data, {
        onSuccess: () => {
          setOpen(false)
          form.reset()
          onSuccess?.()
        },
      })
    }
  }

  const handleAddInterviewer = () => {
    if (interviewerInput.trim()) {
      const current = form.getValues("interviewer_names") || []
      form.setValue("interviewer_names", [...current, interviewerInput])
      setInterviewerInput("")
    }
  }

  const handleRemoveInterviewer = (index: number) => {
    const current = form.getValues("interviewer_names") || []
    form.setValue(
      "interviewer_names",
      current.filter((_, i) => i !== index)
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Interview" : "Schedule Interview"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the interview details"
              : "Add a new interview to your calendar"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Interview Type and Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phone">Phone Screening</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="final">Final Round</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="15" {...field} />
                    </FormControl>
                    <FormDescription>Estimated interview duration</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time */}
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => {
                const date = field.value ? new Date(field.value) : undefined
                return (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP HH:mm") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-4 space-y-4">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                const time = date ? format(date, "HH:mm") : "09:00"
                                const [hours, minutes] = time.split(":").map(Number)
                                const newDate = new Date(selectedDate)
                                newDate.setHours(hours, minutes)
                                field.onChange(newDate.toISOString())
                              }
                            }}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="time"
                              defaultValue={date ? format(date, "HH:mm") : "09:00"}
                              onChange={(e) => {
                                if (date) {
                                  const [hours, minutes] = e.target.value
                                    .split(":")
                                    .map(Number)
                                  const newDate = new Date(date)
                                  newDate.setHours(hours, minutes)
                                  field.onChange(newDate.toISOString())
                                }
                              }}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            {/* Location and Meeting URL Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Conference Room A" {...field} />
                    </FormControl>
                    <FormDescription>Physical location or office address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meeting_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://zoom.us/j/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Zoom, Teams, or other meeting link</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interviewers */}
            <div>
              <FormLabel>Interviewers (Optional)</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add interviewer name..."
                  value={interviewerInput}
                  onChange={(e) => setInterviewerInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddInterviewer()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddInterviewer}
                >
                  Add
                </Button>
              </div>

              {(form.watch("interviewer_names")?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.watch("interviewer_names")?.map((name, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterviewer(index)}
                        className="text-xs font-bold hover:text-destructive"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the interview..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update Interview" : "Schedule Interview"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
