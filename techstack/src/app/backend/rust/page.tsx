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
    icon: '🦀',
    color: '#DC2626',
    problem: '高性能异步Web',
    description: '零成本抽象的高性能异步Web框架,提供类型安全和内存安全保证。',
    mainstream: [
      { name: 'Axum', description: 'Tokio团队出品,模块化', popularity: 'high' },
      { name: 'Actix-web', description: '性能极致,功能完整', popularity: 'high' },
      { name: 'Rocket', description: '易用性优先,类型安全', popularity: 'medium' },
      { name: 'Warp', description: '函数式,组合式', popularity: 'medium' },
      { name: 'Poem', description: 'OpenAPI优先', popularity: 'rising' },
    ]
  },
  {
    id: 'orm',
    name: '数据库工具',
    icon: '💽',
    color: '#B91C1C',
    problem: '类型安全查询',
    description: '提供类型安全的数据库操作,编译期检查SQL错误。',
    mainstream: [
      { name: 'SeaORM', description: '异步ORM,类型安全', popularity: 'high' },
      { name: 'SQLx', description: '编译期SQL验证', popularity: 'high' },
      { name: 'Diesel', description: '类型安全查询构建器', popularity: 'high' },
      { name: 'Rustorm', description: 'ORM框架', popularity: 'medium' },
    ]
  },
  {
    id: 'async',
    name: '异步运行时',
    icon: '⚡',
    color: '#EF4444',
    problem: '异步并发',
    description: 'Rust异步生态的核心,提供高性能异步I/O能力。',
    mainstream: [
      { name: 'Tokio', description: '最流行的异步运行时', popularity: 'high' },
      { name: 'async-std', description: '标准库风格', popularity: 'medium' },
      { name: 'smol', description: '轻量级异步运行时', popularity: 'medium' },
    ]
  },
  {
    id: 'serialization',
    name: '序列化',
    icon: '📦',
    color: '#DC2626',
    problem: '数据序列化',
    description: '提供高性能数据序列化和反序列化能力。',
    mainstream: [
      { name: 'Serde', description: '序列化框架标准', popularity: 'high' },
      { name: 'serde_json', description: 'JSON支持', popularity: 'high' },
      { name: 'bincode', description: '二进制序列化', popularity: 'medium' },
      { name: 'rkyv', description: '零拷贝序列化', popularity: 'rising' },
    ]
  },
  {
    id: 'http',
    name: 'HTTP客户端',
    icon: '🌐',
    color: '#F87171',
    problem: 'HTTP请求',
    description: '提供异步HTTP客户端,支持HTTP/2和连接池。',
    mainstream: [
      { name: 'reqwest', description: '易用的HTTP客户端', popularity: 'high' },
      { name: 'hyper', description: '底层HTTP库', popularity: 'high' },
      { name: 'surf', description: '异步HTTP客户端', popularity: 'medium' },
      { name: 'ureq', description: '同步HTTP客户端', popularity: 'medium' },
    ]
  },
  {
    id: 'cache',
    name: '缓存库',
    icon: '💨',
    color: '#DC2626',
    problem: '高性能缓存',
    description: '提供高性能缓存实现,支持LRU、LFU等策略。',
    mainstream: [
      { name: 'moka', description: '高性能并发缓存', popularity: 'high' },
      { name: 'cached', description: '声明式缓存', popularity: 'medium' },
      { name: 'redis-rs', description: 'Redis客户端', popularity: 'high' },
    ]
  },
  {
    id: 'logging',
    name: '日志追踪',
    icon: '📝',
    color: '#EF4444',
    problem: '结构化日志',
    description: '提供结构化日志和分布式追踪能力。',
    mainstream: [
      { name: 'tracing', description: '结构化日志和追踪', popularity: 'high' },
      { name: 'log', description: 'Rust日志门面', popularity: 'high' },
      { name: 'slog', description: '结构化日志', popularity: 'medium' },
      { name: 'env_logger', description: '简单日志实现', popularity: 'medium' },
    ]
  },
  {
    id: 'testing',
    name: '测试工具',
    icon: '🧪',
    color: '#B91C1C',
    problem: '代码质量',
    description: '内置测试框架,支持单元测试、集成测试和基准测试。',
    mainstream: [
      { name: '内置test', description: 'Rust内置测试', popularity: 'high' },
      { name: 'mockall', description: 'Mock框架', popularity: 'high' },
      { name: 'proptest', description: '属性测试', popularity: 'medium' },
      { name: 'tokio-test', description: '异步测试工具', popularity: 'medium' },
    ]
  },
  {
    id: 'error',
    name: '错误处理',
    icon: '⚠️',
    color: '#DC2626',
    problem: '错误管理',
    description: '提供优雅的错误处理和错误类型定义能力。',
    mainstream: [
      { name: 'thiserror', description: '派生错误类型', popularity: 'high' },
      { name: 'anyhow', description: '应用错误处理', popularity: 'high' },
      { name: 'eyre', description: 'anyhow增强版', popularity: 'medium' },
      { name: 'color-eyre', description: '彩色错误报告', popularity: 'medium' },
    ]
  },
  {
    id: 'cli',
    name: 'CLI工具',
    icon: '⌨️',
    color: '#B91C1C',
    problem: '命令行开发',
    description: '提供命令行参数解析能力。',
    mainstream: [
      { name: 'clap', description: 'CLI框架标准', popularity: 'high' },
      { name: 'structopt', description: '派生式CLI', popularity: 'medium' },
      { name: 'argh', description: '轻量级参数解析', popularity: 'medium' },
      { name: 'pico-args', description: '极简参数解析', popularity: 'medium' },
    ]
  },
  {
    id: 'concurrent',
    name: '并发编程',
    icon: '⚡',
    color: '#EF4444',
    problem: '并发处理',
    description: '提供并发原语和数据结构。',
    mainstream: [
      { name: 'rayon', description: '数据并行库', popularity: 'high' },
      { name: 'crossbeam', description: '并发工具箱', popularity: 'high' },
      { name: 'parking_lot', description: '高性能锁', popularity: 'medium' },
      { name: 'dashmap', description: '并发HashMap', popularity: 'medium' },
    ]
  },
  {
    id: 'testing',
    name: '测试工具',
    icon: '🧪',
    color: '#DC2626',
    problem: '代码质量',
    description: 'Rust内置测试框架及扩展。',
    mainstream: [
      { name: '内置test', description: 'cargo test', popularity: 'high' },
      { name: 'mockall', description: 'Mock框架', popularity: 'high' },
      { name: 'proptest', description: '属性测试', popularity: 'medium' },
      { name: 'tokio-test', description: '异步测试', popularity: 'medium' },
    ]
  },
  {
    id: 'mq',
    name: '消息队列',
    icon: '📨',
    color: '#F87171',
    problem: '异步消息',
    description: '提供消息队列客户端支持。',
    mainstream: [
      { name: 'lapin', description: 'RabbitMQ客户端', popularity: 'medium' },
      { name: 'rdkafka', description: 'Kafka客户端', popularity: 'high' },
      { name: 'async-nats', description: 'NATS客户端', popularity: 'medium' },
    ]
  },
  {
    id: 'deployment',
    name: '部署运行',
    icon: '🚀',
    color: '#B91C1C',
    problem: '生产部署',
    description: '提供生产环境部署方案。',
    mainstream: [
      { name: 'Docker', description: '容器化部署', popularity: 'high' },
      { name: 'Systemd', description: 'Linux系统服务', popularity: 'medium' },
      { name: 'Native Binary', description: '单文件可执行', popularity: 'high' },
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

export default function RustStack() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0f0f 0%, #2e0f0f 50%, #1a0f0f 100%)',
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
          background: 'linear-gradient(135deg, #F87171, #EF4444, #DC2626)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}>
          Rust 技术栈
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
          内存安全,零成本抽象,极致性能
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
          💡 点击卡片可展开查看更多技术 | Rust以内存安全和极致性能著称,适合系统级编程
        </p>
      </div>
    </div>
  )
}
