"use client"

import { Gear } from "@phosphor-icons/react"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={(props) => (
            <Link href="/settings" {...props}>
              <Avatar className="size-6">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
              </div>
              <Gear weight="bold" className="ml-auto size-4" />
            </Link>
          )}
          tooltip={{
            children: "Settings",
            side: "right",
            align: "center",
            sideOffset: 4,
            className: "rounded-lg",
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
