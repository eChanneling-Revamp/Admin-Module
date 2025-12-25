"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plug, CheckCircle2, AlertCircle } from "lucide-react"

const integrations = [
  {
    name: "Asiri Hospital API",
    type: "Hospital API",
    status: "Connected",
    lastSync: "2 mins ago",
    requests: "1,247/day",
    uptime: "99.9%",
  },
  {
    name: "Lanka Hospitals API",
    type: "Hospital API",
    status: "Connected",
    lastSync: "5 mins ago",
    requests: "980/day",
    uptime: "99.8%",
  },
  {
    name: "PayHere Gateway",
    type: "Payment",
    status: "Connected",
    lastSync: "1 min ago",
    requests: "543/day",
    uptime: "100%",
  },
  {
    name: "Dialog SMS Provider",
    type: "SMS",
    status: "Connected",
    lastSync: "3 mins ago",
    requests: "2,340/day",
    uptime: "99.7%",
  },
  {
    name: "SendGrid Email",
    type: "Email",
    status: "Connected",
    lastSync: "Just now",
    requests: "1,890/day",
    uptime: "99.9%",
  },
  {
    name: "Mobitel Payment API",
    type: "Payment",
    status: "Issue",
    lastSync: "2 hrs ago",
    requests: "0/day",
    uptime: "92.3%",
  },
]

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Integrations</h1>
            <p className="text-gray-600 mt-1">Manage third-party connections and API integrations</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plug className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{integrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{integrations.filter(i => i.status === "Connected").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{integrations.filter(i => i.status === "Issue").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">99.1%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      integration.status === "Connected" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      <Plug className={`w-6 h-6 ${
                        integration.status === "Connected" ? "text-green-600" : "text-red-600"
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{integration.name}</h3>
                      <Badge variant="outline" className="mt-1">{integration.type}</Badge>
                    </div>
                  </div>
                  {integration.status === "Connected" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={integration.status === "Connected" ? "default" : "destructive"}>
                    {integration.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium">{integration.lastSync}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">API Requests:</span>
                  <span className="font-medium">{integration.requests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{integration.uptime}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" variant="outline">Configure</Button>
                  <Button className="flex-1">Test Connection</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
