import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useState } from "react";

import AnalysisResult from "./components/AnalysisResult";
import CursorGlow from "./components/CursorGlow";
import Dashboard from "./components/Dashboard";
import ResumeUploader from "./components/ResumeUploader";

function App() {
  const [activeView, setActiveView] = useState("analyzer");
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setActiveView("result");
  };

  const handleAnalysisSelect = (result) => {
    setAnalysisResult(result);
    setActiveView("result");
  };

  const handleAnalyzeAnother = () => {
    setAnalysisResult(null);
    setActiveView("analyzer");
  };

  const handleLogoClick = () => {
    setAnalysisResult(null);
    setActiveView("analyzer");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02030a] text-white">
      <CursorGlow />
      <AmbientBackground />

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,3,10,0.15)_55%,rgba(2,3,10,0.55)_100%)]" />

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl px-5 sm:px-8">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#02030a]/55 py-5 backdrop-blur-2xl">
          <button
            onClick={handleLogoClick}
            className="group relative flex items-center gap-3 rounded-2xl px-2 py-1.5"
            aria-label="Go to analyzer"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/[0.025] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-blue-500/10 backdrop-blur-xl transition-all duration-500 group-hover:border-blue-300/20 group-hover:bg-blue-400/[0.08] group-hover:shadow-blue-500/20">
              <span className="absolute inset-0 rounded-xl bg-blue-400/10 blur-md" />

              <Sparkles
                size={18}
                className="relative z-10 text-blue-300 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110"
              />
            </div>

            <span className="relative text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-blue-100">
              ResuMind
            </span>
          </button>

          <nav className="relative flex items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-1.5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <NavButton
              active={activeView === "analyzer"}
              onClick={() => setActiveView("analyzer")}
              icon={FileText}
              label="Analyzer"
            />

            <NavButton
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
              icon={LayoutDashboard}
              label="Dashboard"
            />
          </nav>
        </header>

        <div className="relative z-10 py-10 sm:py-14">
          {activeView === "analyzer" && (
            <AnalyzerHome
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {activeView === "result" && (
            <AnalysisResult
              result={analysisResult}
              onBack={handleAnalyzeAnother}
            />
          )}

          {activeView === "dashboard" && (
            <Dashboard
              onAnalysisSelect={handleAnalysisSelect}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function AnalyzerHome({ onAnalysisComplete }) {
  return (
    <section>
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className="mb-6 inline-flex cursor-default items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/[0.07] px-3.5 py-2 text-xs font-medium text-blue-200 shadow-lg shadow-blue-500/5 backdrop-blur-xl"
          >
            <Sparkles size={13} className="text-blue-300" />
            RESUME INTELLIGENCE
          </motion.div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Turn your resume into your{" "}
            <span className="relative inline-block bg-gradient-to-r from-white via-blue-200 to-violet-300 bg-clip-text text-transparent">
              strongest advantage.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            ResuMind analyzes your resume structure, skills, ATS compatibility,
            and job-specific keywords to show exactly where you can improve.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <FeaturePill icon={Zap} text="Instant Analysis" />
            <FeaturePill icon={Target} text="ATS Matching" />
            <FeaturePill icon={BarChart3} text="Actionable Insights" />
          </div>
        </motion.div>

        <HeroVisual />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.2,
          ease: "easeOut",
        }}
        className="mt-14"
      >
        <ResumeUploader
          onAnalysisComplete={onAnalysisComplete}
        />
      </motion.div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.15,
        ease: "easeOut",
      }}
      className="relative hidden min-h-[430px] items-center justify-center lg:flex"
    >
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
      />

      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotateX: [3, -3, 3],
          rotateY: [-5, 5, -5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-[330px]"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute -right-20 top-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

        <motion.div
          whileHover={{
            rotateY: 3,
            rotateX: -2,
            scale: 1.015,
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 20,
          }}
          className="glass-surface glass-highlight relative overflow-hidden rounded-3xl p-6 shadow-2xl shadow-blue-950/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-violet-500/[0.08]" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-2 w-20 rounded-full bg-white/20" />
                <div className="mt-2 h-1.5 w-28 rounded-full bg-white/[0.08]" />
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/10 bg-blue-400/[0.08] text-blue-300">
                <FileText size={19} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Resume Score
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Overall quality
                </p>
              </div>

              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[7px] border-white/[0.05]" />

                <motion.div
                  animate={{ rotate: [35, 395] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border-[7px] border-transparent border-t-blue-400 border-r-violet-400"
                />

                <div className="text-center">
                  <p className="text-2xl font-semibold">94</p>
                  <p className="text-[10px] text-slate-500">
                    / 100
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <VisualMetric
                label="Structure"
                value="Excellent"
                width="88%"
              />

              <VisualMetric
                label="Skills"
                value="Strong"
                width="96%"
              />

              <VisualMetric
                label="ATS"
                value="87%"
                width="87%"
              />
            </div>

            <div className="mt-7 flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2.5 backdrop-blur-xl">
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
              />

              <span className="text-xs text-slate-400">
                Resume ready for optimization
              </span>
            </div>
          </div>
        </motion.div>

        <FloatingCard
          icon={Target}
          label="ATS Match"
          value="87%"
          className="-left-24 top-20"
          delay={0}
        />

        <FloatingCard
          icon={Sparkles}
          label="Keywords"
          value="+12 found"
          className="-right-24 bottom-16"
          delay={1}
        />
      </motion.div>
    </motion.div>
  );
}

function VisualMetric({ label, value, width }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[11px]">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{
            duration: 1.2,
            delay: 0.5,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-lg shadow-blue-500/20"
        />
      </div>
    </div>
  );
}

function FloatingCard({
  icon: Icon,
  label,
  value,
  className,
  delay,
}) {
  return (
    <motion.div
      animate={{ y: [-7, 7, -7] }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.04,
        y: -3,
      }}
      className={`glass-surface glass-highlight absolute z-10 rounded-2xl px-4 py-3 shadow-2xl shadow-black/30 ${className}`}
    >
      <div className="relative flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.05] text-blue-300">
          <Icon size={16} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">
            {label}
          </p>

          <p className="mt-0.5 text-sm font-semibold text-white">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturePill({ icon: Icon, text }) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.025,
      }}
      whileTap={{ scale: 0.98 }}
      className="glass-surface flex cursor-default items-center gap-2 rounded-full px-3.5 py-2 text-xs text-slate-400 shadow-lg shadow-black/10"
    >
      <Icon size={14} className="text-blue-300" />
      {text}
    </motion.div>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
        active
          ? "text-white"
          : "text-slate-500 hover:text-slate-200"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-nav"
          className="absolute inset-0 rounded-xl border border-white/[0.07] bg-white/[0.075] shadow-lg shadow-black/10"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      <Icon
        size={15}
        className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5"
      />

      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

function AmbientBackground() {
  return (
    <>
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.75, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed left-[-15%] top-[5%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.1] blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1.08, 1, 1.08],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed right-[-15%] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.09] blur-[120px]"
      />

      <motion.div
        animate={{
          y: [-20, 20, -20],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed left-[45%] top-[10%] h-1 w-1 rounded-full bg-blue-200 shadow-[0_0_20px_6px_rgba(96,165,250,0.3)]"
      />
    </>
  );
}

export default App;