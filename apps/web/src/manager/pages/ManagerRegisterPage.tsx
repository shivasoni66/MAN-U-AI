import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { AuthLayout } from "@/shared/auth/AuthLayout";

export function ManagerRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // The API assigns the restricted viewer role. Manager, Admin, and Engineer
      // roles must be provisioned or promoted by a Plant Administrator.
      const res = await authApi.register({ name, email, password });
      if (res.data?.success && res.data.data) {
        login(res.data.data.token, res.data.data.user);
        navigate("/", { replace: true });
        return;
      }
      throw new Error(res.data?.error?.message || "Registration failed");
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(
          "Registration request timed out after 30 seconds. The backend service may be cold starting. Please retry in a moment."
        );
      } else {
        setError(err.message || "Registration failed. Please check inputs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <Link
            to="/admin/login"
            className="text-ink-tertiary hover:text-ink transition-colors text-2xs"
          >
            Switch to Plant Administration Console →
          </Link>
        </div>
      }
    >
      <div className="mb-4 p-3 rounded-lg bg-surface-2 border border-hairline space-y-2 text-2xs text-ink-subtle">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-ink">Enrollment Notice:</span> Public self-registration is restricted in production environments. Accounts must be provisioned by an administrator.
          </p>
        </div>
        <p className="border-t border-hairline pt-1.5 text-ink-tertiary">
          Self-registration enrolls with restricted sandbox access. Plant Manager, Engineer, and Admin roles must be provisioned or promoted by a Plant Administrator.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2 text-xs text-danger">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
            Full Name & Title
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              required
              placeholder="e.g. Marcus Vance, Shift Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
            Work Email
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="email"
              required
              placeholder="marcus.v@plant.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
            Password (min 8 characters)
          </label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          {isLoading ? "Authenticating with Backend..." : "Request Workspace Enrollment"}
          <ArrowRight size={14} />
        </button>
      </form>
    </AuthLayout>
  );
}
