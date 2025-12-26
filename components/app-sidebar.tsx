"use client";

import {
  Calendar,
  CalendarBlank,
  FileText,
  House,
  LayoutIcon,
  Receipt,
  Users,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
} from "@/components/ui/sidebar";

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Overview",
        url: "/",
        icon: LayoutIcon,
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
        icon: CalendarBlank,
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
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <House className="size-5" />
          <span className="hidden font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Payments Tracker
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url === "/invoices" &&
                      pathname?.startsWith("/invoices")) ||
                    (item.url === "/contracts" &&
                      pathname?.startsWith("/contracts")) ||
                    (item.url === "/calendar" &&
                      pathname?.startsWith("/calendar"));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={(props) => (
                          <Link href={item.url} {...props}>
                            <item.icon
                              className="size-4 text-muted-foreground group-data-[active=true]:text-primary"
                              weight="fill"
                            />
                            <span className="text-muted-foreground text-sm group-data-[active=true]:text-primary">
                              {item.title}
                            </span>
                          </Link>
                        )}
                        tooltip={item.title}
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
