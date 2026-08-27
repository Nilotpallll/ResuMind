import { useEffect, useState } from "react";

function App() {
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/health")
      .then((response) => response.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus("Backend connection failed"));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-medium tracking-widest text-slate-400 uppercase">
            AI Resume Intelligence
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Build a resume that gets noticed.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            ResuMind analyzes your resume, checks ATS compatibility, identifies
            skill gaps, and provides actionable feedback.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-300">{backendStatus}</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;