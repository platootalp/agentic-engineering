'use client'

import { TechCategoryCard } from '@/components/tech'
import type { TechCategory } from '@/data/tech/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

// LLM算法 - 底层技术（模型、训练、优化）
const llmAlgorithmCategories: TechCategory[] = [
  {
    id: 'llm',
    name: '大语言模型',
    icon: '🧠',
    color: '#A855F7',
    problem: 'AI核心',
    description: '闭源与开源模型并存,提供强大的自然语言理解和生成能力。',
    mainstream: [
      { name: 'GPT-4o', description: 'OpenAI最新多模态模型', popularity: 'high' },
      { name: 'Claude 3.5', description: 'Anthropic高性能模型', popularity: 'high' },
      { name: 'Gemini', description: 'Google多模态大模型', popularity: 'high' },
      { name: 'Llama 3', description: 'Meta开源模型', popularity: 'high' },
      { name: 'Qwen', description: '阿里通义千问', popularity: 'rising' },
      { name: 'DeepSeek', description: '高性价比开源模型', popularity: 'rising' },
    ]
  },
  {
    id: 'multimodal',
    name: '多模态模型',
    icon: '🎨',
    color: '#C084FC',
    problem: '跨模态理解',
    description: '支持图像、文本等多模态输入,提供跨模态理解能力。',
    mainstream: [
      { name: 'GPT-4V', description: 'OpenAI视觉模型', popularity: 'high' },
      { name: 'Gemini', description: 'Google原生多模态', popularity: 'high' },
      { name: 'Claude Vision', description: 'Anthropic视觉模型', popularity: 'high' },
      { name: 'LLaVA', description: '开源视觉语言模型', popularity: 'medium' },
      { name: 'Qwen-VL', description: '通义千问视觉版', popularity: 'rising' },
    ]
  },
  {
    id: 'embedding',
    name: 'Embedding模型',
    icon: '🔢',
    color: '#06B6D4',
    problem: '文本向量化',
    description: '文本向量化模型。',
    mainstream: [
      { name: 'text-embedding-3', description: 'OpenAI嵌入', popularity: 'high' },
      { name: 'BGE', description: '中文嵌入模型', popularity: 'high' },
      { name: 'Cohere', description: 'Cohere嵌入', popularity: 'medium' },
      { name: 'Voyage', description: 'Voyage AI', popularity: 'medium' },
    ]
  },
  {
    id: 'ml',
    name: '深度学习框架',
    icon: '🔬',
    color: '#14B8A6',
    problem: '模型训练',
    description: '提供神经网络构建、训练和部署能力。',
    mainstream: [
      { name: 'PyTorch', description: '研究与应用首选', popularity: 'high' },
      { name: 'TensorFlow', description: 'Google出品', popularity: 'high' },
      { name: 'JAX', description: 'Google高性能框架', popularity: 'medium' },
      { name: 'Hugging Face', description: '模型hub', popularity: 'high' },
      { name: 'PaddlePaddle', description: '百度深度学习平台', popularity: 'medium' },
    ]
  },
  {
    id: 'finetune',
    name: '模型微调',
    icon: '⚙️',
    color: '#10B981',
    problem: '模型定制',
    description: '提供参数高效微调方法,快速定制领域模型。',
    mainstream: [
      { name: 'LoRA', description: '低秩适应微调', popularity: 'high' },
      { name: 'QLoRA', description: '量化LoRA', popularity: 'high' },
      { name: 'PEFT', description: 'HF参数高效微调', popularity: 'high' },
      { name: 'DPO', description: '直接偏好优化', popularity: 'rising' },
      { name: 'PPO', description: '近端策略优化', popularity: 'medium' },
    ]
  },
  {
    id: 'training',
    name: '训练框架',
    icon: '🏋️',
    color: '#84CC16',
    problem: '分布式训练',
    description: '大规模分布式训练框架。',
    mainstream: [
      { name: 'DeepSpeed', description: 'Microsoft训练框架', popularity: 'high' },
      { name: 'PyTorch FSDP', description: '全分片训练', popularity: 'high' },
      { name: 'Megatron-LM', description: 'NVIDIA训练', popularity: 'medium' },
      { name: 'Axolotl', description: '微调工具', popularity: 'rising' },
    ]
  },
  {
    id: 'optimization',
    name: '推理优化',
    icon: '⚡',
    color: '#EAB308',
    problem: '推理加速',
    description: '推理速度和效率优化技术。',
    mainstream: [
      { name: 'Flash Attention', description: '注意力加速', popularity: 'high' },
      { name: 'PagedAttention', description: 'vLLM核心技术', popularity: 'high' },
      { name: 'KV Cache优化', description: '缓存优化', popularity: 'high' },
      { name: 'Continuous Batching', description: '连续批处理', popularity: 'medium' },
    ]
  },
  {
    id: 'quantization',
    name: '模型量化',
    icon: '📉',
    color: '#F97316',
    problem: '模型压缩',
    description: '模型压缩和加速技术。',
    mainstream: [
      { name: 'GPTQ', description: '后训练量化', popularity: 'high' },
      { name: 'AWQ', description: '激活感知量化', popularity: 'high' },
      { name: 'GGUF', description: 'llama.cpp格式', popularity: 'high' },
      { name: 'bitsandbytes', description: '8bit量化', popularity: 'medium' },
    ]
  },
  {
    id: 'rlhf',
    name: '强化学习',
    icon: '🎯',
    color: '#EC4899',
    problem: 'RLHF',
    description: '人类反馈强化学习。',
    mainstream: [
      { name: 'DPO', description: '直接偏好优化', popularity: 'rising' },
      { name: 'PPO', description: '近端策略优化', popularity: 'high' },
      { name: 'RLHF', description: '人类反馈', popularity: 'high' },
      { name: 'KTO', description: 'Kahneman-Tversky优化', popularity: 'medium' },
    ]
  },
  {
    id: 'eval',
    name: '模型评估',
    icon: '📊',
    color: '#8B5CF6',
    problem: '能力评测',
    description: '模型能力评测和基准测试。',
    mainstream: [
      { name: 'lm-eval-harness', description: 'EleutherAI评测', popularity: 'high' },
      { name: 'OpenAI Evals', description: 'OpenAI评估', popularity: 'high' },
      { name: 'Ragas', description: 'RAG评估', popularity: 'rising' },
      { name: 'DeepEval', description: 'LLM评估', popularity: 'medium' },
    ]
  },
]

// LLM应用 - 上层应用（框架、工具、平台）
const llmApplicationCategories: TechCategory[] = [
  {
    id: 'framework',
    name: 'AI应用框架',
    icon: '🔮',
    color: '#A855F7',
    problem: '应用开发',
    description: '提供RAG、Agent等AI应用开发能力,简化LLM集成。',
    mainstream: [
      { name: 'LangChain', description: 'LLM应用开发框架', popularity: 'high' },
      { name: 'LlamaIndex', description: 'RAG框架标准', popularity: 'high' },
      { name: 'LangGraph', description: 'Agent工作流编排', popularity: 'rising' },
      { name: 'CrewAI', description: '多Agent协作', popularity: 'rising' },
      { name: 'Dify', description: 'LLM应用开发平台', popularity: 'rising' },
    ]
  },
  {
    id: 'rag',
    name: 'RAG框架',
    icon: '📚',
    color: '#9333EA',
    problem: '检索增强',
    description: '检索增强生成框架。',
    mainstream: [
      { name: 'LlamaIndex', description: 'RAG标准框架', popularity: 'high' },
      { name: 'LangChain', description: 'LLM应用链', popularity: 'high' },
      { name: 'DSPy', description: '编程式Prompt', popularity: 'rising' },
      { name: 'RAGFlow', description: '企业RAG平台', popularity: 'medium' },
    ]
  },
  {
    id: 'agent',
    name: 'Agent框架',
    icon: '🤖',
    color: '#7C3AED',
    problem: '智能体协作',
    description: '多智能体协作和工作流编排。',
    mainstream: [
      { name: 'LangGraph', description: 'Agent工作流', popularity: 'rising' },
      { name: 'CrewAI', description: '多Agent协作', popularity: 'rising' },
      { name: 'AutoGen', description: 'Microsoft Agent', popularity: 'high' },
      { name: 'Dify', description: 'LLM应用平台', popularity: 'rising' },
    ]
  },
  {
    id: 'vector',
    name: '向量数据库',
    icon: '📊',
    color: '#6366F1',
    problem: '向量检索',
    description: '专为AI应用设计的向量存储和相似度检索数据库。',
    mainstream: [
      { name: 'Milvus', description: '开源向量数据库', popularity: 'high' },
      { name: 'Qdrant', description: 'Rust实现高性能', popularity: 'high' },
      { name: 'Pinecone', description: '托管向量数据库', popularity: 'high' },
      { name: 'Chroma', description: '嵌入式向量库', popularity: 'medium' },
      { name: 'pgvector', description: 'PostgreSQL扩展', popularity: 'rising' },
    ]
  },
  {
    id: 'sdk',
    name: 'LLM SDK',
    icon: '🔧',
    color: '#3B82F6',
    problem: 'API调用',
    description: '官方SDK,直接调用更简洁。',
    mainstream: [
      { name: 'OpenAI SDK', description: 'OpenAI官方', popularity: 'high' },
      { name: 'Anthropic SDK', description: 'Claude官方', popularity: 'high' },
      { name: 'Google AI SDK', description: 'Gemini官方', popularity: 'high' },
      { name: 'LangChain', description: 'LLM应用框架', popularity: 'high' },
    ]
  },
  {
    id: 'memory',
    name: '记忆管理',
    icon: '🧠',
    color: '#06B6D4',
    problem: '长期记忆',
    description: 'LLM长期记忆和上下文管理。',
    mainstream: [
      { name: 'Mem0', description: '记忆管理标准', popularity: 'rising' },
      { name: 'Letta', description: '长期记忆', popularity: 'medium' },
      { name: 'MemGPT', description: '虚拟上下文', popularity: 'medium' },
      { name: 'LangMem', description: 'LangChain记忆', popularity: 'medium' },
    ]
  },
  {
    id: 'structured',
    name: '结构化输出',
    icon: '📋',
    color: '#14B8A6',
    problem: '结构化响应',
    description: 'LLM输出结构化数据。',
    mainstream: [
      { name: 'Instructor', description: 'Pydantic输出', popularity: 'high' },
      { name: 'Pydantic AI', description: 'Pydantic官方', popularity: 'rising' },
      { name: 'Outlines', description: '结构化生成', popularity: 'medium' },
    ]
  },
  {
    id: 'tools',
    name: 'AI开发工具',
    icon: '🛠️',
    color: '#10B981',
    problem: 'AI辅助开发',
    description: 'AI驱动的代码生成和开发辅助工具。',
    mainstream: [
      { name: 'Cursor', description: 'AI原生IDE', popularity: 'high' },
      { name: 'GitHub Copilot', description: 'GitHub AI助手', popularity: 'high' },
      { name: 'Claude Code', description: 'Anthropic代码助手', popularity: 'high' },
      { name: 'Windsurf', description: 'AI编程助手', popularity: 'rising' },
      { name: 'Continue', description: '开源AI助手', popularity: 'medium' },
    ]
  },
  {
    id: 'platform',
    name: '开发平台',
    icon: '🏗️',
    color: '#84CC16',
    problem: '快速原型',
    description: '模型托管和快速原型开发。',
    mainstream: [
      { name: 'Hugging Face', description: '模型hub', popularity: 'high' },
      { name: 'Gradio', description: '快速UI', popularity: 'high' },
      { name: 'Streamlit', description: '数据应用', popularity: 'high' },
      { name: 'Chainlit', description: 'LLM UI', popularity: 'rising' },
    ]
  },
  {
    id: 'monitoring',
    name: '质量监控',
    icon: '📡',
    color: '#EAB308',
    problem: '应用监控',
    description: 'LLM应用质量监控。',
    mainstream: [
      { name: 'LangSmith', description: 'LangChain监控', popularity: 'high' },
      { name: 'Arize', description: 'AI可观测平台', popularity: 'high' },
      { name: 'Phoenix', description: 'Arize开源', popularity: 'medium' },
      { name: 'Helicone', description: 'LLM监控', popularity: 'medium' },
    ]
  },
  {
    id: 'router',
    name: '模型路由',
    icon: '🔀',
    color: '#F97316',
    problem: '统一调用',
    description: '统一多模型调用网关。',
    mainstream: [
      { name: 'LiteLLM', description: '统一模型接口', popularity: 'high' },
      { name: 'OpenRouter', description: '模型路由平台', popularity: 'rising' },
      { name: 'Together AI', description: '开源模型API', popularity: 'medium' },
      { name: 'OneAPI', description: 'OpenAI代理', popularity: 'medium' },
    ]
  },
]

export default function AIStack() {
  const [activeTab, setActiveTab] = useState<'algorithm' | 'application'>('algorithm')
  const categories = activeTab === 'algorithm' ? llmAlgorithmCategories : llmApplicationCategories

  const {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(categories, { initialPageSize: 10 })

  const handleTabChange = (tab: 'algorithm' | 'application') => {
    setActiveTab(tab)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 dark:from-[#0f0f1a] dark:via-[#1a0f2e] dark:to-[#0f0f1a] py-10 px-5">
      <div className="max-w-[1200px] mx-auto mb-12 text-center">
        <h1 className="text-[42px] font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
          AI 开发技术栈
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[600px] mx-auto leading-relaxed">
          大语言模型、多模态、RAG、Agent - AI开发全生态
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-[600px] mx-auto mb-10 flex gap-3 p-1.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
        <button
          onClick={() => handleTabChange('algorithm')}
          className={cn(
            'flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300',
            activeTab === 'algorithm'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5'
          )}
        >
          <span className="text-lg mr-2">🔬</span>
          LLM算法
          <span className="block text-[11px] font-normal opacity-80 mt-0.5">
            模型、训练、优化
          </span>
        </button>
        <button
          onClick={() => handleTabChange('application')}
          className={cn(
            'flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300',
            activeTab === 'application'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5'
          )}
        >
          <span className="text-lg mr-2">🚀</span>
          LLM应用
          <span className="block text-[11px] font-normal opacity-80 mt-0.5">
            框架、工具、平台
          </span>
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto mb-8 flex justify-center gap-6 flex-wrap">
        {[
          { color: '#10B981', label: '主流 - 广泛采用' },
          { color: '#F59E0B', label: '常用 - 稳定使用' },
          { color: '#8B5CF6', label: '新星 - 快速崛起' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-[13px] text-slate-600 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentData.map((category) => (
          <TechCategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto mt-8">
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

      <div className="max-w-[1200px] mx-auto mt-12 text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
        <p className="text-sm text-slate-600 dark:text-slate-500">
          💡 点击卡片可展开查看更多技术 | AI技术发展迅速,建议关注最新开源模型和工具
        </p>
      </div>
    </div>
  )
}
