import React from 'react';
import type { JobAnalysis } from '../../types/job';

interface JobAnalysisResultProps {
  analysis: JobAnalysis | null;
  isAnalyzing?: boolean;
}

export const JobAnalysisResult: React.FC<JobAnalysisResultProps> = ({
  analysis,
  isAnalyzing = false,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl border border-sky-100 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">AI正在分析中...</h3>
          <p className="text-slate-500 text-center max-w-sm">
            正在提取技能要求、经验水平等关键信息，请稍候
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">尚未分析</h3>
          <p className="text-slate-500 max-w-sm">
            点击"开始分析"按钮，AI将自动提取职位关键信息
          </p>
        </div>
      </div>
    );
  }

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
    title,
    icon,
    children,
  }) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sky-600">{icon}</span>
        <h4 className="font-semibold text-slate-800">{title}</h4>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );

  const TagList: React.FC<{ items: string[]; color?: 'blue' | 'green' | 'purple' | 'amber' }> = ({
    items,
    color = 'blue',
  }) => {
    const colorClasses = {
      blue: 'bg-sky-50 text-sky-700 border-sky-200',
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      purple: 'bg-violet-50 text-violet-700 border-violet-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colorClasses[color]}`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI分析结果</h3>
              <p className="text-sky-100 text-sm">
                分析于 {new Date(analysis.analyzedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Section
          title="技能要求"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        >
          <TagList items={analysis.skills} color="blue" />
        </Section>

        <Section
          title="岗位要求"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <ul className="space-y-2">
            {analysis.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="工作职责"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          <ul className="space-y-2">
            {analysis.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">经验要求</p>
            <p className="font-medium text-slate-800">{analysis.experienceLevel}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">学历要求</p>
            <p className="font-medium text-slate-800">{analysis.educationRequirement}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
