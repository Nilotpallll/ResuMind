function AnalysisResult({ result, onBack }) {
    if (!result) {
      return null;
    }
  
    const analysis = result.analysis || {};
    const feedback = result.feedback || {};
    const atsAnalysis = result.ats_analysis || null;
  
    const overallScore = analysis.overall_score ?? result.overall_score ?? 0;
    const atsScore = atsAnalysis?.ats_score ?? result.ats_score;
  
    const strengths = feedback.strengths || [];
    const improvements = feedback.improvements || [];
    const atsFeedback = feedback.ats_feedback || [];
    const priorityActions = feedback.priority_actions || [];
  
    return (
      <section className="w-full">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-slate-500">
              Analysis Complete
            </p>
  
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Resume Analysis
            </h2>
  
            <p className="mt-2 text-sm text-slate-400">
              {result.filename || "Resume"}
            </p>
          </div>
  
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Analyze Another Resume
          </button>
        </div>
  
        <div className="grid gap-4 sm:grid-cols-2">
          <ScoreCard
            label="Resume Score"
            score={overallScore}
            description="Overall resume quality"
          />
  
          <ScoreCard
            label="ATS Score"
            score={atsScore}
            description={
              atsScore !== null && atsScore !== undefined
                ? "Match with job requirements"
                : "No job description provided"
            }
          />
        </div>
  
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FeedbackCard
            title="Strengths"
            items={strengths}
            emptyMessage="No specific strengths were identified."
          />
  
          <FeedbackCard
            title="Improvements"
            items={improvements}
            emptyMessage="No major improvements were identified."
          />
        </div>
  
        {priorityActions.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                Recommended Next Steps
              </p>
  
              <h3 className="mt-2 text-lg font-medium text-white">
                Prioritize these improvements
              </h3>
            </div>
  
            <div className="space-y-3">
              {priorityActions.map((action, index) => (
                <div
                  key={`${action}-${index}`}
                  className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                    {index + 1}
                  </span>
  
                  <p className="text-sm leading-6 text-slate-300">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {atsAnalysis && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                ATS Analysis
              </p>
  
              <h3 className="mt-2 text-lg font-medium text-white">
                Job Description Alignment
              </h3>
            </div>
  
            <div className="grid gap-4 sm:grid-cols-2">
              <MatchCard
                label="Skill Match"
                value={atsAnalysis.skill_match?.match_percentage}
              />
  
              <MatchCard
                label="Keyword Match"
                value={atsAnalysis.keyword_match?.match_percentage}
              />
            </div>
  
            {atsAnalysis.skill_match?.missing?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white">
                  Missing Skills
                </h4>
  
                <div className="mt-3 flex flex-wrap gap-2">
                  {atsAnalysis.skill_match.missing.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
  
            {atsAnalysis.keyword_match?.missing?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white">
                  Missing Keywords
                </h4>
  
                <div className="mt-3 flex flex-wrap gap-2">
                  {atsAnalysis.keyword_match.missing.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
  
            {atsFeedback.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-6">
                <h4 className="text-sm font-medium text-white">
                  ATS Feedback
                </h4>
  
                <div className="mt-3 space-y-3">
                  {atsFeedback.map((item, index) => (
                    <p
                      key={`${item}-${index}`}
                      className="text-sm leading-6 text-slate-400"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
  
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-5">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Score Breakdown
            </p>
  
            <h3 className="mt-2 text-lg font-medium text-white">
              Resume Evaluation
            </h3>
          </div>
  
          <div className="space-y-4">
            <BreakdownRow
              label="Contact Information"
              section={analysis.breakdown?.contact}
            />
  
            <BreakdownRow
              label="Structure"
              section={analysis.breakdown?.structure}
            />
  
            <BreakdownRow
              label="Skills"
              section={analysis.breakdown?.skills}
            />
  
            <BreakdownRow
              label="Education"
              section={analysis.breakdown?.education}
            />
  
            <BreakdownRow
              label="Projects"
              section={analysis.breakdown?.projects}
            />
  
            <BreakdownRow
              label="Experience"
              section={analysis.breakdown?.experience}
            />
  
            <BreakdownRow
              label="Completeness"
              section={analysis.breakdown?.completeness}
            />
          </div>
        </div>
      </section>
    );
  }
  
  function ScoreCard({ label, score, description }) {
    const hasScore = score !== null && score !== undefined;
  
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-sm text-slate-500">
          {label}
        </p>
  
        <div className="mt-4 flex items-end gap-2">
          <span className="text-5xl font-semibold tracking-tight text-white">
            {hasScore ? score : "—"}
          </span>
  
          {hasScore && (
            <span className="mb-1 text-sm text-slate-500">
              /100
            </span>
          )}
        </div>
  
        <p className="mt-3 text-sm text-slate-500">
          {description}
        </p>
      </div>
    );
  }
  
  function FeedbackCard({ title, items, emptyMessage }) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="text-lg font-medium text-white">
          {title}
        </h3>
  
        {items.length > 0 ? (
          <div className="mt-5 space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-3"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
  
                <p className="text-sm leading-6 text-slate-400">
                  {item}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            {emptyMessage}
          </p>
        )}
      </div>
    );
  }
  
  function MatchCard({ label, value }) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
        <p className="text-xs uppercase tracking-widest text-slate-600">
          {label}
        </p>
  
        <p className="mt-3 text-2xl font-semibold text-white">
          {value ?? 0}%
        </p>
      </div>
    );
  }
  
  function BreakdownRow({ label, section }) {
    if (!section) {
      return null;
    }
  
    const score = section.score ?? 0;
    const maxScore = section.max_score ?? 0;
  
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {label}
          </span>
  
          <span className="text-sm font-medium text-white">
            {score}/{maxScore}
          </span>
        </div>
  
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{
              width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    );
  }
  
  export default AnalysisResult;