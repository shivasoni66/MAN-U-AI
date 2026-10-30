import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth, authApi, AuthLayout, SubdomainLink } from "@man-u-ai/web-core";

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
          navigate("/", { replace: true });
          return;
        }

        if (user.role === "admin") {
          setError("This workspace is for Plant Operations Managers. Redirecting to Administration Console...");
          setTimeout(() => {
            window.location.href = "https://admin.sharprad-x.tech";
          }, 1500);
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
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Authentication request timed out. Please check network connectivity and retry.");
      } else {
        setError("Unable to connect to authentication server. Please retry.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Plant Operations & Maintenance Workspace"
      subtitle="Sign in to access industrial SOPs, machine documentation, shift handovers, and real-time maintenance assistant."
      badge="Manager"
      badgeVariant="success"
      footer={
        <div className="mt-5 pt-4 border-t border-hairline flex flex-col items-center gap-3 text-xs">
          <Link
            to="/register"
            className="text-ink-subtle hover:text-primary transition-colors font-medium text-center"
          >
            Need operator or manager access? Review enrollment policy →
          </Link>
          <div className="flex items-center gap-3 text-2xs text-ink-tertiary">
            <SubdomainLink target="admin" to="/login" className="hover:text-ink transition-colors">
              Go to Admin Console →
            </SubdomainLink>
            <span>·</span>
            <a href="https://sharprad-x.tech" className="hover:text-ink transition-colors">
              Portal selection
            </a>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger animate-fade-in">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <div>
          <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
            Work Email Address
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="email"
              required
              placeholder="manager@plant.io"
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
          {isLoading ? "Signing In..." : "Sign In to Operations Workspace"}
          <ArrowRight size={14} />
        </button>
      </form>
    </AuthLayout>
  );
}
