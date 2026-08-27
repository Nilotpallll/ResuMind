import ResumeUploader from "./components/ResumeUploader";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-sm font-medium tracking-widest text-slate-400 uppercase">
            ResuMind
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Know what your resume is missing.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Analyze your resume for structure, ATS compatibility, skills, and
            role-specific improvements.
          </p>
        </div>

        <ResumeUploader />
      </div>
    </main>
  );
}

export default App;