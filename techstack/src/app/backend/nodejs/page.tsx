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
    color: '#68D391',
    problem: '高效API开发',
    description: '企业级与轻量级并存,提供完整的Web开发解决方案,从路由到中间件的全栈支持。',
    mainstream: [
      { name: 'NestJS', description: '企业级框架,TypeScript原生', popularity: 'high' },
      { name: 'Express', description: '简洁灵活,生态丰富', popularity: 'high' },
      { name: 'Fastify', description: '高性能,低开销', popularity: 'high' },
      { name: 'Hono', description: '超轻量级,边缘计算友好', popularity: 'rising' },
      { name: 'Koa', description: 'Express团队新作,async/await', popularity: 'medium' },
      { name: 'Elysia', description: 'Bun生态,性能极致', popularity: 'rising' },
    ]
  },
  {
    id: 'orm',
    name: 'ORM/数据库',
    icon: '🗄️',
    color: '#4FD1C5',
    problem: '类型安全的数据操作',
    description: '提供类型安全的数据库操作,自动生成类型定义,支持迁移和查询构建器。',
    mainstream: [
      { name: 'Prisma', description: '下一代ORM,类型安全', popularity: 'high' },
      { name: 'Drizzle ORM', description: '轻量级,SQL-like API', popularity: 'high' },
      { name: 'TypeORM', description: '装饰器语法,功能完整', popularity: 'high' },
      { name: 'Kysely', description: '类型安全的查询构建器', popularity: 'medium' },
      { name: 'MikroORM', description: 'Unit of Work模式', popularity: 'medium' },
      { name: 'Mongoose', description: 'MongoDB ODM', popularity: 'high' },
    ]
  },
  {
    id: 'validation',
    name: '验证框架',
    icon: '✅',
    color: '#F6AD55',
    problem: '运行时类型验证',
    description: '提供强大的数据验证能力,支持运行时类型检查和错误提示。',
    mainstream: [
      { name: 'Zod', description: 'TypeScript优先,链式API', popularity: 'high' },
      { name: 'class-validator', description: '装饰器验证,NestJS标配', popularity: 'high' },
      { name: 'Joi', description: '功能强大,生态成熟', popularity: 'medium' },
      { name: 'Yup', description: '简洁易用,React生态', popularity: 'medium' },
      { name: 'Valibot', description: '轻量级Zod替代', popularity: 'rising' },
      { name: 'TypeBox', description: '基于JSON Schema', popularity: 'medium' },
    ]
  },
  {
    id: 'auth',
    name: '认证授权',
    icon: '🔐',
    color: '#9F7AEA',
    problem: '安全的身份认证',
    description: '提供完整的认证授权解决方案,支持多种认证策略和会话管理。',
    mainstream: [
      { name: 'NextAuth.js', description: 'Next.js官方推荐', popularity: 'high' },
      { name: 'Passport.js', description: '策略丰富,灵活可扩展', popularity: 'high' },
      { name: 'Clerk', description: '托管认证,开箱即用', popularity: 'rising' },
      { name: 'Lucia', description: '轻量级,类型安全', popularity: 'rising' },
      { name: 'Auth.js', description: 'NextAuth v5', popularity: 'high' },
      { name: 'Jose', description: 'JWT工具库', popularity: 'medium' },
    ]
  },
  {
    id: 'realtime',
    name: '实时通信',
    icon: '⚡',
    color: '#FC8181',
    problem: 'WebSocket实时推送',
    description: '提供双向实时通信能力,支持房间、广播等高级功能。',
    mainstream: [
      { name: 'Socket.io', description: '功能完整,易于使用', popularity: 'high' },
      { name: 'ws', description: '轻量级原生实现', popularity: 'high' },
      { name: 'PartyKit', description: '边缘实时协作', popularity: 'rising' },
      { name: 'Pusher', description: '托管服务,简单可靠', popularity: 'medium' },
      { name: 'Ably', description: '企业级实时平台', popularity: 'medium' },
      { name: 'uWebSockets.js', description: '极致性能', popularity: 'medium' },
    ]
  },
  {
    id: 'queue',
    name: '任务队列',
    icon: '📋',
    color: '#63B3ED',
    problem: '异步任务处理',
    description: '处理后台任务、定时任务和工作流编排,支持重试和监控。',
    mainstream: [
      { name: 'BullMQ', description: 'Redis队列,功能强大', popularity: 'high' },
      { name: 'Temporal', description: '工作流编排引擎', popularity: 'rising' },
      { name: 'Agenda', description: 'MongoDB任务调度', popularity: 'medium' },
      { name: 'Bee-Queue', description: '简单高效', popularity: 'medium' },
      { name: 'Graphile Worker', description: 'PostgreSQL队列', popularity: 'medium' },
    ]
  },
  {
    id: 'cache',
    name: '缓存方案',
    icon: '💾',
    color: '#ED8936',
    problem: '性能优化',
    description: '提供多层缓存策略,减少数据库压力,提升响应速度。',
    mainstream: [
      { name: 'Redis', description: '内存数据库,功能丰富', popularity: 'high' },
      { name: 'Keyv', description: '简单的键值存储抽象', popularity: 'medium' },
      { name: 'cache-manager', description: '多层缓存管理', popularity: 'medium' },
      { name: 'node-cache', description: '进程内缓存', popularity: 'medium' },
    ]
  },
  {
    id: 'testing',
    name: '测试框架',
    icon: '🧪',
    color: '#48BB78',
    problem: '代码质量保证',
    description: '提供单元测试、集成测试和E2E测试能力,确保代码可靠性。',
    mainstream: [
      { name: 'Vitest', description: 'Vite原生,极速运行', popularity: 'high' },
      { name: 'Jest', description: '功能完整,生态丰富', popularity: 'high' },
      { name: 'Supertest', description: 'HTTP断言测试', popularity: 'high' },
      { name: 'Node-tap', description: 'TAP标准测试', popularity: 'medium' },
      { name: 'TestContainers', description: '容器化测试', popularity: 'medium' },
    ]
  },
  {
    id: 'storage',
    name: '文件存储',
    icon: '📁',
    color: '#667EEA',
    problem: '文件上传与存储',
    description: '提供文件上传、存储和管理能力,支持本地和云端存储。',
    mainstream: [
      { name: 'AWS S3 SDK', description: '对象存储标准', popularity: 'high' },
      { name: 'MinIO', description: '开源对象存储', popularity: 'high' },
      { name: 'Uploadthing', description: '现代文件上传', popularity: 'rising' },
      { name: 'Multer', description: '文件上传中间件', popularity: 'high' },
      { name: 'Uppy', description: '文件上传UI', popularity: 'medium' },
    ]
  },
  {
    id: 'email',
    name: '邮件服务',
    icon: '📧',
    color: '#F687B3',
    problem: '邮件发送',
    description: '提供邮件发送和模板渲染能力,支持事务邮件和营销邮件。',
    mainstream: [
      { name: 'Resend', description: '现代邮件API', popularity: 'rising' },
      { name: 'Nodemailer', description: 'Node.js邮件标准', popularity: 'high' },
      { name: 'SendGrid', description: '企业级邮件服务', popularity: 'high' },
      { name: 'Postmark', description: '事务邮件专家', popularity: 'medium' },
      { name: 'React Email', description: 'React邮件模板', popularity: 'rising' },
    ]
  },
  {
    id: 'logging',
    name: '日志框架',
    icon: '📝',
    color: '#F6AD55',
    problem: '日志记录',
    description: '提供高性能日志记录,支持结构化日志和日志轮转。',
    mainstream: [
      { name: 'Pino', description: '极速JSON日志', popularity: 'high' },
      { name: 'Winston', description: '功能丰富,传输灵活', popularity: 'high' },
      { name: 'Bunyan', description: '结构化日志', popularity: 'medium' },
      { name: 'log4js', description: 'Log4j风格', popularity: 'medium' },
    ]
  },
  {
    id: 'docs',
    name: '文档生成',
    icon: '📚',
    color: '#4FD1C5',
    problem: 'API文档',
    description: '自动生成API文档,提供交互式API测试界面。',
    mainstream: [
      { name: 'Swagger', description: 'OpenAPI标准', popularity: 'high' },
      { name: 'OpenAPI', description: 'API规范标准', popularity: 'high' },
      { name: 'TypeDoc', description: 'TypeScript文档', popularity: 'medium' },
      { name: 'Tsoa', description: 'TS装饰器OpenAPI', popularity: 'medium' },
      { name: 'NestJS Swagger', description: 'NestJS文档', popularity: 'high' },
    ]
  },
  {
    id: 'security',
    name: '安全防护',
    icon: '🛡️',
    color: '#FC8181',
    problem: 'Web安全',
    description: '提供安全防护措施,防止常见Web攻击和漏洞。',
    mainstream: [
      { name: 'Helmet', description: '安全头设置', popularity: 'high' },
      { name: 'cors', description: '跨域资源共享', popularity: 'high' },
      { name: 'bcrypt', description: '密码哈希', popularity: 'high' },
      { name: 'argon2', description: '更安全的哈希', popularity: 'rising' },
      { name: 'rate-limiter-flexible', description: '速率限制', popularity: 'medium' },
    ]
  },
  {
    id: 'cli',
    name: 'CLI工具',
    icon: '⌨️',
    color: '#9F7AEA',
    problem: '命令行开发',
    description: '提供命令行工具开发能力,支持参数解析和交互式命令。',
    mainstream: [
      { name: 'Commander', description: '命令行框架标准', popularity: 'high' },
      { name: 'Yargs', description: '参数解析器', popularity: 'high' },
      { name: 'Inquirer', description: '交互式命令行', popularity: 'high' },
      { name: 'Oclif', description: 'Heroku CLI框架', popularity: 'medium' },
      { name: 'Citty', description: '现代CLI框架', popularity: 'rising' },
    ]
  },
  {
    id: 'process',
    name: '进程管理',
    icon: '⚙️',
    color: '#68D391',
    problem: '部署与守护',
    description: '提供进程守护、负载均衡和部署管理能力。',
    mainstream: [
      { name: 'PM2', description: '进程管理标准', popularity: 'high' },
      { name: 'Docker', description: '容器化部署', popularity: 'high' },
      { name: 'Systemd', description: 'Linux系统服务', popularity: 'medium' },
      { name: 'Nginx', description: '反向代理', popularity: 'high' },
      { name: 'Caddy', description: '现代Web服务器', popularity: 'rising' },
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
      className="tech-card"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${category.color}30`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        ['--category-color' as string]: category.color,
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${category.color}, ${category.color}80)`,
      }} />

      {/* Header */}
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

      {/* Description */}
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: 1.6,
      }}>{category.description}</p>

      {/* Tech list */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {category.mainstream.slice(0, isExpanded ? undefined : 3).map((tech) => (
          <div
            key={tech.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff08',
              borderRadius: '8px',
              border: '1px solid #ffffff10',
            }}
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

      {/* Expand indicator */}
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

export default function NodeJSStack() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f1a0f 0%, #1a2e1a 50%, #0f1a0f 100%)',
      padding: '40px 20px',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 48px auto',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #68D391, #48BB78, #38A169)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}>
          Node.js / TypeScript 技术栈
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
          企业级与轻量级并存,类型安全的后端开发生态
        </p>
      </div>

      {/* Legend */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 32px auto',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{
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
            background: '#10B981',
          }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>主流 - 广泛采用</span>
        </div>
        <div style={{
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
            background: '#F59E0B',
          }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>常用 - 稳定使用</span>
        </div>
        <div style={{
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
            background: '#8B5CF6',
          }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>新星 - 快速崛起</span>
        </div>
      </div>

      {/* Tech Grid */}
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

      {/* Footer */}
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
          💡 点击卡片可展开查看更多技术 | 技术选型应结合项目需求、团队熟悉度、生态成熟度综合考量
        </p>
      </div>
    </div>
  )
}
