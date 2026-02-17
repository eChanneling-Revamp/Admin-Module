"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
  Search,
  X,
} from "lucide-react"

interface MenuItem {
  title: string
  icon: React.ReactNode
  href?: string
  badge?: string
  children?: { title: string; href: string; badge?: string }[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
    badge: "New",
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
    badge: "3",
    children: [
      { title: "All Transactions", href: "/dashboard/payments" },
      { title: "Reconciliation", href: "/dashboard/reconciliation" },
      { title: "Failed Payments", href: "/dashboard/failed-payments", badge: "3" },
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
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Auto-expand active menu on mount
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => pathname.includes(child.href))) {
        setExpandedItems((prev) => (prev.includes(item.title) ? prev : [...prev, item.title]))
      }
    })
  }, [pathname])

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname.includes(href)
  }

  const filteredItems = searchQuery
    ? menuItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.children?.some((child) => child.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : menuItems

  return (
    <aside className="w-72 bg-gradient-to-b from-white via-slate-50 to-emerald-50/50 text-slate-800 flex flex-col h-screen fixed left-0 top-0 shadow-xl border-r border-emerald-100 z-50">
      {/* Logo Section */}
      <div className="p-5 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-100 overflow-hidden">
            <Image 
              src="/Logo.png" 
              alt="eChannelling Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
              eChannelling
            </h1>
            <p className="text-[10px] text-emerald-600/70 font-medium tracking-wider uppercase">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                      expandedItems.includes(item.title)
                        ? "bg-emerald-100/80 text-emerald-800"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          expandedItems.includes(item.title)
                            ? "bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                        )}
                      >
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 text-slate-400",
                        expandedItems.includes(item.title) ? "rotate-180 text-emerald-600" : ""
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      expandedItems.includes(item.title) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="mt-1 ml-4 pl-4 border-l-2 border-emerald-200 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                              isActive(child.href)
                                ? "bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 font-medium border-l-2 border-emerald-500 -ml-[17px] pl-[30px]"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            )}
                          >
                            {child.title}
                            {child.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive(item.href!)
                      ? "bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive(item.href!)
                        ? "bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-blue-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>© 2025 eChannelling</span>
          <span className="text-emerald-600 font-medium">v2.0</span>
        </div>
      </div>
    </aside>
  )
}
