"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  CreditCard,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Hospital,
  UserCog,
  Briefcase,
  Tags,
  Building,
  BarChart3,
  Shield,
  Plug,
} from "lucide-react"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
}

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

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname.includes(href)
  }

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-700 via-cyan-800 to-teal-900 text-white flex flex-col shadow-xl z-50 transform transition-transform duration-300 h-full md:h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-cyan-600/50">
          <h1 className="text-xl font-bold">eChannelling</h1>
          <p className="text-xs text-cyan-200">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-cyan-600/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-sm">{item.title}</span>
                      </div>
                      {expandedItems.includes(item.title) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {expandedItems.includes(item.title) && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "block px-3 py-2 rounded-md text-sm hover:bg-cyan-600/40",
                                isActive(child.href) &&
                                  "bg-cyan-500/40 font-medium"
                              )}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cyan-600/40 transition",
                      isActive(item.href!) &&
                        "bg-cyan-500/40 font-medium"
                    )}
                  >
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-600/50 text-center text-xs text-cyan-200">
          © 2025 eChannelling
        </div>
      </aside>
    </>
  )
}
