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

const menuItems = [
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
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Home className="size-5" />
          <span className="font-semibold text-lg">Payments Tracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

