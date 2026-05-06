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
    icon: '☕',
    color: '#F97316',
    problem: '企业级应用开发',
    description: '成熟稳定的企业级Web框架,提供完整的开发工具链和Spring生态支持。',
    mainstream: [
      { name: 'Spring Boot', description: '快速开发,约定优于配置', popularity: 'high' },
      { name: 'Quarkus', description: '云原生,GraalVM优化', popularity: 'rising' },
      { name: 'Micronaut', description: '低内存占用,快速启动', popularity: 'rising' },
      { name: 'Vert.x', description: '响应式,高性能', popularity: 'medium' },
      { name: 'Play Framework', description: 'Scala/Java,RESTful', popularity: 'medium' },
    ]
  },
  {
    id: 'orm',
    name: '持久层框架',
    icon: '💾',
    color: '#EA580C',
    problem: '数据库操作',
    description: '提供ORM映射、SQL构建和数据库访问能力。',
    mainstream: [
      { name: 'MyBatis-Plus', description: 'MyBatis增强,代码生成', popularity: 'high' },
      { name: 'Spring Data JPA', description: 'Spring生态,简化CRUD', popularity: 'high' },
      { name: 'MyBatis', description: '灵活SQL,半自动ORM', popularity: 'high' },
      { name: 'JOOQ', description: '类型安全SQL', popularity: 'medium' },
      { name: 'Hibernate', description: 'JPA标准实现', popularity: 'high' },
    ]
  },
  {
    id: 'validation',
    name: '数据验证',
    icon: '✓',
    color: '#DC2626',
    problem: '参数校验',
    description: '提供Bean Validation标准实现和数据验证能力。',
    mainstream: [
      { name: 'Hibernate Validator', description: 'Bean Validation实现', popularity: 'high' },
      { name: 'Spring Validation', description: 'Spring集成验证', popularity: 'high' },
      { name: 'Jakarta Validation', description: 'Jakarta EE标准', popularity: 'high' },
    ]
  },
  {
    id: 'security',
    name: '安全框架',
    icon: '🔐',
    color: '#F97316',
    problem: '认证授权',
    description: '提供完整的安全解决方案,支持多种认证方式和权限控制。',
    mainstream: [
      { name: 'Spring Security', description: '功能完整,生态丰富', popularity: 'high' },
      { name: 'Apache Shiro', description: '简单易用,轻量级', popularity: 'medium' },
      { name: 'JWT', description: '无状态认证', popularity: 'high' },
      { name: 'OAuth2', description: '授权标准', popularity: 'high' },
      { name: 'Keycloak', description: '统一认证平台', popularity: 'rising' },
    ]
  },
  {
    id: 'microservice',
    name: '微服务',
    icon: '🔧',
    color: '#EA580C',
    problem: '分布式架构',
    description: '提供微服务开发框架和服务治理能力。',
    mainstream: [
      { name: 'Spring Cloud', description: '微服务全家桶', popularity: 'high' },
      { name: 'Dubbo', description: '阿里微服务框架', popularity: 'high' },
      { name: 'gRPC-Java', description: 'Google RPC框架', popularity: 'medium' },
      { name: 'Istio', description: '服务网格', popularity: 'medium' },
    ]
  },
  {
    id: 'cache',
    name: '缓存方案',
    icon: '⚡',
    color: '#F97316',
    problem: '性能优化',
    description: '提供多层缓存策略,支持分布式缓存和本地缓存。',
    mainstream: [
      { name: 'Spring Cache + Redis', description: '分布式缓存', popularity: 'high' },
      { name: 'Caffeine', description: '高性能本地缓存', popularity: 'high' },
      { name: 'Ehcache', description: 'Java标准缓存', popularity: 'medium' },
      { name: 'Hazelcast', description: '分布式内存网格', popularity: 'medium' },
    ]
  },
  {
    id: 'logging',
    name: '日志框架',
    icon: '📝',
    color: '#DC2626',
    problem: '日志记录',
    description: '提供统一的日志门面和多种日志实现。',
    mainstream: [
      { name: 'SLF4J + Logback', description: '日志门面+实现', popularity: 'high' },
      { name: 'Log4j2', description: '高性能日志框架', popularity: 'high' },
      { name: 'Java Util Logging', description: 'JDK内置', popularity: 'medium' },
    ]
  },
  {
    id: 'testing',
    name: '测试框架',
    icon: '🧪',
    color: '#F97316',
    problem: '代码质量',
    description: '提供单元测试、集成测试和性能测试能力。',
    mainstream: [
      { name: 'JUnit 5', description: '现代测试框架', popularity: 'high' },
      { name: 'Mockito', description: 'Mock框架', popularity: 'high' },
      { name: 'TestContainers', description: '容器化测试', popularity: 'rising' },
      { name: 'WireMock', description: 'HTTP模拟', popularity: 'medium' },
      { name: 'AssertJ', description: '流畅断言', popularity: 'medium' },
    ]
  },
  {
    id: 'docs',
    name: '文档生成',
    icon: '📚',
    color: '#EA580C',
    problem: 'API文档',
    description: '自动生成API文档。',
    mainstream: [
      { name: 'SpringDoc', description: 'Spring Boot文档', popularity: 'high' },
      { name: 'Swagger', description: 'OpenAPI标准', popularity: 'high' },
      { name: 'OpenAPI', description: 'API规范', popularity: 'high' },
      { name: 'Knife4j', description: 'Swagger增强', popularity: 'medium' },
    ]
  },
  {
    id: 'scheduler',
    name: '任务调度',
    icon: '⏰',
    color: '#DC2626',
    problem: '定时任务',
    description: '提供分布式任务调度能力。',
    mainstream: [
      { name: 'Spring Scheduler', description: 'Spring内置', popularity: 'high' },
      { name: 'Quartz', description: '企业级调度', popularity: 'high' },
      { name: 'XXL-Job', description: '分布式任务调度', popularity: 'high' },
      { name: 'Elastic-Job', description: '当当分布式调度', popularity: 'medium' },
    ]
  },
  {
    id: 'mq',
    name: '消息队列',
    icon: '📨',
    color: '#F97316',
    problem: '异步消息',
    description: '提供消息中间件支持。',
    mainstream: [
      { name: 'Spring Kafka', description: 'Kafka集成', popularity: 'high' },
      { name: 'RocketMQ Spring', description: 'RocketMQ集成', popularity: 'high' },
      { name: 'RabbitMQ', description: 'AMQP消息队列', popularity: 'high' },
      { name: 'ActiveMQ', description: 'JMS消息队列', popularity: 'medium' },
    ]
  },
  {
    id: 'search',
    name: '搜索引擎',
    icon: '🔍',
    color: '#EA580C',
    problem: '全文搜索',
    description: '提供全文搜索能力。',
    mainstream: [
      { name: 'Spring Data Elasticsearch', description: 'ES集成', popularity: 'high' },
      { name: 'Hibernate Search', description: 'Hibernate搜索', popularity: 'medium' },
      { name: 'Solr', description: 'Apache搜索', popularity: 'medium' },
    ]
  },
  {
    id: 'cli',
    name: 'CLI工具',
    icon: '⌨️',
    color: '#DC2626',
    problem: '命令行开发',
    description: '提供命令行工具开发能力。',
    mainstream: [
      { name: 'Picocli', description: '现代CLI框架', popularity: 'high' },
      { name: 'JCommander', description: '参数解析', popularity: 'medium' },
      { name: 'Apache Commons CLI', description: 'Apache CLI', popularity: 'medium' },
    ]
  },
  {
    id: 'deployment',
    name: '部署运行',
    icon: '🚀',
    color: '#F97316',
    problem: '生产部署',
    description: '提供生产环境部署方案。',
    mainstream: [
      { name: 'Docker', description: '容器化部署', popularity: 'high' },
      { name: 'Kubernetes', description: '容器编排', popularity: 'high' },
      { name: 'JAR/WAR', description: '传统打包', popularity: 'high' },
      { name: 'GraalVM Native', description: '原生镜像', popularity: 'rising' },
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

export default function JavaStack() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0f0f 0%, #2e1a0f 50%, #1a0f0f 100%)',
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
          background: 'linear-gradient(135deg, #FB923C, #F97316, #EA580C)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}>
          Java 技术栈
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
          企业级应用首选,成熟稳定的后端生态
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
          💡 点击卡片可展开查看更多技术 | Java在企业级应用和大型系统开发中占据主导地位
        </p>
      </div>
    </div>
  )
}
