import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Github, Globe, Users, Star, TrendingUp, Calendar, Code2, BookOpen, Layers, Lightbulb } from 'lucide-react'
import { getTechById } from '@/data/tech/tech-database'
import { ScoreBadge } from '@/components/tech/ScoreBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface TechDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TechDetailPage({ params }: TechDetailPageProps) {
  const { id } = await params
  const tech = getTechById(id)

  if (!tech) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/tech-stack" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回技术列表
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{tech.name}</h1>
                <Badge variant="secondary" className="text-sm">v{tech.version}</Badge>
                {tech.status === 'archived' && (
                  <Badge variant="destructive" className="text-sm">已归档</Badge>
                )}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{tech.tagline}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-xs">{tech.category}</Badge>
                <Badge variant="outline" className="text-xs">{tech.subcategory}</Badge>
                <Badge variant="outline" className="text-xs">{tech.learningCurve === 'beginner' ? '入门' : tech.learningCurve === 'intermediate' ? '进阶' : '高级'}</Badge>
              </div>
              <p className="text-gray-700 dark:text-gray-400">{tech.description}</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <ScoreBadge score={tech.scores.total} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={tech.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    官网
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={tech.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <QuickStat icon={Star} label="GitHub Stars" value={`${(tech.popularity.githubStars / 1000).toFixed(1)}k`} />
            <QuickStat icon={Calendar} label="首次发布" value={tech.createdYear} />
            <QuickStat icon={Users} label="维护者" value={tech.maintainedBy} />
            <QuickStat icon={TrendingUp} label="生态评分" value={tech.ecosystemScore} />
            <QuickStat icon={Code2} label="学习曲线" value={tech.learningCurve === 'beginner' ? '入门' : tech.learningCurve === 'intermediate' ? '进阶' : '高级'} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Layers className="w-4 h-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Code2 className="w-4 h-4 mr-2" />
              特性
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              资源
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              对比
            </TabsTrigger>
            <TabsTrigger value="usecases" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Lightbulb className="w-4 h-4 mr-2" />
              场景
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab tech={tech} />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeaturesTab tech={tech} />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <ResourcesTab tech={tech} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparisonTab tech={tech} />
          </TabsContent>

          <TabsContent value="usecases" className="space-y-6">
            <UseCasesTab tech={tech} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function QuickStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}

function OverviewTab({ tech }: { tech: NonNullable<ReturnType<typeof getTechById>> }) {
  const scoreItems = [
    { label: '流行度', value: tech.scores.popularity, color: 'bg-blue-500' },
    { label: '维护活跃度', value: tech.scores.maintenance, color: 'bg-green-500' },
    { label: '生态系统', value: tech.scores.ecosystem, color: 'bg-purple-500' },
    { label: '学习曲线', value: tech.scores.learningCurve, color: 'bg-yellow-500' },
    { label: '企业采用', value: tech.scores.enterpriseAdoption, color: 'bg-pink-500' },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            多维度评分
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-semibold">{item.value}/100</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">优点</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tech.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {pro}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">缺点</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tech.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 mt-0.5">✗</span>
                  {con}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">适用场景</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tech.bestFor.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 mt-0.5">◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400">不适用场景</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tech.notFor.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-orange-500 mt-0.5">◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {tech.companyUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>采用企业</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tech.companyUsers.map((company, i) => (
                <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                  {company}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function FeaturesTab({ tech }: { tech: NonNullable<ReturnType<typeof getTechById>> }) {
  return (
    <div className="space-y-6">
      {tech.deepDive.features.map((feature, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
            {feature.codeExample && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{feature.codeExample}</code>
              </pre>
            )}
          </CardContent>
        </Card>
      ))}

      {tech.deepDive.bestPractices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              最佳实践
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tech.deepDive.bestPractices.map((practice, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{practice.category}</h4>
                  <ul className="space-y-1">
                    {practice.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ResourcesTab({ tech }: { tech: NonNullable<ReturnType<typeof getTechById>> }) {
  const resourceTypes: Record<string, { label: string; color: string }> = {
    official: { label: '官方文档', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    tutorial: { label: '教程', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    video: { label: '视频', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    book: { label: '书籍', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    community: { label: '社区', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {tech.deepDive.resources.map((resource, i) => (
        <a
          key={i}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {resource.title}
            </h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <Badge className={`text-xs ${resourceTypes[resource.type]?.color || 'bg-gray-100'}`}>
            {resourceTypes[resource.type]?.label || resource.type}
          </Badge>
          {resource.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{resource.description}</p>
          )}
        </a>
      ))}
    </div>
  )
}

function ComparisonTab({ tech }: { tech: NonNullable<ReturnType<typeof getTechById>> }) {
  return (
    <div className="space-y-6">
      {tech.deepDive.comparisons.map((comparison, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>vs</span>
              <span className="text-blue-600 dark:text-blue-400">{comparison.techName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">优势</h4>
                <ul className="space-y-1">
                  {comparison.strengths.map((strength, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">+</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">劣势</h4>
                <ul className="space-y-1">
                  {comparison.weaknesses.map((weakness, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-red-500">-</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">何时选择 {comparison.techName}</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comparison.whenToChoose}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function UseCasesTab({ tech }: { tech: NonNullable<ReturnType<typeof getTechById>> }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {tech.deepDive.useCases.map((useCase, i) => (
          <Card key={i} className={useCase.recommended ? 'border-green-200 dark:border-green-800' : 'border-orange-200 dark:border-orange-800'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {useCase.recommended ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-orange-500">○</span>
                )}
                <span className={useCase.recommended ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}>
                  {useCase.scenario}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{useCase.description}</p>
              <Badge className={`mt-3 ${useCase.recommended ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {useCase.recommended ? '推荐使用' : '谨慎考虑'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
