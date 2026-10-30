import { Link } from "react-router-dom";
import { ArrowRight, Info, Cpu, ShieldCheck } from "lucide-react";
import { AuthLayout, SubdomainLink } from "@man-u-ai/web-core";

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
            to="/login"
            className="text-ink-subtle hover:text-primary transition-colors font-medium text-center"
          >
            Already have workspace credentials? Sign in
          </Link>
          <div className="flex items-center gap-3 text-2xs text-ink-tertiary">
            <SubdomainLink target="admin" to="/register" className="hover:text-ink transition-colors">
              Need site administrator clearance? →
            </SubdomainLink>
            <span>·</span>
            <a href="https://sharprad-x.tech" className="hover:text-ink transition-colors">
              Portal selection
            </a>
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

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-ink-subtle leading-relaxed">
                <strong className="text-ink">Request Operations Account</strong> via your plant site supervisor or line manager.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-ink-subtle leading-relaxed">
                <strong className="text-ink">System Administrator Provisions Role</strong> in the Personnel & Access Control console.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-ink-subtle leading-relaxed">
                <strong className="text-ink">Sign In Instantly</strong> with your enterprise email and assigned temporary password.
              </p>
            </div>
          </div>
        </div>

        {/* Roles overview */}
        <div className="grid grid-cols-2 gap-2 text-2xs pt-1">
          <div className="p-2.5 rounded-lg bg-surface-2/60 border border-hairline">
            <div className="flex items-center gap-1.5 text-ink font-semibold mb-1">
              <Cpu size={12} className="text-emerald-400" />
              <span>Manager / Operator</span>
            </div>
            <p className="text-ink-tertiary">Access web dashboard, machine telemetry, shift summaries, and SOP library.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-2/60 border border-hairline">
            <div className="flex items-center gap-1.5 text-ink font-semibold mb-1">
              <ShieldCheck size={12} className="text-primary" />
              <span>Plant Field Engineer</span>
            </div>
            <p className="text-ink-tertiary">Requires MAN-U-AI Flutter mobile application with camera & voice consultation.</p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <span>Return to Workspace Sign In</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
