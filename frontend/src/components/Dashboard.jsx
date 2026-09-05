import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5000";

function Dashboard({ onAnalysisSelect }) {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, analysesResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`),
        fetch(`${API_URL}/api/dashboard/analyses`),
      ]);

      const statsData = await statsResponse.json();
      const analysesData = await analysesResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsData.error || "Failed to load dashboard statistics."
        );
      }

      if (!analysesResponse.ok) {
        throw new Error(
          analysesData.error || "Failed to load analysis history."
        );
      }

      setStats(statsData);
      setAnalyses(analysesData.analyses || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAnalysisClick = async (analysisId) => {
    if (!onAnalysisSelect) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/analyses/${analysisId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load analysis."
        );
      }

      onAnalysisSelect(data);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <section className="w-full">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-sm text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>

          <button
            onClick={fetchDashboardData}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-slate-500">
          Dashboard
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Resume Analysis Overview
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Track your resume scores and previous analyses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Analyses"
          value={stats?.total_analyses ?? 0}
        />

        <StatCard
          label="Average Score"
          value={stats?.average_score ?? 0}
          suffix="/100"
        />

        <StatCard
          label="Best Score"
          value={stats?.best_score ?? 0}
          suffix="/100"
        />

        <StatCard
          label="Best ATS Score"
          value={stats?.best_ats_score ?? 0}
          suffix="/100"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="border-b border-slate-800 px-6 py-5">
          <h3 className="text-lg font-medium text-white">
            Recent Analyses
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Select an analysis to view its complete report.
          </p>
        </div>

        {analyses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-400">
              No resume analyses yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {analyses.map((analysis) => (
              <button
                key={analysis.id}
                onClick={() => handleAnalysisClick(analysis.id)}
                className="flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {analysis.filename}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(analysis.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <Score
                    label="Score"
                    value={analysis.overall_score}
                  />

                  <Score
                    label="ATS"
                    value={analysis.ats_score}
                  />

                  <span className="hidden text-slate-600 sm:block">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, suffix = "" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-normal text-slate-500">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value !== null && value !== undefined ? value : "—"}
      </p>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) {
    return "Unknown date";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default Dashboard;