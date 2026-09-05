import { useState } from "react";

import AnalysisResult from "./components/AnalysisResult";
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setActiveView("analyzer")}
            className="self-start text-lg font-semibold tracking-tight"
          >
            ResuMind
          </button>

          <nav className="flex items-center gap-2 rounded-xl bg-slate-900 p-1">
            <button
              onClick={() => setActiveView("analyzer")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeView === "analyzer"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Analyzer
            </button>

            <button
              onClick={() => setActiveView("dashboard")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeView === "dashboard"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Dashboard
            </button>
          </nav>
        </header>

        <div className="py-12">
          {activeView === "analyzer" && (
            <section>
              <div className="mb-12 max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-400">
                  Resume Analyzer
                </p>

                <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                  Know what your resume is missing.
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-400">
                  Analyze your resume for structure, ATS compatibility, skills,
                  and role-specific improvements.
                </p>
              </div>

              <ResumeUploader
                onAnalysisComplete={handleAnalysisComplete}
              />
            </section>
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

export default App;