import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert, KeyRound, UserCheck, ShieldCheck, HelpCircle } from "lucide-react";
import { AuthLayout, SubdomainLink } from "@man-u-ai/web-core";

export function AdminRegisterPage() {
  return (
    <AuthLayout
      title="Administrator Provisioning & Enrollment"
      subtitle="Site Administrator accounts cannot be self-registered and require internal authorized provisioning."
      badge="Admin"
      badgeVariant="warning"
      footer={
        <div className="mt-5 pt-4 border-t border-hairline flex flex-col items-center gap-3 text-xs">
          <Link
            to="/login"
            className="text-ink-subtle hover:text-primary transition-colors font-medium text-center"
          >
            Already have administrator credentials? Sign in
          </Link>
          <div className="flex items-center gap-3 text-2xs text-ink-tertiary">
            <SubdomainLink target="manager" to="/register" className="hover:text-ink transition-colors">
              Request plant operations enrollment instead →
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
        {/* Policy Alert */}
        <div className="p-3.5 rounded-xl bg-surface-2 border border-hairline space-y-2 text-xs text-ink-subtle">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">Administrative Zero-Trust Policy</p>
              <p className="text-2xs text-ink-subtle mt-0.5 leading-relaxed">
                Public self-registration is restricted in production environments. Administrator accounts cannot be created via public forms and must be provisioned directly by authorized plant systems staff.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-step Provisioning Guidance */}
        <div className="p-4 rounded-xl bg-surface-1 border border-hairline space-y-3">
          <p className="text-2xs uppercase tracking-wider font-semibold text-ink-subtle">
            How to obtain an administrator account
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-ink-subtle leading-relaxed">
                <strong className="text-ink">Submit an internal access request</strong> to the facility IT / OT Systems Administrator.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-ink-subtle leading-relaxed">
                <strong className="text-ink">Undergo privilege verification</strong> for plant infrastructure security compliance.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-ink-subtle leading-relaxed">
                <strong className="text-ink">Receive your secure credentials</strong> directly from your designated enterprise systems team.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <span>Return to Admin Sign In</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
