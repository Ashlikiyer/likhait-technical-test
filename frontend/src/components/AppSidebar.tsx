import { Calendar } from "lucide-react";
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
} from "./ui/sidebar";

interface AppSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function AppSidebar({ currentPage = "history", onNavigate }: AppSidebarProps) {
  const menuItems = [
    {
      title: "History",
      icon: Calendar,
      page: "history",
    },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">$</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-semibold text-foreground">Expense Tracker</span>
            <span className="text-xs text-muted-foreground">Track your spending</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    onClick={() => onNavigate?.(item.page)}
                    isActive={currentPage === item.page}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}