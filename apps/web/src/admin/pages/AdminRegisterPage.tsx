import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert, KeyRound, UserCheck, ShieldCheck, HelpCircle } from "lucide-react";
import { AuthLayout } from "@/shared/auth/AuthLayout";

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
            to="/admin/login"
            className="text-ink-subtle hover:text-primary transition-colors font-medium text-center"
          >
            Already have administrator credentials? Sign in
          </Link>
          <div className="flex items-center gap-3 text-2xs text-ink-tertiary">
            <Link to="/manager/register" className="hover:text-ink transition-colors">
              Request plant operations enrollment instead →
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

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 text-2xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-ink">Contact Authorized Plant IT</p>
                <p className="text-2xs text-ink-subtle">
                  Reach out to your Plant Systems Administrator or IT Security Officer with your corporate credentials and authorized security clearance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 text-2xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-ink">Internal System Provisioning</p>
                <p className="text-2xs text-ink-subtle">
                  An active Plant Administrator will provision your account directly in the Personnel & Role Management registry with the required administrator privileges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 text-2xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-ink">Secure Console Sign-In</p>
                <p className="text-2xs text-ink-subtle">
                  Once provisioned, sign in to the Plant Administration Console using your verified enterprise email and assigned password.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            to="/admin/login"
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <KeyRound size={14} />
            <span>Sign in to Administrator Console</span>
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
          <span>Compliant with Industrial ISO/IEC 27001 Access Control Standards</span>
        </div>
      </div>
    </AuthLayout>
  );
}
