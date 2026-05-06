'use client'

import { useState, useEffect } from 'react'
import { TechCategoryCard } from '@/components/tech'
import type { TechCategory } from '@/data/tech/types'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

const pythonCategories: TechCategory[] = [
  {
    id: 'python-framework',
    name: 'Web框架',
    icon: '🌐',
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
    id: 'python-orm',
    name: 'ORM框架',
    icon: '💾',
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
    id: 'python-validation',
    name: '数据验证',
    icon: '✅',
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
    id: 'python-async',
    name: '异步运行时',
    icon: '⚡',
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
    id: 'python-queue',
    name: '任务队列',
    icon: '⏳',
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
    id: 'python-testing',
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
    id: 'python-logging',
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
    id: 'python-docs',
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
    id: 'python-cli',
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
    id: 'python-deployment',
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
  {
    id: 'python-scraping',
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
    id: 'python-data',
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
    id: 'python-email',
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
  }
]

const goCategories: TechCategory[] = [
  {
    id: 'go-framework',
    name: 'Web框架',
    icon: '🌐',
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
    id: 'go-orm',
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
    id: 'go-validation',
    name: '数据验证',
    icon: '✅',
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
    id: 'go-auth',
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
    id: 'go-microservice',
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
    id: 'go-concurrent',
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
    id: 'go-cache',
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
    id: 'go-logging',
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
    id: 'go-testing',
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
    id: 'go-docs',
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
    id: 'go-cli',
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
    id: 'go-discovery',
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
    id: 'go-mq',
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
    id: 'go-deployment',
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

const javaCategories: TechCategory[] = [
  {
    id: 'java-framework',
    name: 'Web框架',
    icon: '🌐',
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
    id: 'java-orm',
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
    id: 'java-validation',
    name: '数据验证',
    icon: '✅',
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
    id: 'java-security',
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
    id: 'java-microservice',
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
    id: 'java-cache',
    name: '缓存方案',
    icon: '💨',
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
    id: 'java-logging',
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
    id: 'java-testing',
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
    id: 'java-docs',
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
    id: 'java-scheduler',
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
    id: 'java-mq',
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
    id: 'java-search',
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
    id: 'java-cli',
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
    id: 'java-deployment',
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

const rustCategories: TechCategory[] = [
  {
    id: 'rust-framework',
    name: 'Web框架',
    icon: '🌐',
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
    id: 'rust-orm',
    name: '数据库工具',
    icon: '💾',
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
    id: 'rust-async',
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
    id: 'rust-serialization',
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
    id: 'rust-http',
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
    id: 'rust-cache',
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
    id: 'rust-logging',
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
    id: 'rust-testing',
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
    id: 'rust-error',
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
    id: 'rust-cli',
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
    id: 'rust-concurrent',
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
    id: 'rust-mq',
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
    id: 'rust-deployment',
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

const nodejsCategories: TechCategory[] = [
  {
    id: 'nodejs-framework',
    name: 'Web框架',
    icon: '🌐',
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
    id: 'nodejs-orm',
    name: 'ORM/数据库',
    icon: '💾',
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
    id: 'nodejs-validation',
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
    id: 'nodejs-auth',
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
    id: 'nodejs-realtime',
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
    id: 'nodejs-queue',
    name: '任务队列',
    icon: '⏳',
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
    id: 'nodejs-cache',
    name: '缓存方案',
    icon: '💨',
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
    id: 'nodejs-testing',
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
    id: 'nodejs-storage',
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
    id: 'nodejs-email',
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
    id: 'nodejs-logging',
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
    id: 'nodejs-docs',
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
    id: 'nodejs-security',
    name: '安全防护',
    icon: '🔐',
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
    id: 'nodejs-cli',
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
    id: 'nodejs-process',
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

import { cn } from '@/lib/utils'

const languageTabs = [
  { id: 'python', name: 'Python', color: '#F59E0B', gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B, #D97706)', desc: '异步API开发' },
  { id: 'go', name: 'Go', color: '#06B6D4', gradient: 'linear-gradient(135deg, #22D3EE, #06B6D4, #0891B2)', desc: '高性能微服务' },
  { id: 'java', name: 'Java', color: '#F97316', gradient: 'linear-gradient(135deg, #FB923C, #F97316, #EA580C)', desc: '企业级应用' },
  { id: 'rust', name: 'Rust', color: '#DC2626', gradient: 'linear-gradient(135deg, #F87171, #EF4444, #DC2626)', desc: '极致性能' },
  { id: 'nodejs', name: 'Node.js/TS', color: '#68D391', gradient: 'linear-gradient(135deg, #68D391, #48BB78, #38A169)', desc: '全栈开发' },
]

export default function BackendStack() {
  const [activeTab, setActiveTab] = useState<'python' | 'go' | 'java' | 'rust' | 'nodejs'>('python')

  const categoriesMap = {
    python: pythonCategories,
    go: goCategories,
    java: javaCategories,
    rust: rustCategories,
    nodejs: nodejsCategories,
  }

  const categories = categoriesMap[activeTab]

  const {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(categories, { initialPageSize: 9 })

  // Reset pagination when tab changes
  useEffect(() => {
    setPage(1)
  }, [activeTab, setPage])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 dark:from-[#0f0f1a] dark:via-[#1a0f2e] dark:to-[#0f0f1a] py-10 px-5">
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-[42px] font-bold bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight">
          后端技术栈
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Python、Go、Java、Rust、Node.js - 主流后端开发语言生态
        </p>
      </div>

      <div className="tab-container max-w-4xl mx-auto mb-10">
        {languageTabs.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setActiveTab(lang.id as typeof activeTab)}
            className={cn(
              'tab-button flex-1 min-w-[100px] text-sm',
              activeTab === lang.id && 'tab-button-active'
            )}
            style={{
              background: activeTab === lang.id ? lang.gradient : 'transparent',
            }}
          >
            <span className="text-base mr-1.5">
              {lang.id === 'python' ? '🐍' : lang.id === 'go' ? '🐹' : lang.id === 'java' ? '☕' : lang.id === 'rust' ? '🦀' : '⬢'}
            </span>
            {lang.name}
            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
              {lang.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="legend-container max-w-6xl mx-auto">
        {[
          { color: '#10B981', label: '主流 - 广泛采用' },
          { color: '#F59E0B', label: '常用 - 稳定使用' },
          { color: '#8B5CF6', label: '新星 - 快速崛起' },
        ].map((item, i) => (
          <div key={i} className="legend-item">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-[13px] text-slate-600 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentData.map((category) => (
          <TechCategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-6xl mx-auto mt-8">
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
      )}

      <div className="footer-note max-w-6xl mx-auto">
        <p className="text-sm text-slate-600 dark:text-slate-500 m-0">
          💡 点击卡片可展开查看更多技术 | 选择不同语言标签切换查看对应技术栈
        </p>
      </div>
    </div>
  )
}
