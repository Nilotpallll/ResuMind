import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileCheck2,
  Files,
  Gauge,
  History,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
      const [statsResponse, analysesResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`),
          fetch(`${API_URL}/api/dashboard/analyses`),
        ]);

      const statsData = await statsResponse.json();
      const analysesData = await analysesResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsData.error ||
            "Failed to load dashboard statistics."
        );
      }

      if (!analysesResponse.ok) {
        throw new Error(
          analysesData.error ||
            "Failed to load analysis history."
        );
      }

      setStats(statsData);
      setAnalyses(analysesData.analyses || []);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load dashboard."
      );
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
      setError("");

      const response = await fetch(
        `${API_URL}/api/dashboard/analyses/${analysisId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load analysis."
        );
      }

      onAnalysisSelect(data);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load analysis."
      );
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[2rem] border border-red-300/10 bg-white/[0.025] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/[0.07] blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/10 bg-red-400/[0.06] text-red-300">
              <BarChart3 size={21} />
            </div>

            <h2 className="mt-5 text-lg font-medium text-white">
              Dashboard unavailable
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <motion.button
              whileHover={{
                scale: 1.03,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={fetchDashboardData}
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.055] px-5 py-2.5 text-sm font-medium text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-blue-300/15 hover:bg-white/[0.08]"
            >
              <RefreshCw size={14} />

              Try again
            </motion.button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <DashboardHeader />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total analyses"
          value={stats?.total_analyses ?? 0}
          icon={Files}
          description="Resumes evaluated"
          delay={0}
          accent="blue"
        />

        <StatCard
          label="Average score"
          value={stats?.average_score ?? 0}
          suffix="/100"
          icon={Gauge}
          description="Across all resumes"
          delay={0.05}
          accent="cyan"
        />

        <StatCard
          label="Best score"
          value={stats?.best_score ?? 0}
          suffix="/100"
          icon={TrendingUp}
          description="Personal best"
          delay={0.1}
          accent="violet"
          highlight
        />

        <StatCard
          label="Best ATS"
          value={stats?.best_ats_score ?? 0}
          suffix="/100"
          icon={Target}
          description="Best role alignment"
          delay={0.15}
          accent="indigo"
        />
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
        className="mt-6"
      >
        <OverviewPanel
          stats={stats}
          analyses={analyses}
        />
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.08,
        }}
        transition={{
          duration: 0.7,
          delay: 0.05,
          ease: "easeOut",
        }}
        className="mt-6"
      >
        <HistoryPanel
          analyses={analyses}
          onAnalysisClick={handleAnalysisClick}
        />
      </motion.div>
    </section>
  );
}

function DashboardHeader() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
      className="mb-10"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/10 bg-blue-400/[0.05] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-200/70 backdrop-blur-xl"
          >
            <Sparkles size={12} />

            Personal workspace
          </motion.div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
            Your resume
            <span className="bg-gradient-to-r from-white via-blue-100 to-violet-300 bg-clip-text text-transparent">
              {" "}
              journey.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            A living overview of how your resumes are performing,
            evolving, and matching the roles you're targeting.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-slate-500 shadow-lg shadow-black/10 backdrop-blur-xl sm:flex">
          <CalendarDays size={13} />

          Analysis history
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  description,
  delay,
  accent,
  highlight = false,
}) {
  const accentClasses = {
    blue: "bg-blue-400/10 text-blue-300",
    cyan: "bg-cyan-400/10 text-cyan-300",
    violet: "bg-violet-400/10 text-violet-300",
    indigo: "bg-indigo-400/10 text-indigo-300",
  };

  const glowClasses = {
    blue: "bg-blue-500/10",
    cyan: "bg-cyan-400/10",
    violet: "bg-violet-500/10",
    indigo: "bg-indigo-500/10",
  };

  return (
    <LiquidCard
      className="p-5"
      delay={delay}
    >
      <div
        className={`pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl transition-opacity duration-700 ${
          glowClasses[accent]
        } ${
          highlight
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <motion.div
            whileHover={{
              scale: 1.08,
              rotate: 4,
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] ${accentClasses[accent]} transition-all duration-300`}
          >
            <Icon size={18} />
          </motion.div>

          <ArrowUpRight
            size={16}
            className="text-slate-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-300"
          />
        </div>

        <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600">
          {label}
        </p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <AnimatedValue value={value} />

          {suffix && (
            <span className="text-xs text-slate-600">
              {suffix}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-600">
          {description}
        </p>

        <div className="mt-5 h-px overflow-hidden bg-white/[0.04]">
          <motion.div
            initial={{
              x: "-100%",
            }}
            animate={{
              x: "100%",
            }}
            transition={{
              duration: 2.5,
              delay: delay + 0.7,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
            className={`h-full w-1/3 bg-gradient-to-r from-transparent via-blue-300/40 to-transparent`}
          />
        </div>
      </div>
    </LiquidCard>
  );
}

function AnimatedValue({ value }) {
  return (
    <motion.span
      initial={{
        opacity: 0,
        y: 10,
        filter: "blur(6px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.65,
        delay: 0.25,
      }}
      className="text-3xl font-semibold tracking-[-0.05em] text-white"
    >
      {value}
    </motion.span>
  );
}

function OverviewPanel({
  stats,
  analyses,
}) {
  const averageScore =
    stats?.average_score ?? 0;

  const bestScore =
    stats?.best_score ?? 0;

  const totalAnalyses =
    stats?.total_analyses ?? 0;

  const latestAnalysis =
    analyses[0];

  return (
    <LiquidCard className="p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/[0.08] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-violet-500/[0.06] blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
            <BarChart3 size={13} />

            Performance overview
          </div>

          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-white sm:text-3xl">
            Keep improving.
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
            Your strongest resume has reached{" "}
            <span className="font-medium text-blue-200">
              {bestScore}/100
            </span>
            . Every analysis gives you another opportunity to
            refine your profile.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <MiniMetric
              label="Average"
              value={`${averageScore}/100`}
              icon={Gauge}
            />

            <MiniMetric
              label="Analyses"
              value={totalAnalyses}
              icon={Files}
            />

            {latestAnalysis && (
              <MiniMetric
                label="Latest"
                value={latestAnalysis.overall_score}
                icon={TrendingUp}
              />
            )}
          </div>
        </div>

        <ScoreVisual
          average={averageScore}
          best={bestScore}
        />
      </div>
    </LiquidCard>
  );
}

function ScoreVisual({
  average,
  best,
}) {
  const averageWidth = Math.min(
    Math.max(average, 0),
    100
  );

  const bestWidth = Math.min(
    Math.max(best, 0),
    100
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-black/15 p-5 shadow-inner shadow-white/[0.02]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/[0.06] blur-2xl" />

      <div className="relative">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-700">
              Score trajectory
            </p>

            <p className="mt-1.5 text-sm text-slate-500">
              Average vs personal best
            </p>
          </div>

          <motion.div
            animate={{
              y: [-2, 2, -2],
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/10 bg-blue-400/[0.06] text-blue-300"
          >
            <TrendingUp size={17} />
          </motion.div>
        </div>

        <div className="space-y-7">
          <ScoreBar
            label="Average"
            value={average}
            width={averageWidth}
          />

          <ScoreBar
            label="Personal best"
            value={best}
            width={bestWidth}
            highlighted
          />
        </div>

        <div className="mt-7 flex justify-between text-[9px] font-medium uppercase tracking-[0.15em] text-slate-700">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  width,
  highlighted = false,
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${
            highlighted
              ? "text-blue-200"
              : "text-white"
          }`}
        >
          {value}
        </span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${width}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`relative h-full rounded-full ${
            highlighted
              ? "bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400"
              : "bg-gradient-to-r from-slate-400/60 to-blue-400/70"
          }`}
        >
          <motion.div
            animate={{
              x: ["-100%", "300%"],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"
          />
        </motion.div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-2.5 transition-colors duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      <Icon
        size={13}
        className="text-slate-600"
      />

      <div>
        <p className="text-[9px] uppercase tracking-wider text-slate-700">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-300">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function HistoryPanel({
  analyses,
  onAnalysisClick,
}) {
  return (
    <LiquidCard className="overflow-hidden">
      <div className="relative flex flex-col gap-4 border-b border-white/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{
              scale: 1.05,
              rotate: -3,
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] text-slate-400"
          >
            <History size={18} />
          </motion.div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
              History
            </p>

            <h2 className="mt-1 text-xl font-medium tracking-tight text-white">
              Recent analyses
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-600">
            {analyses.length}{" "}
            {analyses.length === 1
              ? "analysis"
              : "analyses"}
          </span>
        </div>
      </div>

      {analyses.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="relative divide-y divide-white/[0.05]">
          {analyses.map(
            (analysis, index) => (
              <AnalysisRow
                key={analysis.id}
                analysis={analysis}
                index={index}
                onClick={() =>
                  onAnalysisClick(
                    analysis.id
                  )
                }
              />
            )
          )}
        </div>
      )}
    </LiquidCard>
  );
}

function AnalysisRow({
  analysis,
  index,
  onClick,
}) {
  const score =
    analysis.overall_score ?? 0;

  const ats =
    analysis.ats_score;

  return (
    <motion.button
      initial={{
        opacity: 0,
        x: -12,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(
          index * 0.04,
          0.2
        ),
        ease: "easeOut",
      }}
      whileHover={{
        x: 5,
      }}
      onClick={onClick}
      className="group relative flex w-full items-center gap-4 px-6 py-5 text-left transition-all duration-400 hover:bg-white/[0.025] sm:px-7"
    >
      <div className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-blue-400 to-violet-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <motion.div
        whileHover={{
          scale: 1.08,
          rotate: 3,
        }}
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-slate-600 transition-colors duration-300 group-hover:border-blue-300/10 group-hover:bg-blue-400/[0.05] group-hover:text-blue-300 sm:flex"
      >
        <FileCheck2 size={17} />
      </motion.div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-300 transition-colors duration-300 group-hover:text-white">
          {analysis.filename}
        </p>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-700">
          <CalendarDays size={11} />

          {formatDate(
            analysis.created_at
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 sm:gap-8">
        <HistoryScore
          label="Score"
          value={score}
          highlight
        />

        <HistoryScore
          label="ATS"
          value={ats}
        />

        <motion.div
          whileHover={{
            scale: 1.08,
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-700 transition-all duration-300 group-hover:border-white/[0.07] group-hover:bg-white/[0.04] group-hover:text-blue-300"
        >
          <ChevronRight
            size={17}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </motion.div>
      </div>
    </motion.button>
  );
}

function HistoryScore({
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="min-w-[42px] text-right">
      <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-700">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          highlight
            ? "text-slate-200"
            : "text-slate-400"
        }`}
      >
        {value !== null &&
        value !== undefined
          ? value
          : "—"}
      </p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="relative overflow-hidden px-6 py-20 text-center sm:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.06] blur-3xl" />

      <div className="relative">
        <motion.div
          animate={{
            y: [-4, 4, -4],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-slate-600 shadow-2xl shadow-black/20"
        >
          <Files size={25} />
        </motion.div>

        <h3 className="mt-6 text-base font-medium text-white">
          Nothing here yet
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
          Analyze your first resume and your results will
          appear here automatically.
        </p>
      </div>
    </motion.div>
  );
}

function LiquidCard({
  children,
  className = "",
  delay = 0,
}) {
  const cardRef = useRef(null);

  const handlePointerMove = (event) => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const rect =
      card.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    card.style.setProperty(
      "--liquid-x",
      `${x}%`
    );

    card.style.setProperty(
      "--liquid-y",
      `${y}%`
    );
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    card.style.setProperty(
      "--liquid-x",
      "50%"
    );

    card.style.setProperty(
      "--liquid-y",
      "50%"
    );
  };

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      transition={{
        duration: 0.55,
        delay,
        ease: "easeOut",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={{
        y: -3,
      }}
      className={`glass-surface glass-highlight group relative rounded-[2rem] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-10 animate-pulse">
        <div className="h-7 w-40 rounded-full bg-white/[0.05]" />

        <div className="mt-5 h-14 w-[430px] max-w-full rounded-2xl bg-white/[0.05]" />

        <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-white/[0.035]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-[2rem] border border-white/[0.05] bg-white/[0.02]"
          />
        ))}
      </div>

      <div className="mt-6 h-72 animate-pulse rounded-[2rem] border border-white/[0.05] bg-white/[0.02]" />

      <div className="mt-6 h-[28rem] animate-pulse rounded-[2rem] border border-white/[0.05] bg-white/[0.02]" />
    </section>
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

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export default Dashboard;