// 精简版技术栈数据 - 只保留核心内容
export interface TechItem {
  category: string
  tech: string
  popular: string
  description: string
}

// 核心前端数据（首屏显示）
export const coreFrontendData: TechItem[] = [
  { category: '框架', tech: 'React / Vue 3 / Angular / Svelte', popular: 'React / Vue 3', description: '构建用户界面的核心框架' },
  { category: '元框架', tech: 'Next.js / Nuxt.js / SvelteKit / Remix / Astro', popular: 'Next.js 15', description: '全栈能力' },
  { category: '语言', tech: 'TypeScript / JavaScript', popular: 'TypeScript 5.x', description: '类型安全' },
  { category: '样式', tech: 'Tailwind CSS / CSS-in-JS / SCSS', popular: 'Tailwind CSS', description: '样式方案' },
  { category: '状态', tech: 'Zustand / Pinia / Redux Toolkit', popular: 'Zustand / Pinia', description: '状态管理' },
]

// 扩展数据（按需加载）
export const extendedFrontendData: TechItem[] = [
  { category: '构建工具', tech: 'Vite / Webpack / esbuild / Rspack', popular: 'Vite', description: '构建体验' },
  { category: 'UI组件', tech: 'shadcn/ui / Radix UI / Ant Design / MUI', popular: 'shadcn/ui', description: '组件库' },
  { category: '测试', tech: 'Vitest / Jest / Playwright / Cypress', popular: 'Vitest', description: '测试工具' },
]

// 后端核心数据
export const coreBackendData: TechItem[] = [
  { category: 'Node.js框架', tech: 'NestJS / Express / Fastify / Hono', popular: 'NestJS / Hono', description: '企业级与轻量级' },
  { category: 'Python框架', tech: 'FastAPI / Django / Flask', popular: 'FastAPI', description: '高性能API开发' },
  { category: 'Go框架', tech: 'Gin / Echo / Fiber / Go-Zero', popular: 'Gin / Go-Zero', description: '微服务框架' },
  { category: 'Java框架', tech: 'Spring Boot / Quarkus / Micronaut', popular: 'Spring Boot 3', description: '企业级应用' },
  { category: 'Rust框架', tech: 'Axum / Actix-web / Rocket', popular: 'Axum', description: '异步Web框架' },
]

// 后端扩展数据
export const extendedBackendData: TechItem[] = [
  { category: 'ORM', tech: 'Prisma / TypeORM / GORM / SeaORM', popular: 'Prisma', description: '数据库操作' },
  { category: '验证', tech: 'Zod / Pydantic / validator', popular: 'Zod', description: '数据验证' },
  { category: '认证', tech: 'NextAuth / Clerk / Spring Security', popular: 'NextAuth', description: '身份认证' },
  { category: '缓存', tech: 'Redis / Dragonfly / Caffeine', popular: 'Redis', description: '缓存方案' },
  { category: '消息队列', tech: 'Kafka / RabbitMQ / NATS', popular: 'Kafka / NATS', description: '异步处理' },
  { category: '容器', tech: 'Docker / Kubernetes / Podman', popular: 'Docker + K8s', description: '云原生部署' },
]

// AI 核心数据
export const coreAIData: TechItem[] = [
  { category: '深度学习框架', tech: 'PyTorch / TensorFlow / JAX', popular: 'PyTorch 2.x', description: '主流选择' },
  { category: '大语言模型', tech: 'GPT-4o / Claude 3.5 / Llama 3', popular: 'GPT-4o / Claude', description: 'LLM模型' },
  { category: 'LLM SDK', tech: 'OpenAI SDK / LangChain / LlamaIndex', popular: '官方SDK', description: '应用开发' },
  { category: '向量数据库', tech: 'Pinecone / Milvus / Qdrant', popular: 'Milvus', description: '向量存储' },
  { category: '模型部署', tech: 'vLLM / Ollama / TensorRT', popular: 'vLLM', description: '推理服务' },
]

// AI 扩展数据
export const extendedAIData: TechItem[] = [
  { category: 'RAG框架', tech: 'LlamaIndex / LangChain / DSPy', popular: 'LlamaIndex', description: '检索增强' },
  { category: 'Agent框架', tech: 'LangGraph / CrewAI / Dify', popular: 'LangGraph', description: '智能体开发' },
  { category: '模型微调', tech: 'LoRA / QLoRA / DeepSpeed', popular: 'LoRA', description: '参数高效微调' },
  { category: 'AI编程工具', tech: 'Cursor / Copilot / Claude Code', popular: 'Cursor', description: 'AI辅助开发' },
]
