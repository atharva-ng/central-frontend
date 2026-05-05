"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarDays,
  Search,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { APP_ROUTES } from "@/constants/routes"
import { STORAGE_KEYS } from "@/constants/storage-keys"
import { cn } from "@/lib/utils"
import { IndexlyLogo, IndexlyMark } from "@/components/app/IndexlyLogo"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { label: "Schedule", href: APP_ROUTES.dashboard, icon: CalendarDays },
  { label: "Keywords", href: APP_ROUTES.keywords, icon: Search },
  { label: "Articles", href: APP_ROUTES.articles, icon: FileText },
  { label: "Settings", href: APP_ROUTES.settings, icon: Settings },
]

const STORAGE_KEY = STORAGE_KEYS.sidebarCollapsed

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "1") setCollapsed(true)
    setMounted(true)
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
  }

  if (!mounted) {
    return <aside className="w-60 shrink-0 border-r border-border bg-card" />
  }

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-card flex flex-col h-screen transition-[width] duration-200",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-border">
        {collapsed ? (
          <IndexlyMark className="mx-auto" />
        ) : (
          <Link href={APP_ROUTES.dashboard} className="flex items-center gap-2 px-1">
            <IndexlyMark />
            <IndexlyLogo />
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-2 mt-4">
        {NAV.map((item) => {
          const active =
            item.href === APP_ROUTES.dashboard
              ? pathname === APP_ROUTES.dashboard
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto size-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "mx-2 mb-2 h-8 rounded-md flex items-center gap-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors",
          collapsed ? "justify-center" : "px-2.5"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <>
            <ChevronLeft className="size-4" />
            <span>Collapse</span>
          </>
        )}
      </button>

      {/* User */}
      <div
        className={cn(
          "border-t border-border p-3 flex items-center gap-2.5",
          collapsed && "justify-center"
        )}
      >
        <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">Account</span>
            <span className="text-[11px] text-muted-foreground truncate">Manage profile</span>
          </div>
        )}
      </div>
    </aside>
  )
}
