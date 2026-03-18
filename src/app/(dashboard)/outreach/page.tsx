/**
 * Outreach Management Page
 * Author: Ahmed Adel Bakr Alderai
 */

"use client"

import { useState, useMemo } from "react"
import {
  useOutreachStats,
  useOutreachMessages,
  useSendMessage,
  useOutreachTemplates,
  useResendMessage,
  useContacts,
} from "@/hooks"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { MoreHorizontal, Plus, Send, Loader2, Inbox } from "lucide-react"
import type { OutreachMessage } from "@/types/api"

interface ComposeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ComposeDialog({ open, onOpenChange }: ComposeFormProps) {
  const { data: contacts } = useContacts({ per_page: 100 })
  const { data: templates } = useOutreachTemplates()
  const sendMessage = useSendMessage()

  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [saveDraft, setSaveDraft] = useState(false)

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates?.find((t) => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
    }
  }

  const handleSubmit = () => {
    if (!selectedContact || !subject || !body) {
      alert("Please fill in all required fields")
      return
    }

    sendMessage.mutate(
      {
        contact_id: selectedContact,
        message_type: "initial",
        subject,
        body,
        save_as_draft: saveDraft,
      },
      {
        onSuccess: () => {
          setSelectedContact(null)
          setSelectedTemplate("")
          setSubject("")
          setBody("")
          setSaveDraft(false)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            Send a new outreach message to a contact
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Select Contact */}
          <div>
            <label className="text-sm font-medium mb-2 block">Contact</label>
            <Select value={selectedContact || ""} onValueChange={setSelectedContact}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts?.contacts?.map((contact) => (
                  <SelectItem key={contact.linkedin_id} value={contact.linkedin_id}>
                    {contact.first_name} {contact.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Template */}
          <div>
            <label className="text-sm font-medium mb-2 block">Template (Optional)</label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              placeholder="Message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-32"
            />
          </div>

          {/* Save as Draft Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="save-draft"
              checked={saveDraft}
              onCheckedChange={(checked) => setSaveDraft(!!checked)}
            />
            <label htmlFor="save-draft" className="text-sm font-medium">
              Save as draft instead of sending
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {saveDraft ? "Save Draft" : "Send"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface OutreachMessageRowProps {
  message: OutreachMessage
}

function OutreachMessageRow({ message }: OutreachMessageRowProps) {
  const resendMessage = useResendMessage()

  const handleResend = () => {
    if (message.status === "draft") {
      alert("Cannot resend a draft message")
      return
    }
    resendMessage.mutate(message.message_id)
  }

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition">
      <td className="px-6 py-4">
        <Checkbox aria-label="Select message" />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium">{message.contact_id}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">{message.subject}</div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={message.status} />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-muted-foreground">
          {message.sent_at
            ? new Date(message.sent_at).toLocaleDateString()
            : "Not sent"}
        </div>
      </td>
      <td className="px-6 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleResend}>
              Resend
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// Mock data for charts
const chartData = [
  { date: "Mar 1", openRate: 12, replyRate: 4 },
  { date: "Mar 2", openRate: 19, replyRate: 5 },
  { date: "Mar 3", openRate: 15, replyRate: 3 },
  { date: "Mar 4", openRate: 25, replyRate: 8 },
  { date: "Mar 5", openRate: 22, replyRate: 7 },
  { date: "Mar 6", openRate: 30, replyRate: 10 },
  { date: "Mar 7", openRate: 28, replyRate: 9 },
]

const messageTypeData = [
  { type: "Initial", count: 45, openRate: 25 },
  { type: "Follow-up 1", count: 32, openRate: 35 },
  { type: "Follow-up 2", count: 18, openRate: 40 },
  { type: "Thank you", count: 12, openRate: 50 },
]

export default function OutreachPage() {
  const [composeOpen, setComposeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("queue")
  const { data: stats, isLoading: statsLoading } = useOutreachStats()
  const { data: messages, isLoading: messagesLoading } = useOutreachMessages({
    status: activeTab === "queue" ? "draft" : activeTab === "sent" ? "sent" : undefined,
  })

  // Filter messages by status
  const filteredMessages = useMemo(() => {
    if (!messages?.messages) return []

    if (activeTab === "queue") {
      return messages.messages.filter((m) => m.status === "draft")
    } else if (activeTab === "sent") {
      return messages.messages.filter((m) => ["sent", "delivered"].includes(m.status))
    } else if (activeTab === "replied") {
      return messages.messages.filter((m) => m.status === "replied")
    }
    return messages.messages
  }, [messages?.messages, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground">
            Manage your recruiter outreach and messaging campaigns
          </p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </DialogTrigger>
          <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
        </Dialog>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-20 mb-2"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Sent
              </p>
              <p className="text-3xl font-bold">{stats?.total_sent || 0}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Opened
              </p>
              <p className="text-3xl font-bold">{stats?.total_opened || 0}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Open Rate
              </p>
              <p className="text-3xl font-bold">
                {stats?.open_rate.toFixed(1) || 0}%
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Reply Rate
              </p>
              <p className="text-3xl font-bold">
                {stats?.reply_rate.toFixed(1) || 0}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger
              value="queue"
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Queue
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Sent
            </TabsTrigger>
            <TabsTrigger
              value="replied"
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Replied
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="p-0">
            {messagesLoading ? (
              <TableSkeleton rows={5} />
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-background/50 px-4 py-12 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    No {activeTab} messages
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any messages in the {activeTab} tab yet.
                  </p>
                </div>
                {activeTab === "queue" && (
                  <Button
                    onClick={() => setComposeOpen(true)}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Compose Message
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left">
                        <Checkbox aria-label="Select all" />
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((message) => (
                      <OutreachMessageRow
                        key={message.message_id}
                        message={message}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Open Rate Trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Open Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="openRate"
                stroke="#2563eb"
                name="Open Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Reply Rate by Message Type */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Open Rate by Message Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={messageTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="openRate"
                fill="#10b981"
                name="Open Rate %"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
