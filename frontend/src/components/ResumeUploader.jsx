import { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:5000";

function ResumeUploader({ onAnalysisComplete }) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setStatus("Only PDF and DOCX files are supported.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setStatus("File size must be 5 MB or less.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a resume first.");
      return;
    }

    const formData = new FormData();

    formData.append("resume", file);

    if (jobDescription.trim()) {
      formData.append(
        "job_description",
        jobDescription.trim()
      );
    }

    setStatus("Analyzing resume...");

    try {
      const response = await fetch(
        `${API_URL}/api/resume/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Resume processing failed."
        );
      }

      setStatus("");

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      setStatus(
        error.message || "Failed to analyze the resume."
      );
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center transition hover:border-slate-500 hover:bg-slate-900"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 text-2xl">
          📄
        </div>

        <h2 className="text-lg font-medium">
          {file ? file.name : "Upload your resume"}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          PDF or DOCX · Maximum 5 MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="mt-6">
        <div className="mb-3">
          <label
            htmlFor="job-description"
            className="text-sm font-medium text-slate-300"
          >
            Job Description
          </label>

          <span className="ml-2 text-xs text-slate-600">
            Optional
          </span>
        </div>

        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(event) =>
            setJobDescription(event.target.value)
          }
          placeholder="Paste the job description here to check ATS compatibility, skill matches, and missing keywords..."
          rows={8}
          className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600 focus:bg-slate-900"
        />

        <p className="mt-2 text-xs text-slate-600">
          Leave this empty if you only want a general resume analysis.
        </p>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file}
        className="mt-4 w-full rounded-xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Analyze Resume
      </button>

      {status && (
        <p className="mt-4 text-center text-sm text-slate-400">
          {status}
        </p>
      )}
    </div>
  );
}

export default ResumeUploader;