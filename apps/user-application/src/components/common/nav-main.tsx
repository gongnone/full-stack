import {
  IconDashboard,
  IconBrain,
  IconFolder,
} from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export function NavMain() {
  const nav = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const items = [
    {
      title: "Dashboard",
      path: "/app",
      navigate: () => nav({ to: "/app" }),
      icon: IconDashboard,
    },
    {
      title: "Campaigns",
      path: "/app/projects",
      navigate: () => nav({ to: "/app/projects" }),
      icon: IconFolder,
    },
    {
      title: "War Room",
      path: "/app/agent",
      navigate: () => nav({ to: "/app/agent" }),
      icon: IconBrain,
    },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === "/app") {
      return pathname === "/app" || pathname === "/app/";
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={item.navigate}
                tooltip={item.title}
                isActive={isActive(item.path)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
