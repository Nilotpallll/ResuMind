import { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:5000";

function ResumeUploader() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setStatus("Only PDF and DOCX files are supported.");
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

    setStatus("Analyzing resume...");

    try {
      const response = await fetch(`${API_URL}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Resume processing failed.");
      }

      setStatus("Resume processed successfully.");
      console.log(data);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="w-full max-w-xl">
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

      <button
        onClick={handleUpload}
        disabled={!file}
        className="mt-4 w-full rounded-xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Analyze Resume
      </button>

      {status && (
        <p className="mt-4 text-center text-sm text-slate-400">{status}</p>
      )}
    </div>
  );
}

export default ResumeUploader;