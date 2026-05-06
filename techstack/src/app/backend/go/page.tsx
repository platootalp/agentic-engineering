'use client'

import { useState } from 'react'

interface TechItem {
  name: string
  description: string
  popularity: 'high' | 'medium' | 'rising'
}

interface TechCategory {
  id: string
  name: string
  icon: string
  color: string
  problem: string
  description: string
  mainstream: TechItem[]
}

const techCategories: TechCategory[] = [
  {
    id: 'framework',
    name: 'Web框架',
    icon: '🚀',
    color: '#06B6D4',
    problem: '高性能微服务',
    description: '专为高并发设计的Web框架,提供高性能HTTP服务和微服务解决方案。',
    mainstream: [
      { name: 'Gin', description: '高性能,API简洁', popularity: 'high' },
      { name: 'Echo', description: '轻量级,扩展性强', popularity: 'high' },
      { name: 'Fiber', description: 'Express风格,极速', popularity: 'high' },
      { name: 'Chi', description: '轻量级路由器', popularity: 'medium' },
      { name: 'Go-Zero', description: '微服务框架,工具链完整', popularity: 'rising' },
      { name: 'Hertz', description: '字节跳动开源,高性能', popularity: 'rising' },
    ]
  },
  {
    id: 'orm',
    name: 'ORM框架',
    icon: '💾',
    color: '#0EA5E9',
    problem: '数据库操作',
    description: '提供类型安全的数据库操作,支持复杂查询和关系映射。',
    mainstream: [
      { name: 'GORM', description: '功能完整,社区活跃', popularity: 'high' },
      { name: 'Ent', description: 'Facebook出品,图模型', popularity: 'rising' },
      { name: 'sqlx', description: '扩展标准库,简洁', popularity: 'high' },
      { name: 'Bun', description: '高性能,现代设计', popularity: 'rising' },
      { name: 'sqlc', description: '编译期类型安全', popularity: 'medium' },
    ]
  },
  {
    id: 'validation',
    name: '数据验证',
    icon: '✓',
    color: '#0891B2',
    problem: '输入验证',
    description: '提供结构体验证和数据校验能力,确保数据合法性。',
    mainstream: [
      { name: 'go-playground/validator', description: '标签验证,功能强大', popularity: 'high' },
      { name: 'ozzo-validation', description: '代码优先验证', popularity: 'medium' },
      { name: 'govalidator', description: '简单易用', popularity: 'medium' },
    ]
  },
  {
    id: 'auth',
    name: '认证授权',
    icon: '🔐',
    color: '#06B6D4',
    problem: '安全认证',
    description: '提供JWT、OAuth2等认证方案和权限控制能力。',
    mainstream: [
      { name: 'golang-jwt', description: 'JWT标准实现', popularity: 'high' },
      { name: 'casbin', description: '权限管理,灵活强大', popularity: 'high' },
      { name: 'go-oauth2', description: 'OAuth2服务端', popularity: 'medium' },
      { name: 'goth', description: '多平台OAuth', popularity: 'medium' },
    ]
  },
  {
    id: 'microservice',
    name: '微服务',
    icon: '🔧',
    color: '#22D3EE',
    problem: '服务间通信',
    description: '提供微服务开发框架和RPC通信协议支持。',
    mainstream: [
      { name: 'gRPC', description: 'Google RPC框架', popularity: 'high' },
      { name: 'Go-Zero', description: '微服务工具链', popularity: 'rising' },
      { name: 'Kit', description: '微服务工具包', popularity: 'medium' },
      { name: 'Kratos', description: 'B站微服务框架', popularity: 'rising' },
      { name: 'Dubbo-go', description: 'Dubbo Go实现', popularity: 'medium' },
    ]
  },
  {
    id: 'concurrent',
    name: '并发编程',
    icon: '⚡',
    color: '#67E8F9',
    problem: '高并发处理',
    description: 'Go语言的核心优势,提供goroutine和channel原生支持。',
    mainstream: [
      { name: 'Goroutine', description: '轻量级协程', popularity: 'high' },
      { name: 'Channel', description: '协程通信', popularity: 'high' },
      { name: 'errgroup', description: '并发错误处理', popularity: 'high' },
      { name: 'sync包', description: '同步原语', popularity: 'high' },
      { name: 'ants', description: '协程池', popularity: 'medium' },
    ]
  },
  {
    id: 'cache',
    name: '缓存方案',
    icon: '💨',
    color: '#06B6D4',
    problem: '性能优化',
    description: '提供多种缓存策略和实现,提升应用性能。',
    mainstream: [
      { name: 'go-redis', description: 'Redis客户端', popularity: 'high' },
      { name: 'ristretto', description: '高性能缓存', popularity: 'rising' },
      { name: 'bigcache', description: '大容量缓存', popularity: 'medium' },
      { name: 'go-cache', description: '内存缓存', popularity: 'medium' },
      { name: 'groupcache', description: '分布式缓存', popularity: 'medium' },
    ]
  },
  {
    id: 'logging',
    name: '日志框架',
    icon: '📝',
    color: '#0EA5E9',
    problem: '日志记录',
    description: '提供高性能日志记录能力,支持结构化日志和日志轮转。',
    mainstream: [
      { name: 'zap', description: 'Uber出品,极速', popularity: 'high' },
      { name: 'logrus', description: '结构化日志', popularity: 'high' },
      { name: 'zerolog', description: '零分配日志', popularity: 'medium' },
      { name: 'slog', description: 'Go 1.21+标准库', popularity: 'rising' },
      { name: 'lumberjack', description: '日志轮转', popularity: 'medium' },
    ]
  },
  {
    id: 'testing',
    name: '测试工具',
    icon: '🧪',
    color: '#06B6D4',
    problem: '代码质量',
    description: '提供单元测试、Mock和集成测试能力。',
    mainstream: [
      { name: 'go test', description: 'Go内置测试', popularity: 'high' },
      { name: 'Testify', description: '断言和Mock', popularity: 'high' },
      { name: 'Ginkgo', description: 'BDD测试框架', popularity: 'medium' },
      { name: 'mockery', description: 'Mock生成器', popularity: 'medium' },
      { name: 'testcontainers-go', description: '容器化测试', popularity: 'rising' },
    ]
  },
  {
    id: 'docs',
    name: '文档生成',
    icon: '📚',
    color: '#22D3EE',
    problem: 'API文档',
    description: '自动生成API文档和Swagger规范。',
    mainstream: [
      { name: 'Swag', description: 'Swagger注解', popularity: 'high' },
      { name: 'go-swagger', description: 'OpenAPI工具', popularity: 'high' },
      { name: 'OpenAPI', description: 'API规范', popularity: 'high' },
      { name: 'Hertz Swagger', description: '字节Swagger', popularity: 'medium' },
    ]
  },
  {
    id: 'cli',
    name: 'CLI工具',
    icon: '⌨️',
    color: '#0891B2',
    problem: '命令行开发',
    description: '提供命令行工具开发框架。',
    mainstream: [
      { name: 'Cobra', description: 'CLI框架标准', popularity: 'high' },
      { name: 'urfave/cli', description: '简单CLI框架', popularity: 'high' },
      { name: 'Kong', description: '声明式CLI', popularity: 'medium' },
      { name: 'mow.cli', description: 'POSIX风格CLI', popularity: 'medium' },
    ]
  },
  {
    id: 'discovery',
    name: '服务发现',
    icon: '🔍',
    color: '#06B6D4',
    problem: '服务注册',
    description: '提供服务注册与发现能力。',
    mainstream: [
      { name: 'Consul', description: 'HashiCorp服务发现', popularity: 'high' },
      { name: 'Etcd', description: '分布式键值存储', popularity: 'high' },
      { name: 'Nacos', description: '阿里服务发现', popularity: 'medium' },
      { name: 'Zookeeper', description: '分布式协调', popularity: 'medium' },
    ]
  },
  {
    id: 'mq',
    name: '消息队列',
    icon: '📨',
    color: '#0EA5E9',
    problem: '异步消息',
    description: '提供消息队列客户端支持。',
    mainstream: [
      { name: 'sarama', description: 'Kafka客户端', popularity: 'high' },
      { name: 'NATS.go', description: 'NATS客户端', popularity: 'high' },
      { name: 'RabbitMQ Go', description: 'RabbitMQ客户端', popularity: 'medium' },
      { name: 'RocketMQ Client', description: 'RocketMQ客户端', popularity: 'medium' },
    ]
  },
  {
    id: 'deployment',
    name: '部署运行',
    icon: '🚀',
    color: '#22D3EE',
    problem: '生产部署',
    description: '提供生产环境部署方案。',
    mainstream: [
      { name: 'Docker', description: '容器化部署', popularity: 'high' },
      { name: 'Kubernetes', description: '容器编排', popularity: 'high' },
      { name: 'Systemd', description: 'Linux系统服务', popularity: 'medium' },
      { name: 'Supervisor', description: '进程管理', popularity: 'medium' },
    ]
  },
]

const PopularityBadge = ({ popularity }: { popularity: 'high' | 'medium' | 'rising' }) => {
  const styles = {
    high: { bg: '#10B98115', text: '#10B981', label: '主流' },
    medium: { bg: '#F59E0B15', text: '#F59E0B', label: '常用' },
    rising: { bg: '#8B5CF615', text: '#8B5CF6', label: '新星' },
  }
  const style = styles[popularity]

  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 500,
      backgroundColor: style.bg,
      color: style.text,
    }}>
      {style.label}
    </span>
  )
}

const TechCard = ({ category }: { category: TechCategory }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${category.color}30`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${category.color}, ${category.color}80)`,
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '32px' }}>{category.icon}</span>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: '#fff',
          }}>{category.name}</h3>
          <span style={{
            fontSize: '13px',
            color: category.color,
            fontWeight: 500,
          }}>{category.problem}</span>
        </div>
      </div>

      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: 1.6,
      }}>{category.description}</p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {category.mainstream.slice(0, isExpanded ? undefined : 3).map((tech) => (
          <div
            key={tech.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff08',
              borderRadius: '8px',
              border: '1px solid #ffffff10',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#fff',
            }}>{tech.name}</span>
            <PopularityBadge popularity={tech.popularity} />
          </div>
        ))}
      </div>

      {category.mainstream.length > 3 && (
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span>{isExpanded ? '收起' : `展开更多 (${category.mainstream.length - 3}项)`}</span>
          <span style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
          }}>▼</span>
        </div>
      )}
    </div>
  )
}

export default function GoStack() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f1a1a 0%, #0f2e2e 50%, #0f1a1a 100%)',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 48px auto',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #22D3EE, #06B6D4, #0891B2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}>
          Go 技术栈
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          margin: 0,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}>
          高性能微服务框架,原生并发支持
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 32px auto',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        {[
          { color: '#10B981', label: '主流 - 广泛采用' },
          { color: '#F59E0B', label: '常用 - 稳定使用' },
          { color: '#8B5CF6', label: '新星 - 快速崛起' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#ffffff08',
            borderRadius: '24px',
            border: '1px solid #ffffff10',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.color,
            }} />
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
      }}>
        {techCategories.map((category) => (
          <TechCard key={category.id} category={category} />
        ))}
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '48px auto 0 auto',
        textAlign: 'center',
        padding: '24px',
        background: '#ffffff05',
        borderRadius: '16px',
        border: '1px solid #ffffff10',
      }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#64748b',
        }}>
          💡 点击卡片可展开查看更多技术 | Go语言以其出色的并发性能和简洁语法著称
        </p>
      </div>
    </div>
  )
}
