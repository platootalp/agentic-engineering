import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Pencil, Sparkles, Trash2, Loader2, MapPin, Banknote, Building2 } from 'lucide-react';
import type { Job } from '@/types/job';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onClick?: (job: Job) => void;
  onDelete?: (jobId: string) => void;
  onAnalyze?: (jobId: string) => void;
}

const sourceConfig: Record<string, { label: string; icon: string; color: string }> = {
  manual: {
    label: '手动录入',
    icon: '✏️',
    color: 'from-slate-400 to-slate-500',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-500 to-blue-600',
  },
  indeed: {
    label: 'Indeed',
    icon: '🔍',
    color: 'from-orange-400 to-orange-500',
  },
  boss: {
    label: 'Boss直聘',
    icon: '🎯',
    color: 'from-emerald-400 to-emerald-500',
  },
  lagou: {
    label: '拉勾网',
    icon: '🚀',
    color: 'from-indigo-400 to-indigo-500',
  },
  other: {
    label: '其他',
    icon: '📋',
    color: 'from-gray-400 to-gray-500',
  },
};

const statusConfig: Record<string, { label: string; gradient: string; textColor: string; glowColor: string }> = {
  pending: {
    label: '待分析',
    gradient: 'from-amber-400/20 to-orange-400/20',
    textColor: 'text-amber-700',
    glowColor: 'shadow-amber-500/20',
  },
  analyzing: {
    label: '分析中',
    gradient: 'from-blue-400/20 to-cyan-400/20',
    textColor: 'text-blue-700',
    glowColor: 'shadow-blue-500/20',
  },
  analyzed: {
    label: '已分析',
    gradient: 'from-emerald-400/20 to-teal-400/20',
    textColor: 'text-emerald-700',
    glowColor: 'shadow-emerald-500/20',
  },
  error: {
    label: '分析失败',
    gradient: 'from-red-400/20 to-rose-400/20',
    textColor: 'text-red-700',
    glowColor: 'shadow-red-500/20',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes === 0 ? '刚刚' : `${diffMinutes}分钟前`;
    }
    return `${diffHours}小时前`;
  }
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, onDelete, onAnalyze }) => {
  const status = statusConfig[job.status] || statusConfig.pending;
  const source = sourceConfig[job.source] || sourceConfig.other;

  return (
    <GlassCard
      glow="primary"
      className="group relative overflow-hidden cursor-pointer h-full"
      onClick={() => onClick?.(job)}
    >
      {/* Status Glow Effect */}
      <div
        className={cn(
          'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          status.glowColor
        )}
      />

      <div className="relative p-6 flex flex-col h-full">
        {/* Header: Company & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm shadow-sm',
                  source.color
                )}
              >
                {source.icon}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {source.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-700 transition-colors duration-300">
              {job.position}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-slate-600 font-medium text-sm truncate">
                {job.companyName}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gradient-to-r shadow-sm',
              status.gradient,
              status.textColor
            )}
          >
            {job.status === 'analyzing' ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {status.label}
              </span>
            ) : (
              status.label
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{job.location || '未指定地点'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-slate-700">
              {job.salary || '薪资面议'}
            </span>
          </div>
        </div>

        {/* Footer: Date & Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {formatDate(job.createdAt)}
            </span>

            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="flex items-center gap-1">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.1 }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.(job);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.1 }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 delay-75"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnalyze?.(job.id);
                  }}
                  disabled={job.status === 'analyzing'}
                >
                  {job.status === 'analyzing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.1 }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 delay-100"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/jobs/${job.id}/edit`;
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.1 }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 delay-150"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(job.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default JobCard;
