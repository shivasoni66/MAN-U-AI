import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ManagerSidebar } from "./ManagerSidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function ManagerShell() {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full bg-canvas overflow-hidden">
      {/* Desktop Manager Sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 w-60 z-sidebar">
        <ManagerSidebar />
      </aside>

      {/* Mobile Manager Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-72 h-full z-10 animate-slide-right">
            <ManagerSidebar onMobileClose={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0 h-full overflow-hidden">
        <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {/* Mobile Top Header */}
          <div className="flex items-center gap-3 h-12 px-4 border-b border-hairline bg-surface-1 md:hidden flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn-icon"
              aria-label="Open operations navigation"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="3.5" width="12" height="1.5" rx="0.75" />
                <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" />
                <rect x="2" y="11" width="12" height="1.5" rx="0.75" />
              </svg>
            </button>
            <span className="font-semibold text-base tracking-tight text-gradient-primary">
              MAN-U-AI
            </span>
            <span className="text-2xs font-bold uppercase tracking-wider text-success">
              Manager
            </span>
            <div className="ml-auto">
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="btn-icon"
                aria-label="Toggle operations context panel"
              >
                <PanelRightOpen size={15} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>

        {/* Manager Operations Context Panel */}
        <aside
          className={cn(
            "hidden lg:flex flex-col flex-shrink-0 border-l border-hairline bg-surface-1",
            "transition-all duration-250",
            rightPanelOpen ? "w-80" : "w-0 overflow-hidden border-none"
          )}
        >
          <div className="flex items-center justify-between h-12 px-4 border-b border-hairline flex-shrink-0">
            <span className="text-xs font-semibold text-ink-subtle tracking-wider uppercase">
              Operations Context
            </span>
            <button
              onClick={() => setRightPanelOpen(false)}
              className="btn-icon p-1.5"
              aria-label="Close context panel"
            >
              <PanelRightOpen size={13} className="rotate-180" />
            </button>
          </div>
          <RightPanel panel="manager" />
        </aside>

        {!rightPanelOpen && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="hidden lg:flex btn-icon fixed right-4 top-14 z-10"
            aria-label="Open context panel"
          >
            <PanelRightOpen size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
