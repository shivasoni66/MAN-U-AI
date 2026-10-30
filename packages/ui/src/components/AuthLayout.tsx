import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "success";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  badge,
  badgeVariant = "primary",
  children,
  footer,
}: AuthLayoutProps) {
  const badgeColors = {
    primary: "bg-primary/15 text-primary border-primary/30 shadow-glow-primary",
    warning: "bg-warning/15 text-warning border-warning/30",
    success: "bg-success/15 text-success border-success/30",
  };

  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface-1 border border-hairline rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3 shadow-glow-primary">
            <Zap className="text-primary w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-gradient-primary">MAN-U-AI</h1>
            {badge && (
              <span
                className={cn(
                  "text-2xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                  badgeColors[badgeVariant]
                )}
              >
                {badge}
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-ink mt-0.5">{title}</h2>
          <p className="text-xs text-ink-subtle mt-1 max-w-xs">{subtitle}</p>
        </div>

        {children}

        {/* Footer */}
        {footer ? (
          footer
        ) : (
          <div className="mt-5 pt-4 border-t border-hairline flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-2xs text-ink-tertiary">
              <ShieldCheck size={12} className="text-success" />
              <span>Role-based access with server-verified permissions</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
