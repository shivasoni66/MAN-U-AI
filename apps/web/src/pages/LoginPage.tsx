import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Eye, EyeOff, Building2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { IndustrialCompressorSchematic } from "@/components/IndustrialCompressorSchematic";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await authApi.register({ name, email, password });
        if (res.data?.success && res.data.data) {
          login(res.data.data.token, res.data.data.user);
          navigate("/", { replace: true });
          return;
        }
        throw new Error(res.data?.error?.message || "Registration failed");
      }

      const res = await authApi.login(email, password);
      if (res.data?.success && res.data.data) {
        login(res.data.data.token, res.data.data.user);
        navigate("/", { replace: true });
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
    <div className="min-h-screen w-full bg-[#070B14] text-white flex flex-col justify-between selection:bg-[#0057FF] selection:text-white relative overflow-x-hidden font-sans">
      {/* Subtle background tech ambient lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10192e10_1px,transparent_1px),linear-gradient(to_bottom,#10192e10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Split Grid */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ── LEFT HERO & INDUSTRIAL SCHEMATIC PANEL (7 COLS) ── */}
        <section className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-[#1E293B]/60">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div className="flex items-center gap-3">
              <div className="size-9 bg-[#0057FF] rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(0,87,255,0.4)]">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white leading-none font-display">
                  MAN-U-AI
                </span>
                <span className="text-[10px] font-mono text-slate-400 tracking-[0.2em] uppercase mt-1">
                  INDUSTRIAL INTELLIGENCE
                </span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 tracking-[0.2em] uppercase hidden sm:block">
              BUILT FOR THE FLOOR.
            </div>
          </div>

          {/* Center Content & Blueprint */}
          <div className="my-auto py-4">
            {/* Kicker */}
            <div className="text-xs font-mono text-[#0057FF] font-bold tracking-[0.22em] uppercase mb-3">
              KNOWLEDGE, PUT TO WORK.
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-display font-bold text-white tracking-tight leading-[1.12] mb-4">
              The right knowledge.<br />
              Right where you work.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
              Your approved manuals, procedures and expert knowledge.<br className="hidden sm:inline" />
              One grounded conversation away.
            </p>

            {/* Industrial Schematic Diagram */}
            <div className="w-full max-w-2xl">
              <IndustrialCompressorSchematic />

              {/* Sub-schematic metadata row */}
              <div className="flex items-center justify-between mt-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-0.5 bg-[#0057FF]" />
                  <span className="text-[#38BDF8] font-bold uppercase tracking-wider text-[11px]">
                    PRECISION IN MOTION
                  </span>
                </div>
                <span className="text-slate-500 uppercase tracking-widest text-[10px]">
                  STYLIZED ASSEMBLY / NOT A LIVE MACHINE
                </span>
              </div>
            </div>
          </div>

          {/* Left Bottom Footer */}
          <div className="flex items-center justify-between pt-8 text-xs font-mono text-slate-500 border-t border-[#1E293B]/40 mt-8">
            <span>For people who keep industry moving.</span>
            <span className="tracking-widest uppercase">FORGE / V1.0</span>
          </div>
        </section>

        {/* ── RIGHT SIGN IN PANEL (5 COLS) ── */}
        <section className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#080D1A]/60 backdrop-blur-sm">
          {/* Top Security Status */}
          <div className="flex items-center justify-end gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck size={15} className="text-[#0057FF]" />
            <span className="tracking-wider">Secure, role-based access</span>
          </div>

          {/* Form Container */}
          <div className="my-auto py-8 max-w-md w-full mx-auto">
            {/* Form Kicker */}
            <div className="text-xs font-mono text-[#0057FF] font-bold tracking-[0.22em] uppercase mb-2">
              WELCOME TO FORGE
            </div>

            {/* Form Heading */}
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2">
              Sign in to your workspace.
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Trusted answers start with approved knowledge.
            </p>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-start gap-2.5 text-xs text-[#FF3B30]">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="p-3 rounded-lg bg-[#111A2E] border border-[#1E293B] text-xs text-slate-400 space-y-1.5">
                    <p>
                      <span className="font-semibold text-primary">Notice:</span> Public self-registration is restricted in production environments. Accounts must be provisioned by an administrator.
                    </p>
                    <p>
                      Self-registration enrolls with restricted sandbox access. Plant Manager, Engineer, and Admin roles must be provisioned or promoted by a Plant Administrator.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                      Full Name & Title
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe, Lab Manager"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#0E1526] border border-[#1E293B] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Work Email Field */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@riverside.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0E1526] border border-[#1E293B] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all font-sans"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0E1526] border border-[#1E293B] rounded-lg pl-4 pr-11 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember this device & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="size-4 rounded border-[#1E293B] bg-[#0E1526] text-[#0057FF] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#0057FF]"
                  />
                  <span>Remember this device</span>
                </label>

                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setError("Password reset is managed by your plant administrator. Please contact your IT supervisor.");
                  }}
                  className="text-[#38BDF8] hover:text-[#60A5FA] transition-colors font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                aria-label="Sign In to Web Workspace"
                className="w-full h-13 px-6 bg-[#0057FF] hover:bg-[#1A6BFF] active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider border-2 border-[#0057FF]/60 rounded-lg shadow-[0_0_20px_rgba(0,87,255,0.35)] hover:shadow-[0_0_30px_rgba(0,87,255,0.55)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {isLoading
                    ? "Authenticating with Backend..."
                    : isRegister
                    ? "Create Account & Workspace"
                    : "Sign in"}
                </span>
                {!isLoading && <ArrowRight size={16} className="text-white" />}
              </button>
            </form>

            {/* Divider: OR USE COMPANY ACCESS */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1E293B]" />
              </div>
              <div className="relative flex justify-center text-center">
                <span className="px-3 bg-[#080D1A] text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                  OR USE COMPANY ACCESS
                </span>
              </div>
            </div>

            {/* Continue with SSO Button */}
            <button
              type="button"
              onClick={() => {
                setError("Enterprise SSO is enabled on custom domains. Use your corporate credentials to sign in directly.");
              }}
              className="w-full h-11 bg-[#0E1526] hover:bg-[#15203A] border border-[#1E293B] rounded-lg text-xs font-mono font-bold tracking-wider text-slate-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Building2 size={16} className="text-slate-400" />
              <span>Continue with SSO</span>
            </button>

            {/* Support / Registration Help */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Need access? Contact your site administrator.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="text-xs text-[#38BDF8] hover:text-[#60A5FA] transition-colors font-medium"
                >
                  {isRegister ? "Already have workspace credentials? Sign in" : "Need plant-level access? Request enrollment"}
                </button>
              </div>

              {/* Role Portal Switching Links */}
              <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
                <Link to="/admin/login" className="hover:text-amber-400 transition-colors font-medium">
                  Admin Login
                </Link>
                <span>·</span>
                <Link to="/manager/login" className="hover:text-emerald-400 transition-colors font-medium">
                  Manager Login
                </Link>
                <span>·</span>
                <Link to="/" className="hover:text-primary transition-colors font-medium">
                  Portal Select
                </Link>
              </div>
            </div>
          </div>

          {/* Right Bottom Disclaimer */}
          <div className="pt-8 text-slate-500 text-[11px] leading-relaxed border-t border-[#1E293B]/40 space-y-2">
            <p>
              Decision support, not machine control. Always follow current approved procedures and qualified supervision.
            </p>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
              <span>© 2026 MAN-U-AI</span>
              <div className="flex items-center gap-2">
                <span>Privacy</span>
                <span>·</span>
                <span>Terms</span>
                <span>·</span>
                <span>Help</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
