import { Link } from "react-router-dom";
import { ArrowRight, Info, Cpu, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/shared/auth/AuthLayout";

export function ManagerRegisterPage() {
  return (
    <AuthLayout
      title="Plant Operations Enrollment Request"
      subtitle="Request enrollment to access machine documentation, shift summaries, and troubleshooting tools."
      badge="Manager"
      badgeVariant="success"
      footer={
        <div className="mt-5 pt-4 border-t border-hairline flex flex-col items-center gap-3 text-xs">
          <Link
            to="/manager/login"
            className="text-ink-subtle hover:text-primary transition-colors font-medium text-center"
          >
            Already have workspace credentials? Sign in
          </Link>
          <div className="flex items-center gap-3 text-2xs text-ink-tertiary">
            <Link to="/admin/register" className="hover:text-ink transition-colors">
              Need site administrator clearance? →
            </Link>
            <span>·</span>
            <Link to="/" className="hover:text-ink transition-colors">
              Portal selection
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Notice Alert */}
        <div className="p-3.5 rounded-xl bg-surface-2 border border-hairline space-y-2 text-xs text-ink-subtle">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">Plant Operations Enrollment Policy</p>
              <p className="text-2xs text-ink-subtle mt-0.5 leading-relaxed">
                Public self-registration is restricted in production environments. Manager and Operator workstations require authorized administrative account provisioning.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-step Enrollment Guidance */}
        <div className="p-4 rounded-xl bg-surface-1 border border-hairline space-y-3">
          <p className="text-2xs uppercase tracking-wider font-semibold text-ink-subtle">
            Onboarding procedure for operations personnel
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 text-2xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-ink">Submit Enrollment to Shift Lead</p>
                <p className="text-2xs text-ink-subtle">
                  Request workspace access through your plant shift supervisor or site administrator, providing your employee identification and assigned operating line.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 text-2xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-ink">Administrative Provisioning</p>
                <p className="text-2xs text-ink-subtle">
                  A Plant Administrator will provision your account in the Personnel Management registry with verified Manager / Operator operational rights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 text-2xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-ink">Access Operations Workspace</p>
                <p className="text-2xs text-ink-subtle">
                  Sign in with your authorized work email and initial password to begin monitoring machinery health, viewing SOP manuals, and generating shift reports.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            to="/manager/login"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <Cpu size={14} />
            <span>Sign in to Operations Workspace</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/"
            className="btn-secondary w-full py-2 flex items-center justify-center gap-2 text-xs"
          >
            <span>Return to Workspace Selection</span>
          </Link>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-3xs text-ink-tertiary pt-2">
          <ShieldCheck size={12} className="text-success" />
          <span>Operational Security Verified · Plant Operator Isolation Active</span>
        </div>
      </div>
    </AuthLayout>
  );
}
