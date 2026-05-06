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
    icon: '⚡',
    color: '#F59E0B',
    problem: '异步高性能API',
    description: '现代异步Web框架,提供自动API文档、数据验证和高性能异步处理能力。',
    mainstream: [
      { name: 'FastAPI', description: '异步优先,自动文档', popularity: 'high' },
      { name: 'Django', description: '功能完整,管理后台', popularity: 'high' },
      { name: 'Flask', description: '轻量灵活,扩展丰富', popularity: 'high' },
      { name: 'Starlette', description: '异步微框架', popularity: 'medium' },
      { name: 'Sanic', description: '高性能异步', popularity: 'medium' },
      { name: 'Tornado', description: '非阻塞I/O', popularity: 'medium' },
    ]
  },
  {
    id: 'orm',
    name: 'ORM框架',
    icon: '🗃️',
    color: '#EAB308',
    problem: '数据库操作抽象',
    description: '提供强大的ORM能力,支持复杂查询、关系映射和数据库迁移。',
    mainstream: [
      { name: 'SQLAlchemy', description: '功能强大,灵活可控', popularity: 'high' },
      { name: 'Django ORM', description: 'Django内置,简单易用', popularity: 'high' },
      { name: 'Tortoise ORM', description: '异步ORM,类Django', popularity: 'medium' },
      { name: 'Peewee', description: '轻量级,简单直观', popularity: 'medium' },
      { name: 'Pony ORM', description: '生成器表达式查询', popularity: 'medium' },
    ]
  },
  {
    id: 'validation',
    name: '数据验证',
    icon: '✓',
    color: '#D97706',
    problem: '类型安全与验证',
    description: '提供运行时数据验证和序列化能力,支持复杂的数据结构验证。',
    mainstream: [
      { name: 'Pydantic', description: 'FastAPI标配,类型提示', popularity: 'high' },
      { name: 'Marshmallow', description: '序列化与验证', popularity: 'high' },
      { name: 'attrs', description: 'dataclass增强', popularity: 'medium' },
      { name: 'Cerberus', description: '轻量级验证', popularity: 'medium' },
      { name: 'Dataclasses', description: 'Python内置', popularity: 'high' },
    ]
  },
  {
    id: 'async',
    name: '异步运行时',
    icon: '🔄',
    color: '#FB923C',
    problem: '高并发处理',
    description: '提供异步I/O能力,支持高并发请求处理和异步任务调度。',
    mainstream: [
      { name: 'asyncio', description: 'Python内置异步库', popularity: 'high' },
      { name: 'uvicorn', description: 'ASGI服务器,极速', popularity: 'high' },
      { name: 'gunicorn', description: 'WSGI服务器,稳定', popularity: 'high' },
      { name: 'uvloop', description: 'asyncio加速器', popularity: 'high' },
      { name: 'hypercorn', description: 'ASGI服务器', popularity: 'medium' },
    ]
  },
  {
    id: 'queue',
    name: '任务队列',
    icon: '📨',
    color: '#FBBF24',
    problem: '异步任务处理',
    description: '处理后台任务、定时任务和分布式任务调度,支持重试和监控。',
    mainstream: [
      { name: 'Celery', description: '分布式任务队列', popularity: 'high' },
      { name: 'Dramatiq', description: '简单可靠', popularity: 'medium' },
      { name: 'RQ', description: 'Redis队列,简洁', popularity: 'medium' },
      { name: 'Huey', description: '轻量级任务队列', popularity: 'medium' },
      { name: 'Taskiq', description: '异步任务队列', popularity: 'rising' },
    ]
  },
  {
    id: 'scraping',
    name: '爬虫框架',
    icon: '🕷️',
    color: '#F59E0B',
    problem: '数据采集',
    description: '提供强大的网页抓取和数据提取能力,支持异步并发和自动重试。',
    mainstream: [
      { name: 'Scrapy', description: '功能完整,生态丰富', popularity: 'high' },
      { name: 'httpx', description: '异步HTTP客户端', popularity: 'high' },
      { name: 'BeautifulSoup', description: 'HTML解析器', popularity: 'high' },
      { name: 'Playwright', description: '浏览器自动化', popularity: 'rising' },
      { name: 'Selenium', description: '经典浏览器自动化', popularity: 'medium' },
    ]
  },
  {
    id: 'data',
    name: '数据处理',
    icon: '📊',
    color: '#FACC15',
    problem: '数据分析',
    description: '提供强大的数据处理和分析能力,支持大规模数据集操作。',
    mainstream: [
      { name: 'Pandas', description: '数据分析标准库', popularity: 'high' },
      { name: 'NumPy', description: '科学计算基础', popularity: 'high' },
      { name: 'Polars', description: 'Rust实现,极速', popularity: 'rising' },
      { name: 'DuckDB', description: '嵌入式分析数据库', popularity: 'rising' },
      { name: 'Vaex', description: '大数据处理', popularity: 'medium' },
    ]
  },
  {
    id: 'testing',
    name: '测试框架',
    icon: '🧪',
    color: '#F97316',
    problem: '代码质量',
    description: '提供完整的测试解决方案,支持单元测试、集成测试和性能测试。',
    mainstream: [
      { name: 'pytest', description: '强大灵活,插件丰富', popularity: 'high' },
      { name: 'unittest', description: 'Python内置', popularity: 'high' },
      { name: 'hypothesis', description: '属性测试', popularity: 'medium' },
      { name: 'locust', description: '性能测试', popularity: 'medium' },
      { name: 'factory_boy', description: '测试数据工厂', popularity: 'medium' },
    ]
  },
  {
    id: 'email',
    name: '邮件服务',
    icon: '📧',
    color: '#F59E0B',
    problem: '邮件发送',
    description: '提供邮件发送和模板渲染能力。',
    mainstream: [
      { name: 'FastAPI Mail', description: 'FastAPI邮件扩展', popularity: 'high' },
      { name: 'Django Mail', description: 'Django内置邮件', popularity: 'high' },
      { name: 'SendGrid', description: '企业级邮件服务', popularity: 'high' },
      { name: 'yagmail', description: 'Gmail简化发送', popularity: 'medium' },
    ]
  },
  {
    id: 'logging',
    name: '日志框架',
    icon: '📝',
    color: '#FB923C',
    problem: '日志记录',
    description: '提供结构化日志和日志管理能力。',
    mainstream: [
      { name: 'structlog', description: '结构化日志标准', popularity: 'high' },
      { name: 'Loguru', description: '开箱即用,功能强大', popularity: 'high' },
      { name: 'logging', description: 'Python标准库', popularity: 'high' },
      { name: 'ELK Stack', description: '日志收集分析', popularity: 'medium' },
    ]
  },
  {
    id: 'docs',
    name: '文档生成',
    icon: '📚',
    color: '#EAB308',
    problem: 'API文档',
    description: '自动生成API文档和项目文档。',
    mainstream: [
      { name: 'FastAPI Swagger', description: '自动API文档', popularity: 'high' },
      { name: 'MkDocs', description: 'Markdown文档', popularity: 'high' },
      { name: 'Sphinx', description: 'Python文档标准', popularity: 'high' },
      { name: 'Redoc', description: '美观API文档', popularity: 'medium' },
    ]
  },
  {
    id: 'cli',
    name: 'CLI工具',
    icon: '⌨️',
    color: '#D97706',
    problem: '命令行开发',
    description: '提供命令行工具开发能力。',
    mainstream: [
      { name: 'Click', description: '命令行框架', popularity: 'high' },
      { name: 'Typer', description: '现代CLI框架', popularity: 'high' },
      { name: 'Argparse', description: 'Python标准库', popularity: 'high' },
      { name: 'Rich', description: '终端美化', popularity: 'rising' },
      { name: 'Fire', description: 'Google命令行库', popularity: 'medium' },
    ]
  },
  {
    id: 'deployment',
    name: '部署运行',
    icon: '🚀',
    color: '#FBBF24',
    problem: '生产部署',
    description: '提供生产环境部署和运行方案。',
    mainstream: [
      { name: 'Gunicorn + Uvicorn', description: 'WSGI+ASGI服务器', popularity: 'high' },
      { name: 'Docker', description: '容器化部署', popularity: 'high' },
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

export default function PythonStack() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a150f 0%, #2e1e0f 50%, #1a150f 100%)',
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
          background: 'linear-gradient(135deg, #FBBF24, #F59E0B, #D97706)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}>
          Python 技术栈
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
          异步高性能API开发,数据处理与AI的首选语言
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
          💡 点击卡片可展开查看更多技术 | Python在Web开发、数据科学和AI领域都有强大生态
        </p>
      </div>
    </div>
  )
}
