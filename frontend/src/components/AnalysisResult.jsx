import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Check,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  Gauge,
  KeyRound,
  Lightbulb,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRef } from "react";

function AnalysisResult({ result, onBack }) {
  if (!result) {
    return null;
  }

  const analysis = result.analysis || {};
  const feedback = result.feedback || {};
  const atsAnalysis = result.ats_analysis || null;

  const overallScore =
    analysis.overall_score ??
    result.overall_score ??
    0;

  const atsScore =
    atsAnalysis?.ats_score ??
    result.ats_score;

  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const atsFeedback = feedback.ats_feedback || [];
  const priorityActions =
    feedback.priority_actions || [];

  return (
    <section className="relative mx-auto w-full max-w-6xl">
      <PageHeader
        filename={result.filename}
        onBack={onBack}
      />

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
      >
        <ScoreOverview
          overallScore={overallScore}
          atsScore={atsScore}
          hasAts={Boolean(atsAnalysis)}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FeedbackPanel
            title="What's working"
            eyebrow="STRENGTHS"
            icon={ShieldCheck}
            iconClass="text-emerald-300"
            glowClass="bg-emerald-400/10"
            items={strengths}
            emptyMessage="No specific strengths were identified."
          />

          <FeedbackPanel
            title="Where to improve"
            eyebrow="IMPROVEMENTS"
            icon={TrendingUp}
            iconClass="text-amber-300"
            glowClass="bg-amber-400/10"
            items={improvements}
            emptyMessage="No major improvements were identified."
          />
        </div>

        {priorityActions.length > 0 && (
          <PriorityActions
            actions={priorityActions}
          />
        )}

        {atsAnalysis && (
          <ATSSection
            atsAnalysis={atsAnalysis}
            atsFeedback={atsFeedback}
          />
        )}

        <BreakdownSection
          analysis={analysis}
        />
      </motion.div>
    </section>
  );
}

function PageHeader({
  filename,
  onBack,
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <motion.button
          whileHover={{
            x: -3,
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={onBack}
          className="group mb-6 flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-white"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          New analysis
        </motion.button>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/10 bg-blue-400/[0.05] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-200/70 backdrop-blur-xl">
          <Sparkles size={12} />

          Analysis complete
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
          Resume
          <span className="bg-gradient-to-r from-white via-blue-100 to-violet-300 bg-clip-text text-transparent">
            {" "}
            intelligence.
          </span>
        </h1>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <FileCheck2
            size={15}
            className="text-blue-300/50"
          />

          <span className="max-w-xs truncate">
            {filename || "Resume"}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{
          y: -2,
          scale: 1.015,
        }}
        whileTap={{
          scale: 0.975,
        }}
        onClick={onBack}
        className="glass-highlight group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-sm font-medium text-slate-300 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-blue-300/15 hover:bg-white/[0.06] hover:text-white"
      >
        Analyze another

        <ArrowUpRight
          size={15}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </motion.button>
    </div>
  );
}

function ScoreOverview({
  overallScore,
  atsScore,
  hasAts,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <LiquidCard className="min-h-[340px] p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/[0.1] blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-500/[0.07] blur-3xl" />

        <div className="relative flex h-full flex-col justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
              <Gauge size={14} />

              Overall resume score
            </div>

            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
              A combined evaluation of your resume's
              structure, skills, education, projects,
              experience, and completeness.
            </p>
          </div>

          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <ScoreRing
              score={overallScore}
              size={175}
              strokeWidth={8}
            />

            <div>
              <ScoreBadge
                score={overallScore}
              />

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                {getScoreDescription(
                  overallScore
                )}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <Check
                  size={13}
                  className="text-emerald-400"
                />

                Based on your uploaded resume
              </div>
            </div>
          </div>
        </div>
      </LiquidCard>

      <LiquidCard className="relative overflow-hidden p-7 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-500/[0.1] blur-3xl" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
              <Radar size={14} />

              ATS readiness
            </div>

            {hasAts && (
              <span className="rounded-full border border-violet-300/10 bg-violet-400/[0.06] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-violet-300">
                Job matched
              </span>
            )}
          </div>

          <div className="mt-auto pt-12">
            {hasAts ? (
              <>
                <div className="flex items-end gap-2">
                  <AnimatedNumber
                    value={atsScore}
                  />

                  <span className="mb-1 text-sm text-slate-600">
                    /100
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {getATSDescription(
                    atsScore
                  )}
                </p>

                <div className="relative mt-7 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${atsScore}%`,
                    }}
                    transition={{
                      duration: 1.3,
                      delay: 0.3,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="relative h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400"
                  >
                    <motion.div
                      animate={{
                        x: [
                          "-100%",
                          "350%",
                        ],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-sm"
                    />
                  </motion.div>
                </div>

                <div className="mt-3 flex justify-between text-[9px] uppercase tracking-widest text-slate-700">
                  <span>Low</span>
                  <span>Strong</span>
                  <span>Excellent</span>
                </div>
              </>
            ) : (
              <>
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
                  className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-xl shadow-black/20"
                >
                  <Target
                    size={30}
                    className="text-slate-600"
                  />
                </motion.div>

                <h3 className="mt-5 text-lg font-medium text-white">
                  Target a role
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add a job description during analysis
                  to unlock ATS matching, missing skills,
                  and keyword insights.
                </p>
              </>
            )}
          </div>
        </div>
      </LiquidCard>
    </div>
  );
}

function ScoreRing({
  score,
  size,
  strokeWidth,
}) {
  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  const progress = Math.min(
    Math.max(score, 0),
    100
  );

  const offset =
    circumference -
    (progress / 100) *
      circumference;

  return (
    <motion.div
      whileHover={{
        scale: 1.035,
      }}
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <div className="pointer-events-none absolute inset-2 rounded-full bg-blue-500/[0.06] blur-2xl" />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.045)"
          strokeWidth={strokeWidth}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset:
              circumference,
          }}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{
            duration: 1.5,
            delay: 0.2,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        />

        <defs>
          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#60a5fa"
            />

            <stop
              offset="55%"
              stopColor="#818cf8"
            />

            <stop
              offset="100%"
              stopColor="#c4b5fd"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber
          value={score}
        />

        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
          score
        </span>
      </div>
    </motion.div>
  );
}

function AnimatedNumber({
  value,
}) {
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
        duration: 0.6,
        delay: 0.35,
      }}
      className="text-5xl font-semibold tracking-[-0.06em] text-white"
    >
      {value ?? 0}
    </motion.span>
  );
}

function ScoreBadge({
  score,
}) {
  const label =
    score >= 90
      ? "Excellent"
      : score >= 80
        ? "Strong"
        : score >= 70
          ? "Good"
          : score >= 60
            ? "Needs work"
            : "Needs improvement";

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="inline-flex items-center gap-2 rounded-full border border-blue-300/10 bg-blue-400/[0.06] px-3 py-1.5 text-xs font-medium text-blue-200"
    >
      <Award size={13} />

      {label}
    </motion.div>
  );
}

function FeedbackPanel({
  title,
  eyebrow,
  icon: Icon,
  iconClass,
  glowClass,
  items,
  emptyMessage,
}) {
  return (
    <LiquidCard className="p-7">
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: 3,
          }}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] ${glowClass}`}
        >
          <Icon
            size={19}
            className={iconClass}
          />
        </motion.div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-medium tracking-tight text-white">
            {title}
          </h2>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-7 space-y-2">
          {items.map(
            (item, index) => (
              <motion.div
                key={`${item}-${index}`}
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                }}
                whileHover={{
                  x: 3,
                }}
                className="group flex gap-3 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.025]"
              >
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                  <Check
                    size={11}
                    className="text-slate-500 transition group-hover:text-emerald-300"
                  />
                </div>

                <p className="text-sm leading-6 text-slate-400 transition group-hover:text-slate-300">
                  {item}
                </p>
              </motion.div>
            )
          )}
        </div>
      ) : (
        <p className="mt-7 text-sm text-slate-600">
          {emptyMessage}
        </p>
      )}
    </LiquidCard>
  );
}

function PriorityActions({
  actions,
}) {
  return (
    <LiquidCard className="mt-6 p-7">
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: -4,
          }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/10 bg-blue-400/[0.06] text-blue-300"
        >
          <Lightbulb size={19} />
        </motion.div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300/60">
            PRIORITY ACTIONS
          </p>

          <h2 className="mt-1 text-xl font-medium text-white">
            Your next three moves
          </h2>
        </div>
      </div>

      <div className="mt-7 grid gap-3 lg:grid-cols-3">
        {actions
          .slice(0, 3)
          .map((action, index) => (
            <motion.div
              key={`${action}-${index}`}
              whileHover={{
                y: -4,
              }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-400 hover:border-blue-300/10 hover:bg-white/[0.035] hover:shadow-xl hover:shadow-black/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] font-medium text-slate-400">
                  0{index + 1}
                </span>

                <ChevronRight
                  size={16}
                  className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-blue-300"
                />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-400 transition group-hover:text-slate-300">
                {action}
              </p>
            </motion.div>
          ))}
      </div>
    </LiquidCard>
  );
}

function ATSSection({
  atsAnalysis,
  atsFeedback,
}) {
  const skillMatch =
    atsAnalysis.skill_match
      ?.match_percentage ?? 0;

  const keywordMatch =
    atsAnalysis.keyword_match
      ?.match_percentage ?? 0;

  const missingSkills =
    atsAnalysis.skill_match?.missing ||
    [];

  const missingKeywords =
    atsAnalysis.keyword_match?.missing ||
    [];

  return (
    <LiquidCard className="relative mt-6 overflow-hidden p-7 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/[0.08] blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300/70">
              <KeyRound size={13} />

              ATS analysis
            </div>

            <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-white">
              How closely do you match the role?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Your resume was compared against the skills
              and keywords extracted from the target job
              description.
            </p>
          </div>

          <motion.div
            whileHover={{
              y: -2,
            }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-3 shadow-lg shadow-black/10"
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
              ATS score
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {atsAnalysis.ats_score ?? 0}

              <span className="ml-1 text-xs font-normal text-slate-600">
                /100
              </span>
            </p>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <MatchMetric
            label="Skill match"
            value={skillMatch}
            icon={Target}
          />

          <MatchMetric
            label="Keyword match"
            value={keywordMatch}
            icon={KeyRound}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <KeywordGroup
            title="Missing skills"
            items={missingSkills}
            icon={CircleAlert}
          />

          <KeywordGroup
            title="Missing keywords"
            items={missingKeywords}
            icon={KeyRound}
          />
        </div>

        {atsFeedback.length > 0 && (
          <div className="mt-8 border-t border-white/[0.06] pt-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
              ATS feedback
            </p>

            <div className="mt-4 space-y-3">
              {atsFeedback.map(
                (item, index) => (
                  <motion.p
                    key={`${item}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.05,
                    }}
                    className="text-sm leading-6 text-slate-400"
                  >
                    {item}
                  </motion.p>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </LiquidCard>
  );
}

function MatchMetric({
  label,
  value,
  icon: Icon,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-400 hover:border-blue-300/10 hover:bg-white/[0.035]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            size={15}
            className="text-slate-600 transition group-hover:text-blue-300"
          />

          <span className="text-sm text-slate-400">
            {label}
          </span>
        </div>

        <span className="text-lg font-semibold text-white">
          {value}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${value}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.1,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400"
        />
      </div>
    </motion.div>
  );
}

function KeywordGroup({
  title,
  items,
  icon: Icon,
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className="text-slate-600"
        />

        <h3 className="text-sm font-medium text-slate-300">
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map(
            (item, index) => (
              <motion.span
                key={item}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(
                    index * 0.035,
                    0.3
                  ),
                }}
                whileHover={{
                  y: -2,
                  scale: 1.02,
                }}
                className="cursor-default rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-slate-400 shadow-sm shadow-black/10 transition hover:border-violet-300/10 hover:bg-violet-400/[0.04] hover:text-slate-300"
              >
                {item}
              </motion.span>
            )
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          Nothing missing here.
        </p>
      )}
    </div>
  );
}

function BreakdownSection({
  analysis,
}) {
  const sections = [
    [
      "Contact Information",
      analysis.breakdown?.contact,
    ],
    [
      "Structure",
      analysis.breakdown?.structure,
    ],
    [
      "Skills",
      analysis.breakdown?.skills,
    ],
    [
      "Education",
      analysis.breakdown?.education,
    ],
    [
      "Projects",
      analysis.breakdown?.projects,
    ],
    [
      "Experience",
      analysis.breakdown?.experience,
    ],
    [
      "Completeness",
      analysis.breakdown?.completeness,
    ],
  ];

  return (
    <LiquidCard className="mt-6 p-7 sm:p-8">
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: 3,
          }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/10 bg-blue-400/[0.05] text-blue-300"
        >
          <TrendingUp size={19} />
        </motion.div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
            SCORE BREAKDOWN
          </p>

          <h2 className="mt-1 text-xl font-medium text-white">
            What contributed to your score
          </h2>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {sections.map(
          ([label, section]) => (
            <BreakdownRow
              key={label}
              label={label}
              section={section}
            />
          )
        )}
      </div>
    </LiquidCard>
  );
}

function BreakdownRow({
  label,
  section,
}) {
  if (!section) {
    return null;
  }

  const score =
    section.score ?? 0;

  const maxScore =
    section.max_score ?? 0;

  const percentage =
    maxScore > 0
      ? (score / maxScore) * 100
      : 0;

  return (
    <motion.div
      whileHover={{
        x: 2,
      }}
      className="group"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm text-slate-400 transition group-hover:text-slate-300">
          {label}
        </span>

        <span className="text-sm font-medium text-white">
          {score}

          <span className="text-slate-600">
            /{maxScore}
          </span>
        </span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${percentage}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="relative h-full rounded-full bg-gradient-to-r from-blue-400/80 to-violet-400/80"
        >
          <motion.div
            animate={{
              x: [
                "-100%",
                "350%",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-sm"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function LiquidCard({
  children,
  className = "",
}) {
  const cardRef =
    useRef(null);

  const handlePointerMove = (
    event
  ) => {
    const card =
      cardRef.current;

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

  const handlePointerLeave =
    () => {
      const card =
        cardRef.current;

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
      onPointerMove={
        handlePointerMove
      }
      onPointerLeave={
        handlePointerLeave
      }
      whileHover={{
        y: -3,
      }}
      className={`glass-surface glass-highlight group relative rounded-[2rem] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function getScoreDescription(
  score
) {
  if (score >= 90) {
    return "Your resume is performing exceptionally well.";
  }

  if (score >= 80) {
    return "Your resume has a strong foundation.";
  }

  if (score >= 70) {
    return "Your resume is solid, with room for refinement.";
  }

  if (score >= 60) {
    return "Several areas could be strengthened.";
  }

  return "There are significant opportunities to improve.";
}

function getATSDescription(
  score
) {
  if (score >= 90) {
    return "Excellent alignment with the target role.";
  }

  if (score >= 80) {
    return "Strong alignment with the target role.";
  }

  if (score >= 70) {
    return "Good alignment, with some gaps to address.";
  }

  if (score >= 60) {
    return "Moderate alignment with noticeable gaps.";
  }

  return "Low alignment. Review the missing requirements.";
}

export default AnalysisResult;