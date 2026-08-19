import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const [currentPage, setCurrentPage] = useState("history");

  return (
    <SidebarProvider>
      <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <SidebarInset className="relative min-h-svh overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900/50" />
        <header className="relative z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md shadow-sm">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="relative z-10 min-w-0 flex-1 overflow-auto">
          {currentPage === "history" && <HistoryPage />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;