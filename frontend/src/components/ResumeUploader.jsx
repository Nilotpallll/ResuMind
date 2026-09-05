import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  FileText,
  LoaderCircle,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:5000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function ResumeUploader({ onAnalysisComplete }) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] =
    useState("");
  const [status, setStatus] = useState("");
  const [isDragging, setIsDragging] =
    useState(false);
  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (
      !["pdf", "docx"].includes(extension)
    ) {
      setStatus(
        "Only PDF and DOCX files are supported."
      );
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setStatus(
        "File size must be 5 MB or less."
      );
      return false;
    }

    setStatus("");
    setFile(selectedFile);

    return true;
  };

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files[0];

    validateFile(selectedFile);

    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile =
      event.dataTransfer.files[0];

    validateFile(droppedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus(
        "Please select a resume first."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "resume",
      file
    );

    if (jobDescription.trim()) {
      formData.append(
        "job_description",
        jobDescription.trim()
      );
    }

    setStatus("");
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${API_URL}/api/resume/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Resume processing failed."
        );
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      setStatus(
        error.message ||
          "Failed to analyze the resume."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <UploadZone
          file={file}
          isDragging={isDragging}
          inputRef={inputRef}
          onFileChange={handleFileChange}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onRemove={handleRemoveFile}
        />

        <JobDescription
          value={jobDescription}
          onChange={setJobDescription}
        />
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-300/10 bg-blue-400/[0.05] text-blue-300"
          >
            <Sparkles size={13} />
          </motion.div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              Explainable resume intelligence
            </p>

            <p className="mt-0.5 text-[10px] text-slate-700">
              Rule-based NLP · No LLM required
            </p>
          </div>
        </div>

        <AnalyzeButton
          file={file}
          isAnalyzing={isAnalyzing}
          onClick={handleUpload}
        />
      </div>

      {status && (
        <motion.div
          initial={{
            opacity: 0,
            y: -8,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-sm text-red-300 backdrop-blur-xl"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/10">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          </span>

          {status}
        </motion.div>
      )}
    </div>
  );
}

function AnalyzeButton({
  file,
  isAnalyzing,
  onClick,
}) {
  const enabled =
    Boolean(file) && !isAnalyzing;

  return (
    <motion.button
      whileHover={
        enabled
          ? {
              y: -2,
              scale: 1.015,
            }
          : {}
      }
      whileTap={
        enabled
          ? {
              scale: 0.975,
            }
          : {}
      }
      onClick={onClick}
      disabled={!enabled}
      className={`group relative flex min-h-13 items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-7 text-sm font-semibold transition-all duration-500 ${
        enabled
          ? "bg-white text-slate-950 shadow-2xl shadow-blue-500/10 hover:shadow-blue-400/20"
          : "cursor-not-allowed bg-white/10 text-slate-600"
      }`}
    >
      {enabled && (
        <>
          <motion.div
            animate={{
              x: [
                "-120%",
                "250%",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm"
          />

          <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40" />
        </>
      )}

      <span className="relative z-10 flex items-center gap-2.5">
        {isAnalyzing ? (
          <>
            <LoaderCircle
              size={17}
              className="animate-spin"
            />

            Analyzing resume...
          </>
        ) : (
          <>
            <Sparkles
              size={16}
              className="transition-transform duration-300 group-hover:rotate-12"
            />

            Analyze Resume

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </>
        )}
      </span>
    </motion.button>
  );
}

function UploadZone({
  file,
  isDragging,
  inputRef,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
}) {
  return (
    <motion.div
      animate={{
        scale: isDragging ? 1.01 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      <div
        onClick={() =>
          inputRef.current?.click()
        }
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`group relative min-h-[330px] cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-500 ${
          isDragging
            ? "border-blue-300/50 bg-blue-400/[0.08] shadow-2xl shadow-blue-500/15"
            : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.035]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-violet-500/[0.05] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.08] blur-3xl transition-all duration-700 group-hover:bg-blue-500/[0.13]" />

        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-500/[0.06] blur-3xl" />

        {isDragging && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="absolute inset-4 rounded-[1.5rem] border border-dashed border-blue-300/20"
          />
        )}

        <div className="relative flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={onFileChange}
            className="hidden"
          />

          {file ? (
            <SelectedFile
              file={file}
              onRemove={onRemove}
            />
          ) : (
            <EmptyUpload
              isDragging={isDragging}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyUpload({
  isDragging,
}) {
  return (
    <>
      <motion.div
        animate={
          isDragging
            ? {
                scale: 1.12,
                y: -6,
                rotate: -3,
              }
            : {
                scale: [1, 1.025, 1],
                y: [0, -3, 0],
              }
        }
        transition={
          isDragging
            ? {
                type: "spring",
                stiffness: 300,
              }
            : {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-blue-300/10 bg-blue-400/[0.06] text-blue-300 shadow-2xl shadow-blue-500/10"
      >
        <div className="absolute inset-0 rounded-[1.5rem] bg-blue-400/10 blur-xl" />

        <UploadCloud
          size={30}
          className="relative"
        />
      </motion.div>

      <motion.h2
        animate={{
          y: isDragging ? -3 : 0,
        }}
        className="text-lg font-medium text-white"
      >
        {isDragging
          ? "Release your resume"
          : "Drop your resume here"}
      </motion.h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {isDragging
          ? "We'll securely prepare it for analysis."
          : "Drag and drop your resume, or click anywhere to browse your files."}
      </p>

      <div className="mt-7 flex items-center gap-2">
        <FormatBadge text="PDF" />
        <FormatBadge text="DOCX" />

        <span className="ml-1 text-xs text-slate-600">
          Max 5 MB
        </span>
      </div>
    </>
  );
}

function SelectedFile({
  file,
  onRemove,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94,
        y: 8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 22,
      }}
      className="w-full max-w-md"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <motion.div
        whileHover={{
          y: -2,
        }}
        className="relative overflow-hidden rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4 text-left shadow-xl shadow-emerald-500/[0.03]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-400/[0.04] via-transparent to-blue-400/[0.04]" />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-300"
          >
            <FileText size={22} />
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {file.name}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Check
                size={12}
                className="text-emerald-400"
              />

              Ready to analyze

              <span>·</span>

              {formatFileSize(file.size)}
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={onRemove}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-400/10 hover:text-red-300"
            aria-label="Remove selected resume"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </motion.div>

      <p className="mt-4 text-xs text-slate-600">
        Click Analyze Resume below to begin.
      </p>
    </motion.div>
  );
}

function JobDescription({
  value,
  onChange,
}) {
  const hasText =
    value.trim().length > 0;

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-6 shadow-xl shadow-black/10 transition-all duration-500 hover:border-white/[0.13] hover:bg-white/[0.035]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 4,
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-400/[0.07] text-violet-300"
              >
                <Sparkles size={15} />
              </motion.div>

              <label
                htmlFor="job-description"
                className="text-sm font-medium text-white"
              >
                Job Description
              </label>
            </div>

            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-600">
              Add a target role to unlock ATS
              matching and missing keyword analysis.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] ${
              hasText
                ? "border-emerald-300/10 bg-emerald-400/[0.05] text-emerald-300"
                : "border-white/[0.06] text-slate-600"
            }`}
          >
            {hasText
              ? "Ready"
              : "Optional"}
          </span>
        </div>

        <div className="relative">
          <textarea
            id="job-description"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            placeholder="Paste the job description here..."
            rows={9}
            className="w-full resize-none rounded-2xl border border-white/[0.06] bg-slate-950/50 px-4 py-4 text-sm leading-6 text-white outline-none transition-all duration-500 placeholder:text-slate-700 focus:border-blue-300/20 focus:bg-slate-950/70 focus:shadow-inner focus:shadow-blue-500/[0.03]"
          />

          {hasText && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="pointer-events-none absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"
            >
              <Check size={12} />
            </motion.div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
          <span>
            Leave empty for general analysis.
          </span>

          <span>
            {value.length.toLocaleString()} chars
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function FormatBadge({
  text,
}) {
  return (
    <motion.span
      whileHover={{
        y: -2,
        scale: 1.04,
      }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-500 transition hover:border-blue-300/10 hover:text-slate-300"
    >
      {text}
    </motion.span>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

export default ResumeUploader;