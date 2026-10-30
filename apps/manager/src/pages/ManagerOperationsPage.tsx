import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ArrowRight,
  BookOpen,
  Bot,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { equipmentApi } from "@man-u-ai/web-core";

export function ManagerOperationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: equipmentResp,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => equipmentApi.list(),
  });

  const equipment = equipmentResp?.data?.data || [];

  const filteredEquipment = equipment.filter((eq: any) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eq.location && eq.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (eq.model && eq.model.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return eq.status !== "offline" && eq.status !== "maintenance";
    if (statusFilter === "attention") return eq.status === "maintenance" || eq.status === "degraded";
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-canvas p-4 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="text-primary w-5 h-5" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
              Operational Work Management
            </h1>
            <span className="badge-primary text-2xs">Operations Center</span>
          </div>
          <p className="text-xs md:text-sm text-ink-subtle">
            Real-time status of physical production machinery, assigned shopfloor sectors, and operating documentation.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn-secondary p-2 self-start"
          title="Refresh Operations"
        >
          <RefreshCw size={14} />
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="card bg-surface-1 border border-hairline rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["all", "active", "attention"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === s
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-surface-2 border-hairline text-ink-subtle hover:text-ink"
              }`}
            >
              {s === "all" ? "All Equipment" : s === "active" ? "Active / Ready" : "Attention Required"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search by name, location, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-8 text-xs py-1.5"
          />
        </div>
      </div>

      {/* Equipment List Cards */}
      {isLoading && (
        <div className="card bg-surface-1 border border-hairline p-12 flex items-center justify-center gap-3 text-ink-subtle text-xs">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span>Loading operational machinery records...</span>
        </div>
      )}

      {isError && (
        <div className="card bg-surface-1 border border-danger/30 p-8 text-center text-xs text-danger">
          Failed to load machinery status from database.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((eq: any) => (
            <div
              key={eq.id || eq._id}
              className="card bg-surface-1 border border-hairline rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center text-primary">
                    <Cpu size={16} />
                  </div>
                  <span
                    className={`badge text-2xs ${
                      eq.status === "offline"
                        ? "badge-danger"
                        : eq.status === "maintenance"
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {eq.status || "Operational"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-ink mt-3">{eq.name}</h3>
                <p className="text-2xs text-ink-tertiary mt-0.5">{eq.model || "Standard Industrial Asset"}</p>
                <div className="mt-3 space-y-1 text-xs text-ink-subtle">
                  <p className="flex items-center gap-1.5">
                    <span className="text-ink-tertiary text-2xs uppercase tracking-wider">Location:</span>
                    <span className="font-medium text-ink">{eq.location || "Main Plant Floor"}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-ink-tertiary text-2xs uppercase tracking-wider">Serial:</span>
                    <span className="font-mono text-2xs text-ink">{eq.serialNumber || "N/A"}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
                <Link
                  to="/equipment"
                  className="inline-flex items-center gap-1 text-2xs font-semibold text-primary hover:underline"
                >
                  <Cpu size={12} />
                  <span>Inspect asset</span>
                </Link>
                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-1 text-2xs font-medium text-ink-tertiary hover:text-ink"
                >
                  <Bot size={12} />
                  <span>Copilot query</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredEquipment.length === 0 && (
        <div className="card bg-surface-1 border border-hairline p-8 text-center text-ink-tertiary text-xs">
          No machinery matching the specified filters.
        </div>
      )}
    </div>
  );
}
