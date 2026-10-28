import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, AlertCircle, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { AuthLayout } from "@/shared/auth/AuthLayout";

export function ManagerLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.login(email, password);
      if (res.data?.success && res.data.data) {
        const { token, user } = res.data.data;
        login(token, user);

        if (user.role === "manager") {
          navigate("/manager", { replace: true });
          return;
        }

        if (user.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }

        if (user.role === "engineer") {
          navigate("/engineer-mobile-required", { replace: true });
          return;
        }

        setError("Access restricted. This account does not have a supported web-panel role.");
        navigate("/unsupported-access", { replace: true });
        return;
      }
      throw new Error(res.data?.error?.message || "Authentication failed");
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(
          "Authentication request timed out after 30 seconds. The backend service may be cold starting or database connection is unreachable. Please retry in a moment."
        );
      } else {
        setError(err.message || "Authentication failed. Please verify credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Plant Operations Workspace"
      subtitle="Operational management, equipment maintenance, technical manuals, and AI troubleshooting"
      badge="Manager"
      badgeVariant="success"
      footer={
        <div className="mt-5 pt-4 border-t border-hairline flex flex-col items-center gap-3 text-xs">
          <Link
            to="/manager/register"
            className="text-ink-subtle hover:text-primary transition-colors font-medium text-center"
          >
            Need plant-level access? Request enrollment
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-ink-tertiary hover:text-ink transition-colors text-2xs"
          >
            <ArrowLeftRight size={11} />
            <span>Switch to Plant Administration Console</span>
          </Link>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-center gap-2 text-xs text-danger">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
            Work Email
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="email"
              required
              placeholder="manager@plant-line.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-9"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
            Password
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
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          {isLoading ? "Authenticating with Backend..." : "Sign In to Operations Workspace"}
          <ArrowRight size={14} />
        </button>
      </form>
    </AuthLayout>
  );
}
