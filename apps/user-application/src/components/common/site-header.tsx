import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
// import { trpc } from "@/router";
// import { useQuery } from "@tanstack/react-query";

export function SiteHeader() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const getPageTitle = (path: string) => {
    if (path === "/app") return "Dashboard";
    if (path === "/app/links") return "Links";
    if (path === "/app/create") return "Create Link";
    if (path.startsWith("/app/link/")) {
      return `Link`;
    }
    // Add more path mappings as needed
    return "Dashboard";
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle(pathname)}</h1>
        <div className="ml-auto flex items-center gap-2">
          <CreditBalance />
        </div>
      </div>
    </header>
  );
}

function CreditBalance() {
  // FIXME: Crash due to trpc
  // const { data: credits } = useQuery(trpc.generations.getCredits.queryOptions());
  const credits = { balance: 100 };
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm font-medium">
      <span>🪙</span>
      <span>{credits?.balance ?? 0} Credits</span>
    </div>
  );
}
