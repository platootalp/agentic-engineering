import React, { useState } from 'react';
import type { CreateJobRequest, JobSource } from '../../types/job';

interface JobFormProps {
  onSubmit: (data: CreateJobRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const sourceOptions: { value: JobSource; label: string }[] = [
  { value: 'manual', label: '手动录入' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'boss', label: 'Boss直聘' },
  { value: 'lagou', label: '拉勾网' },
  { value: 'other', label: '其他' },
];

export const JobForm: React.FC<JobFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateJobRequest>({
    companyName: '',
    position: '',
    location: '',
    salary: '',
    description: '',
    source: 'manual',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateJobRequest, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateJobRequest, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '请输入公司名称';
    }
    if (!formData.position.trim()) {
      newErrors.position = '请输入职位名称';
    }
    if (!formData.location.trim()) {
      newErrors.location = '请输入工作地点';
    }
    if (!formData.salary.trim()) {
      newErrors.salary = '请输入薪资范围';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入JD原文';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateJobRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const inputClass = (fieldName: keyof CreateJobRequest) => `
    w-full px-4 py-2.5 rounded-lg border bg-white
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500
    ${errors[fieldName]
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200 hover:border-slate-300'
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            公司名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="例如：阿里巴巴"
            className={inputClass('companyName')}
          />
          {errors.companyName && (
            <p className="mt-1.5 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            职位名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="例如：高级前端工程师"
            className={inputClass('position')}
          />
          {errors.position && (
            <p className="mt-1.5 text-sm text-red-600">{errors.position}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            工作地点 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="例如：杭州·西湖区"
            className={inputClass('location')}
          />
          {errors.location && (
            <p className="mt-1.5 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            薪资范围 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="例如：25k-40k·14薪"
            className={inputClass('salary')}
          />
          {errors.salary && (
            <p className="mt-1.5 text-sm text-red-600">{errors.salary}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          来源渠道
        </label>
        <select
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white
                     transition-all duration-200 ease-out
                     focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500
                     cursor-pointer"
        >
          {sourceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          JD原文 <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={12}
          placeholder="请粘贴完整的职位描述..."
          className={`${inputClass('description')} resize-y min-h-[200px] font-mono text-sm`}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          提示：详细的JD原文有助于AI进行更准确的分析
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg text-slate-600 font-medium
                       transition-all duration-200 ease-out
                       hover:bg-slate-100 hover:text-slate-800
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-medium
                     transition-all duration-200 ease-out
                     hover:bg-sky-700 hover:shadow-md hover:shadow-sky-500/25
                     active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              提交中...
            </>
          ) : (
            '创建职位'
          )}
        </button>
      </div>
    </form>
  );
};
