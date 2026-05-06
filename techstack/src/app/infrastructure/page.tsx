'use client'

import { TechCategoryCard } from '@/components/tech'
import type { TechCategory } from '@/data/tech/types'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

const techCategories: TechCategory[] = [
  {
    id: 'database',
    name: '数据库',
    icon: '🗄️',
    color: '#3B82F6',
    problem: '数据存储',
    description: '关系型和NoSQL数据库,提供高可用、高性能的数据存储方案。',
    mainstream: [
      { name: 'PostgreSQL', description: '功能强大的关系型数据库', popularity: 'high' },
      { name: 'MySQL', description: '最流行的开源数据库', popularity: 'high' },
      { name: 'MongoDB', description: '文档型NoSQL数据库', popularity: 'high' },
      { name: 'Redis', description: '高性能内存数据库', popularity: 'high' },
      { name: 'CockroachDB', description: '分布式SQL数据库', popularity: 'rising' },
      { name: 'PlanetScale', description: 'MySQL托管服务', popularity: 'rising' },
    ]
  },
  {
    id: 'queue',
    name: '消息队列',
    icon: '📨',
    color: '#2563EB',
    problem: '异步通信',
    description: '提供可靠的消息传递和事件驱动架构支持。',
    mainstream: [
      { name: 'Kafka', description: '分布式流处理平台', popularity: 'high' },
      { name: 'RabbitMQ', description: '功能丰富的消息代理', popularity: 'high' },
      { name: 'NATS', description: '云原生消息系统', popularity: 'rising' },
      { name: 'Redis Streams', description: 'Redis消息流', popularity: 'medium' },
      { name: 'Pulsar', description: '云原生消息队列', popularity: 'medium' },
    ]
  },
  {
    id: 'search',
    name: '搜索引擎',
    icon: '🔍',
    color: '#1D4ED8',
    problem: '全文检索',
    description: '提供强大的全文搜索和数据分析能力。',
    mainstream: [
      { name: 'Elasticsearch', description: '分布式搜索引擎', popularity: 'high' },
      { name: 'Meilisearch', description: '开箱即用的搜索引擎', popularity: 'rising' },
      { name: 'Typesense', description: '快速即时搜索', popularity: 'rising' },
      { name: 'Algolia', description: '托管搜索服务', popularity: 'medium' },
      { name: 'OpenSearch', description: 'ES开源分支', popularity: 'medium' },
    ]
  },
  {
    id: 'container',
    name: '容器编排',
    icon: '🐳',
    color: '#1E40AF',
    problem: '云原生部署',
    description: '容器化应用的编排、调度和管理平台。',
    mainstream: [
      { name: 'Kubernetes', description: '容器编排标准', popularity: 'high' },
      { name: 'Docker', description: '容器引擎', popularity: 'high' },
      { name: 'Docker Compose', description: '多容器编排', popularity: 'high' },
      { name: 'Podman', description: '无守护进程容器', popularity: 'medium' },
      { name: 'Nomad', description: 'HashiCorp编排工具', popularity: 'medium' },
    ]
  },
  {
    id: 'serverless',
    name: 'Serverless',
    icon: '⚡',
    color: '#3B82F6',
    problem: '边缘计算',
    description: '无服务器架构,按需计费,快速部署。',
    mainstream: [
      { name: 'Vercel', description: '前端部署平台', popularity: 'high' },
      { name: 'Cloudflare Workers', description: '边缘计算平台', popularity: 'high' },
      { name: 'AWS Lambda', description: 'AWS函数计算', popularity: 'high' },
      { name: 'Fly.io', description: '全球应用部署', popularity: 'rising' },
      { name: 'Deno Deploy', description: 'Deno边缘计算', popularity: 'medium' },
    ]
  },
  {
    id: 'monitoring',
    name: '可观测性',
    icon: '📊',
    color: '#2563EB',
    problem: '监控告警',
    description: '提供指标监控、日志收集和分布式追踪能力。',
    mainstream: [
      { name: 'Prometheus', description: '时序数据库和监控', popularity: 'high' },
      { name: 'Grafana', description: '可视化平台', popularity: 'high' },
      { name: 'Jaeger', description: '分布式追踪', popularity: 'medium' },
      { name: 'OpenTelemetry', description: '可观测性标准', popularity: 'rising' },
      { name: 'Datadog', description: '全栈监控平台', popularity: 'high' },
    ]
  },
  {
    id: 'cicd',
    name: 'CI/CD',
    icon: '🔄',
    color: '#1D4ED8',
    problem: '自动化部署',
    description: '持续集成和持续部署,自动化软件交付流程。',
    mainstream: [
      { name: 'GitHub Actions', description: 'GitHub原生CI/CD', popularity: 'high' },
      { name: 'GitLab CI', description: 'GitLab集成CI/CD', popularity: 'high' },
      { name: 'Jenkins', description: '经典CI/CD工具', popularity: 'high' },
      { name: 'ArgoCD', description: 'GitOps持续部署', popularity: 'rising' },
      { name: 'CircleCI', description: '云原生CI/CD', popularity: 'medium' },
    ]
  },
  {
    id: 'iac',
    name: '基础设施即代码',
    icon: '⚙️',
    color: '#1E40AF',
    problem: 'IaC自动化',
    description: '通过代码管理和配置基础设施资源。',
    mainstream: [
      { name: 'Terraform', description: 'HashiCorp IaC工具', popularity: 'high' },
      { name: 'Pulumi', description: '现代IaC平台', popularity: 'rising' },
      { name: 'AWS CDK', description: 'AWS云开发工具包', popularity: 'medium' },
      { name: 'Ansible', description: '自动化配置管理', popularity: 'high' },
      { name: 'Crossplane', description: 'K8s原生IaC', popularity: 'rising' },
    ]
  },
  {
    id: 'cdn',
    name: 'CDN & 边缘',
    icon: '🌐',
    color: '#3B82F6',
    problem: '内容分发',
    description: '全球内容分发网络,加速静态资源访问。',
    mainstream: [
      { name: 'Cloudflare', description: '全球CDN领导者', popularity: 'high' },
      { name: 'AWS CloudFront', description: 'AWS CDN服务', popularity: 'high' },
      { name: 'Vercel Edge', description: 'Vercel边缘网络', popularity: 'rising' },
      { name: 'Fastly', description: '实时CDN平台', popularity: 'medium' },
      { name: 'BunnyCDN', description: '高性价比CDN', popularity: 'medium' },
    ]
  },
  {
    id: 'nosql',
    name: 'NoSQL数据库',
    icon: '📄',
    color: '#1D4ED8',
    problem: '文档存储',
    description: '提供灵活的文档型和列式数据库。',
    mainstream: [
      { name: 'MongoDB', description: '文档型数据库', popularity: 'high' },
      { name: 'DynamoDB', description: 'AWS NoSQL', popularity: 'high' },
      { name: 'Cassandra', description: '分布式列式', popularity: 'medium' },
      { name: 'ScyllaDB', description: 'Cassandra兼容', popularity: 'medium' },
    ]
  },
  {
    id: 'timeseries',
    name: '时序数据库',
    icon: '📈',
    color: '#2563EB',
    problem: '监控指标',
    description: '专为时序数据优化的数据库。',
    mainstream: [
      { name: 'InfluxDB', description: '时序数据库', popularity: 'high' },
      { name: 'TimescaleDB', description: 'PostgreSQL扩展', popularity: 'high' },
      { name: 'Prometheus', description: '监控时序库', popularity: 'high' },
      { name: 'QuestDB', description: '高性能时序', popularity: 'rising' },
    ]
  },
  {
    id: 'storage',
    name: '对象存储',
    icon: '💾',
    color: '#1E40AF',
    problem: '文件存储',
    description: '提供海量文件对象存储能力。',
    mainstream: [
      { name: 'AWS S3', description: '对象存储标准', popularity: 'high' },
      { name: 'MinIO', description: '开源S3兼容', popularity: 'high' },
      { name: 'Cloudflare R2', description: '零出口费用', popularity: 'rising' },
      { name: 'Google Cloud Storage', description: 'GCP对象存储', popularity: 'medium' },
    ]
  },
  {
    id: 'gateway',
    name: 'API网关',
    icon: '🚪',
    color: '#3B82F6',
    problem: 'API管理',
    description: '提供API路由、认证和限流能力。',
    mainstream: [
      { name: 'Kong', description: '微服务网关', popularity: 'high' },
      { name: 'Traefik', description: '云原生网关', popularity: 'high' },
      { name: 'Nginx', description: '反向代理', popularity: 'high' },
      { name: 'Envoy', description: 'Service Mesh代理', popularity: 'medium' },
      { name: 'APISIX', description: 'Apache网关', popularity: 'medium' },
    ]
  },
  {
    id: 'loadbalancer',
    name: '负载均衡',
    icon: '⚖️',
    color: '#2563EB',
    problem: '流量分发',
    description: '提供流量分发和负载均衡能力。',
    mainstream: [
      { name: 'Nginx', description: '高性能负载均衡', popularity: 'high' },
      { name: 'HAProxy', description: 'TCP/HTTP负载均衡', popularity: 'high' },
      { name: 'Traefik', description: '云原生负载均衡', popularity: 'medium' },
      { name: 'Envoy', description: 'L7代理', popularity: 'medium' },
    ]
  },
  {
    id: 'logging',
    name: '日志管理',
    icon: '📋',
    color: '#1D4ED8',
    problem: '日志收集',
    description: '提供日志收集、存储和分析能力。',
    mainstream: [
      { name: 'ELK Stack', description: 'Elasticsearch+Logstash+Kibana', popularity: 'high' },
      { name: 'Loki', description: 'Grafana日志', popularity: 'rising' },
      { name: 'Datadog Logs', description: '托管日志服务', popularity: 'medium' },
      { name: 'Fluentd', description: '日志收集器', popularity: 'medium' },
    ]
  },
  {
    id: 'api',
    name: 'API协议',
    icon: '🔌',
    color: '#1E40AF',
    problem: 'API设计',
    description: '不同的API通信协议和风格。',
    mainstream: [
      { name: 'REST', description: 'RESTful API', popularity: 'high' },
      { name: 'GraphQL', description: '查询语言', popularity: 'high' },
      { name: 'tRPC', description: '端到端类型安全', popularity: 'rising' },
      { name: 'gRPC', description: 'RPC框架', popularity: 'high' },
      { name: 'WebSocket', description: '双向通信', popularity: 'high' },
    ]
  },
  {
    id: 'mesh',
    name: '服务网格',
    icon: '🕸️',
    color: '#3B82F6',
    problem: '微服务治理',
    description: '提供服务间通信、可观测性和安全。',
    mainstream: [
      { name: 'Istio', description: '功能完整的网格', popularity: 'high' },
      { name: 'Linkerd', description: '轻量级网格', popularity: 'medium' },
      { name: 'Consul Connect', description: 'HashiCorp网格', popularity: 'medium' },
      { name: 'Kuma', description: 'Kong网格', popularity: 'medium' },
    ]
  },
  {
    id: 'config',
    name: '配置中心',
    icon: '⚙️',
    color: '#2563EB',
    problem: '配置管理',
    description: '提供分布式配置管理能力。',
    mainstream: [
      { name: 'Consul', description: 'HashiCorp配置', popularity: 'high' },
      { name: 'Etcd', description: '分布式配置', popularity: 'high' },
      { name: 'Nacos', description: '阿里配置中心', popularity: 'medium' },
      { name: 'Apollo', description: '携程配置中心', popularity: 'medium' },
    ]
  },
  {
    id: 'secrets',
    name: '密钥管理',
    icon: '🔑',
    color: '#1D4ED8',
    problem: '密钥安全',
    description: '提供密钥和证书管理能力。',
    mainstream: [
      { name: 'HashiCorp Vault', description: '密钥管理标准', popularity: 'high' },
      { name: 'AWS Secrets Manager', description: 'AWS密钥管理', popularity: 'high' },
      { name: 'Azure Key Vault', description: 'Azure密钥', popularity: 'medium' },
      { name: 'Infisical', description: '开源密钥管理', popularity: 'rising' },
    ]
  },
]

export default function InfrastructureStack() {
  const {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(techCategories, { initialPageSize: 10 })

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">基础设施技术栈</h1>
          <p className="page-subtitle">
            云原生、DevOps、微服务 - 现代应用基础设施全景
          </p>
        </div>

        <div className="legend-container">
          <div className="legend-item">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-400">主流 - 广泛采用</span>
          </div>
          <div className="legend-item">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-400">常用 - 稳定使用</span>
          </div>
          <div className="legend-item">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-400">新星 - 快速崛起</span>
          </div>
        </div>

        <div className="tech-grid">
          {currentData.map((category) => (
            <TechCategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-8">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            pageSizeOptions={pageSizeOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        <div className="footer-note">
          <p className="text-sm text-slate-500 m-0">
            💡 点击卡片可展开查看更多技术 | 基础设施选型直接影响系统的可靠性、可扩展性和运维成本
          </p>
        </div>
      </div>
    </div>
  )
}
