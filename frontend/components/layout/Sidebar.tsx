"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Stethoscope,
  CreditCard,
  FileText,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hospital,
  UserCog,
  Briefcase,
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

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
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
    children: [{ title: "All Agents", href: "/dashboard/agents" }],
  },
  {
    title: "Payments",
    icon: <CreditCard className="w-5 h-5" />,
    children: [{ title: "All Transactions", href: "/dashboard/payments" }],
  },
  {
    title: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    children: [{ title: "Financial Reports", href: "/dashboard/reports/financial" }],
  },
  {
    title: "Integrations",
    icon: <Plug className="w-5 h-5" />,
    children: [{ title: "Payment Gateways", href: "/dashboard/integrations/payments" }],
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
    children: [{ title: "General Settings", href: "/dashboard/settings" }],
  },
]

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

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

  const isParentActive = (item: MenuItem) => item.children?.some((child) => isActive(child.href)) ?? false

  const filteredItems = searchQuery
    ? menuItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.children?.some((child) => child.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : menuItems

  return (
    <aside
      className={cn(
        "bg-linear-to-b from-white via-slate-50 to-emerald-50/50 text-slate-800 flex flex-col h-screen fixed left-0 top-0 shadow-xl border-r border-emerald-100 z-50 transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className="p-5 border-b border-emerald-100">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-3")}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-100 overflow-hidden shrink-0">
              <Image src="/Logo.png" alt="eChannelling Logo" width={40} height={40} className="object-contain" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold bg-linear-to-r from-emerald-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                  eChannelling
                </h1>
                <p className="text-[10px] text-emerald-600/70 font-medium tracking-wider uppercase">Admin Portal</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-xl border border-emerald-200 bg-white flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-3 w-full rounded-xl border border-emerald-200 bg-white py-2 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        className={cn(
          "flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent",
          isCollapsed ? "px-2" : "px-3"
        )}
      >
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCollapsed) {
                        onToggleCollapse()
                        return
                      }
                      toggleExpand(item.title)
                    }}
                    className={cn(
                      "w-full flex items-center rounded-xl transition-all duration-200 group",
                      isCollapsed ? "justify-center px-3 py-3" : "justify-between px-4 py-3",
                      expandedItems.includes(item.title) || isParentActive(item)
                        ? "bg-emerald-100/80 text-emerald-800"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    )}
                    aria-label={item.title}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          expandedItems.includes(item.title) || isParentActive(item)
                            ? "bg-linear-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                        )}
                      >
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-medium text-sm">{item.title}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200 text-slate-400",
                          expandedItems.includes(item.title) ? "rotate-180 text-emerald-600" : ""
                        )}
                      />
                    )}
                  </button>

                  {!isCollapsed && (
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
                                  ? "bg-linear-to-r from-emerald-100 to-blue-100 text-emerald-700 font-medium border-l-2 border-emerald-500 -ml-[17px] pl-[30px]"
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
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-200 group",
                    isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                    isActive(item.href!)
                      ? "bg-linear-to-r from-emerald-100 to-blue-100 text-emerald-800"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  )}
                  aria-label={item.title}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive(item.href!)
                        ? "bg-linear-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                    )}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-linear-to-r from-emerald-500 to-blue-600 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-emerald-100 bg-linear-to-r from-emerald-50/50 to-blue-50/50">
        {isCollapsed ? (
          <div className="w-full flex items-center justify-center text-xs text-emerald-600 font-medium">v2.0</div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>&copy; 2025 eChannelling</span>
            <span className="text-emerald-600 font-medium">v2.0</span>
          </div>
        )}
      </div>
    </aside>
  )
}
