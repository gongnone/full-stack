import {
  IconDashboard,
  IconBrain,
} from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "@tanstack/react-router";

export function NavMain() {
  const nav = useNavigate();

  const items = [
    {
      title: "Dashboard",
      navigate: () =>
        nav({
          to: "/app",
        }),
      icon: IconDashboard,
    },
    {
      title: "War Room",
      navigate: () =>
        nav({
          to: "/app/agent",
        }),
      icon: IconBrain, // Need to import IconBrain
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton onClick={item.navigate} tooltip={item.title}>
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
