"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  Stethoscope,
  CreditCard,
  Wallet,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Hospital,
  UserCog,
  Briefcase,
  Tags,
  DollarSign,
  RotateCcw,
  Building,
  BarChart3,
  Shield,
  Plug,
  Award,
  Calendar,
} from "lucide-react"

interface MenuItem {
  title: string
  icon: React.ReactNode
  href?: string
  children?: { title: string; href: string }[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
  },
  {
    title: "User Management",
    icon: <UserCog className="w-5 h-5" />,
    children: [
      { title: "All Users", href: "/dashboard/users" },
      { title: "Roles & Privileges", href: "/dashboard/roles" },
      { title: "Activity Logs", href: "/dashboard/user-activity" },
    ],
  },
  {
    title: "Hospital Management",
    icon: <Hospital className="w-5 h-5" />,
    children: [
      { title: "All Hospitals", href: "/dashboard/hospitals" },
      { title: "Hospital Groups", href: "/dashboard/hospital-groups" },
      { title: "Facilities", href: "/dashboard/facilities" },
    ],
  },
  {
    title: "Doctor Management",
    icon: <Stethoscope className="w-5 h-5" />,
    children: [
      { title: "All Doctors", href: "/dashboard/doctors" },
      { title: "Specializations", href: "/dashboard/specializations" },
      { title: "Doctor Schedules", href: "/dashboard/doctor-schedules" },
      { title: "Hospital Assignments", href: "/dashboard/doctor-hospitals" },
    ],
  },
  {
    title: "Agent Management",
    icon: <Briefcase className="w-5 h-5" />,
    children: [
      { title: "All Agents", href: "/dashboard/agents" },
      { title: "Corporate Agents", href: "/dashboard/agents/corporate" },
      { title: "Telco Agents", href: "/dashboard/agents/telco" },
      { title: "Individual Agents", href: "/dashboard/agents/individual" },
      { title: "Commission Settings", href: "/dashboard/commissions" },
    ],
  },
  {
    title: "Branch Management",
    icon: <Building2 className="w-5 h-5" />,
    children: [
      { title: "All Branches", href: "/dashboard/branches" },
      { title: "Sub-Units", href: "/dashboard/sub-units" },
      { title: "Branch Performance", href: "/dashboard/branch-performance" },
    ],
  },
  {
    title: "Fee & Discounts",
    icon: <Tags className="w-5 h-5" />,
    children: [
      { title: "Hospital Fees", href: "/dashboard/hospital-fees" },
      { title: "Platform Fees", href: "/dashboard/platform-fees" },
      { title: "Discount Codes", href: "/dashboard/discounts" },
      { title: "Bulk Fee Updates", href: "/dashboard/bulk-fees" },
    ],
  },
  {
    title: "Corporate Accounts",
    icon: <Building className="w-5 h-5" />,
    children: [
      { title: "All Accounts", href: "/dashboard/corporate-accounts" },
      { title: "Employees", href: "/dashboard/corporate-employees" },
      { title: "Dependents", href: "/dashboard/dependents" },
      { title: "Credit Management", href: "/dashboard/credit-management" },
    ],
  },
  {
    title: "Payments",
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { title: "All Transactions", href: "/dashboard/payments" },
      { title: "Reconciliation", href: "/dashboard/reconciliation" },
      { title: "Failed Payments", href: "/dashboard/failed-payments" },
      { title: "Refunds", href: "/dashboard/refunds" },
    ],
  },
  {
    title: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { title: "Financial Reports", href: "/dashboard/reports/financial" },
      { title: "Registration Reports", href: "/dashboard/reports/registration" },
      { title: "Doctor Performance", href: "/dashboard/reports/doctors" },
      { title: "Hospital Analytics", href: "/dashboard/reports/hospitals" },
      { title: "Agent Performance", href: "/dashboard/reports/agents" },
      { title: "Custom Reports", href: "/dashboard/reports/custom" },
    ],
  },
  {
    title: "Integrations",
    icon: <Plug className="w-5 h-5" />,
    children: [
      { title: "Hospital APIs", href: "/dashboard/integrations/hospitals" },
      { title: "Payment Gateways", href: "/dashboard/integrations/payments" },
      { title: "SMS Providers", href: "/dashboard/integrations/sms" },
      { title: "Email Services", href: "/dashboard/integrations/email" },
      { title: "API Keys", href: "/dashboard/integrations/api-keys" },
    ],
  },
  {
    title: "Audit Logs",
    icon: <Shield className="w-5 h-5" />,
    children: [
      { title: "All Activities", href: "/dashboard/audit-logs" },
      { title: "Financial Actions", href: "/dashboard/audit-logs/financial" },
      { title: "Data Changes", href: "/dashboard/audit-logs/changes" },
      { title: "Security Events", href: "/dashboard/audit-logs/security" },
    ],
  },
  {
    title: "Invoices",
    icon: <FileText className="w-5 h-5" />,
    href: "/dashboard/invoices",
  },
  {
    title: "Settings",
    icon: <Settings className="w-5 h-5" />,
    children: [
      { title: "General Settings", href: "/dashboard/settings" },
      { title: "Email Templates", href: "/dashboard/settings/email-templates" },
      { title: "SMS Templates", href: "/dashboard/settings/sms-templates" },
      { title: "System Configuration", href: "/dashboard/settings/system" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Corporate"])

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.includes(href)
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-700 via-cyan-800 to-teal-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-600/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-teal-600 bg-clip-text text-transparent">e</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">eChannelling</h1>
            <p className="text-xs text-cyan-200">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-600/50 hover:to-teal-600/50",
                      expandedItems.includes(item.title) && "bg-gradient-to-r from-cyan-600/40 to-teal-600/40",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">{item.icon}</div>
                      <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {expandedItems.includes(item.title) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  {expandedItems.includes(item.title) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-600/50 hover:to-teal-600/50 text-sm whitespace-nowrap overflow-hidden text-ellipsis",
                              isActive(child.href) && "bg-gradient-to-r from-cyan-500/40 to-teal-500/40 font-medium border-l-2 border-cyan-300",
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-600/50 hover:to-teal-600/50",
                    isActive(item.href!) && "bg-gradient-to-r from-cyan-500/40 to-teal-500/40 font-medium border-l-2 border-cyan-300",
                  )}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cyan-600/50 bg-gradient-to-r from-cyan-900/30 to-teal-900/30">
        <p className="text-xs text-cyan-200 text-center font-medium">© 2025 eChannelling</p>
        <p className="text-xs text-teal-300 text-center mt-1">Powered by SLT</p>
      </div>
    </aside>
  )
}
