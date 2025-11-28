"use client"

import {
  LayoutDashboard,
  Users,
  FileText,
  Home,
  Calendar,
  CalendarDays,
  Receipt,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Overview",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Clients",
        url: "/clients",
        icon: Users,
      },
    ],
  },
  {
    label: "Events",
    items: [
      {
        title: "Timeline",
        url: "/timeline",
        icon: Calendar,
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Documents",
    items: [
      {
        title: "Invoices",
        url: "/invoices",
        icon: Receipt,
      },
      {
        title: "Contracts",
        url: "/contracts",
        icon: FileText,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Home className="size-5" />
          <span className="font-semibold text-lg hidden group-data-[collapsible=icon]:hidden">Payments Tracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={
                        pathname === item.url || 
                        (item.url === "/invoices" && pathname?.startsWith("/invoices")) ||
                        (item.url === "/contracts" && pathname?.startsWith("/contracts")) ||
                        (item.url === "/calendar" && pathname?.startsWith("/calendar"))
                      }
                    >
                      <Link href={item.url} className="rounded-sm hover:bg-sidebar-accent/10 hover:text-white data-[active=true]:bg-sidebar-accent/10 data-[active=true]:text-white active:bg-sidebar-accent/10 active:text-white">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

