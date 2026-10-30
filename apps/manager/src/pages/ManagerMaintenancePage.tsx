import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wrench,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Plus,
  FileText,
  Cpu,
} from "lucide-react";
import { analyticsApi, equipmentApi } from "@man-u-ai/web-core";

export function ManagerMaintenancePage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<
    "shift_handoff" | "root_cause" | "weekly_preventive" | "safety_audit"
  >("shift_handoff");
  const [focusArea, setFocusArea] = useState("");
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const {
    data: summariesResp,
    isLoading: summariesLoading,
    refetch,
  } = useQuery({
    queryKey: ["summaries"],
    queryFn: () => analyticsApi.summaries(),
  });

  const { data: equipmentResp } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => equipmentApi.list(),
  });

  const summaries = summariesResp?.data?.data || [];
  const equipment = equipmentResp?.data?.data || [];

  const generateMutation = useMutation({
    mutationFn: (payload: { summaryType: string; focusArea: string }) =>
      analyticsApi.generateSummary(payload.summaryType, payload.focusArea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries"] });
      setGenerationSuccess(true);
      setFocusArea("");
      setTimeout(() => setGenerationSuccess(false), 5000);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({
      summaryType: selectedType,
      focusArea: focusArea.trim(),
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-canvas p-4 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Wrench className="text-primary w-5 h-5" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
              Maintenance Coordination & Shift Handover
            </h1>
            <span className="badge-primary text-2xs">Operations Workflow</span>
          </div>
          <p className="text-xs md:text-sm text-ink-subtle">
            Generate verifiable operational handovers, review root-cause analysis, and prioritize machine maintenance tasks.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn-secondary p-2 self-start"
          title="Refresh Summaries"
        >
          <RefreshCw size={14} />
        </button>
      </header>

      {/* Summary Generator Card */}
      <div className="card bg-surface-1 border border-hairline rounded-xl p-5 space-y-4 shadow-card">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
            Generate New Operational Summary
          </h2>
        </div>

        {generationSuccess && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-xs text-success flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Summary generated and persisted to MongoDB successfully.</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
              Summary Protocol
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="input text-xs"
            >
              <option value="shift_handoff">Shift Handoff Log</option>
              <option value="root_cause">Root-Cause Assessment</option>
              <option value="weekly_preventive">Weekly Preventive Plan</option>
              <option value="safety_audit">Lockout/Tagout (LOTO) Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-medium text-ink-subtle mb-1 uppercase tracking-wider">
              Focus Area / Target Machine (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Slurry Pump P-102 or Line 1"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
            >
              {generateMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>{generateMutation.isPending ? "Synthesizing with AI..." : "Generate Summary"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Persisted Summaries List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Recent Maintenance Records & Shift Logs
          </h2>
          <span className="text-2xs text-ink-tertiary">{summaries.length} Persisted</span>
        </div>

        {summariesLoading && (
          <div className="card bg-surface-1 border border-hairline p-8 flex items-center justify-center gap-2 text-xs text-ink-subtle">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span>Loading maintenance records...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((s: any) => (
            <div
              key={s.id || s._id}
              className="card bg-surface-1 border border-hairline rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="badge-primary text-2xs font-semibold capitalize">
                    {s.type?.replace("_", " ") || "Operational Log"}
                  </span>
                  <span className="text-2xs text-ink-tertiary flex items-center gap-1">
                    <Clock size={11} />
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-ink mt-2.5">{s.title}</h3>
                <p className="text-2xs text-ink-tertiary mt-1">Author: {s.author || "Automated Shift Agent"}</p>

                {s.keyHighlights && s.keyHighlights.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {s.keyHighlights.slice(0, 3).map((h: string, idx: number) => (
                      <li key={idx} className="text-xs text-ink-subtle flex items-start gap-1.5">
                        <span className="text-primary mt-1">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-2xs">
                <span className="text-ink-tertiary">Shift: {s.shift || "Morning A"}</span>
                <Link
                  to="/summaries"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <FileText size={12} />
                  <span>View full document</span>
                </Link>
              </div>
            </div>
          ))}

          {!summariesLoading && summaries.length === 0 && (
            <div className="col-span-2 card bg-surface-1 border border-hairline p-8 text-center text-xs text-ink-tertiary">
              No operational summaries recorded yet. Use the generator above to produce the first shift handoff.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
