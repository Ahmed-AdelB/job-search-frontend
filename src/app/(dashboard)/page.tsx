/**
 * Dashboard Home Page
 * Author: Ahmed Adel Bakr Alderai
 */

import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to JobFlow. Here's what's happening with your job search.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active Jobs
            </p>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Applications
            </p>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Interviews
            </p>
            <p className="text-3xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Success Rate
            </p>
            <p className="text-3xl font-bold">45%</p>
            <p className="text-xs text-muted-foreground">
              Industry avg: 38%
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-muted-foreground text-sm">
          Your recent activity will appear here.
        </p>
      </Card>
    </div>
  )
}
