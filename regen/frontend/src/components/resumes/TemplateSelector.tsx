import { Check, Layout, FileText, Sparkles, Briefcase, Palette } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ResumeTemplate } from '@/types/resume'

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate
  onSelect: (template: ResumeTemplate) => void
}

interface TemplateOption {
  id: ResumeTemplate
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const templates: TemplateOption[] = [
  {
    id: 'modern',
    name: '现代风格',
    description: '简洁现代的设计，适合科技和创意行业',
    icon: <Layout className="h-6 w-6" />,
    color: 'bg-blue-500',
  },
  {
    id: 'classic',
    name: '经典风格',
    description: '传统经典的布局，适合金融和法律行业',
    icon: <FileText className="h-6 w-6" />,
    color: 'bg-slate-600',
  },
  {
    id: 'minimal',
    name: '极简风格',
    description: '极简主义风格，突出内容本身',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'bg-zinc-500',
  },
  {
    id: 'professional',
    name: '专业风格',
    description: '专业商务风格，适合各类正式场合',
    icon: <Briefcase className="h-6 w-6" />,
    color: 'bg-emerald-600',
  },
  {
    id: 'creative',
    name: '创意风格',
    description: '富有创意的设计，适合设计和艺术行业',
    icon: <Palette className="h-6 w-6" />,
    color: 'bg-purple-600',
  },
]

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            'border-2',
            selectedTemplate === template.id
              ? 'border-primary shadow-md'
              : 'border-transparent hover:border-muted'
          )}
          onClick={() => onSelect(template.id)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Template Preview Icon */}
              <div
                className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center text-white',
                  template.color
                )}
              >
                {template.icon}
              </div>

              {/* Template Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Selection Indicator */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedTemplate === template.id
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {selectedTemplate === template.id && (
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default TemplateSelector
