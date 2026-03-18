/**
 * Agent Configuration Modal - Dialog for configuring agent settings
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState, useEffect } from "react"
import { Agent } from "@/types/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateAgentConfig } from "@/hooks/use-agents"
import { toast } from "sonner"

interface AgentConfigModalProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onSave?: (agent: Agent) => void
}

export function AgentConfigModal({
  agent,
  isOpen,
  onClose,
  onSave,
}: AgentConfigModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isSaving, setIsSaving] = useState(false)

  const updateConfig = useUpdateAgentConfig(agent?.name || "")

  useEffect(() => {
    if (agent) {
      setFormData({
        poll_interval: agent.poll_interval,
        enabled: agent.status !== "stopped",
        ...agent.config,
      })
    }
  }, [agent])

  const handleInputChange = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    if (!agent) return

    setIsSaving(true)
    try {
      await updateConfig.mutateAsync(formData)
      toast.success("Agent configuration updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update agent configuration")
    } finally {
      setIsSaving(false)
    }
  }

  if (!agent) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {agent.display_name}</DialogTitle>
          <DialogDescription>
            Update configuration settings for this agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Poll Interval */}
          <div className="space-y-2">
            <Label htmlFor="poll_interval">
              Poll Interval (seconds)
            </Label>
            <Input
              id="poll_interval"
              type="number"
              min="60"
              max="3600"
              value={formData.poll_interval || agent.poll_interval}
              onChange={(e) =>
                handleInputChange("poll_interval", parseInt(e.target.value))
              }
              placeholder="Poll interval in seconds"
            />
            <p className="text-xs text-muted-foreground">
              How often the agent checks for work (in seconds)
            </p>
          </div>

          {/* Custom Config Fields */}
          {agent.config &&
            Object.entries(agent.config).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {key
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </Label>
                {typeof value === "boolean" ? (
                  <input
                    id={key}
                    type="checkbox"
                    checked={
                      (formData[key] as boolean) ||
                      (value as boolean)
                    }
                    onChange={(e) => handleInputChange(key, e.target.checked)}
                    className="rounded border border-input bg-background"
                  />
                ) : typeof value === "number" ? (
                  <Input
                    id={key}
                    type="number"
                    value={(formData[key] as number) || (value as number)}
                    onChange={(e) =>
                      handleInputChange(key, parseFloat(e.target.value))
                    }
                    placeholder={String(value)}
                  />
                ) : (
                  <Input
                    id={key}
                    type="text"
                    value={(formData[key] as string) || (value as string)}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={String(value)}
                  />
                )}
              </div>
            ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
