/**
 * LLM 技术数据
 * 包含 LLM算法 和 LLM应用 两大分类
 */

import type { TechDetail, TechDeepDive } from "./types"

const createDeepDive = (
  features: TechDeepDive["features"],
  resources: TechDeepDive["resources"],
  bestPractices: TechDeepDive["bestPractices"],
  comparisons: TechDeepDive["comparisons"],
  useCases: TechDeepDive["useCases"]
): TechDeepDive => ({
  features,
  resources,
  bestPractices,
  comparisons,
  useCases,
})

// ============================================
// LLM算法 - 深度内容定义
// ============================================

const transformerDeepDive = createDeepDive(
  [
    { title: "自注意力机制", description: "通过Query、Key、Value计算注意力权重，让模型关注输入序列的不同位置，捕捉长距离依赖关系。" },
    { title: "多头注意力", description: "并行计算多组注意力，从不同子空间学习信息，增强模型表达能力。" },
    { title: "位置编码", description: "通过正弦/余弦函数或学习的位置嵌入，为模型提供序列位置信息。" },
    { title: "编码器-解码器架构", description: "编码器处理输入序列，解码器生成输出，通过交叉注意力连接。" },
  ],
  [
    { type: "official", title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", description: "Transformer原始论文" },
    { type: "tutorial", title: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", description: "图解Transformer" },
    { type: "video", title: "Transformer详解", url: "https://www.youtube.com/watch?v=4Bdc55j80l8", description: "李沐讲解Transformer" },
  ],
  [
    { category: "模型设计", items: ["合理选择层数和维度", "使用预训练权重初始化", "注意内存和计算资源"] },
    { category: "训练技巧", items: ["使用混合精度训练", "梯度累积处理大批量", "学习率预热和衰减"] },
  ],
  [
    { techId: "rnn", techName: "RNN/LSTM", strengths: ["适合短序列", "参数量小"], weaknesses: ["难以并行", "长距离依赖差"], whenToChoose: "极短序列或资源受限场景" },
    { techId: "cnn", techName: "CNN", strengths: ["并行计算", "局部特征"], weaknesses: ["全局依赖弱"], whenToChoose: "局部模式识别任务" },
  ],
  [
    { scenario: "自然语言处理", description: "机器翻译、文本生成、问答系统", recommended: true },
    { scenario: "计算机视觉", description: "ViT等视觉Transformer", recommended: true },
    { scenario: "语音识别", description: "语音到文本转换", recommended: true },
  ]
)

export { transformerDeepDive }

const gptDeepDive = createDeepDive(
  [
    { title: "自回归生成", description: "基于前文预测下一个token，从左到右逐字生成文本。" },
    { title: "大规模预训练", description: "在海量无标注文本上预训练，学习语言知识和世界知识。" },
    { title: "上下文学习", description: "通过提示词(in-context learning)完成新任务，无需微调。" },
    { title: "RLHF对齐", description: "使用人类反馈强化学习，使模型输出符合人类偏好。" },
  ],
  [
    { type: "official", title: "OpenAI GPT", url: "https://openai.com/gpt", description: "官方文档" },
    { type: "tutorial", title: "GPT技术解析", url: "https://platform.openai.com/docs", description: "API文档" },
    { type: "book", title: "GPT-3论文", url: "https://arxiv.org/abs/2005.14165", description: "Language Models are Few-Shot Learners" },
  ],
  [
    { category: "提示工程", items: ["清晰的任务描述", "提供示例(few-shot)", "使用系统提示设定角色"] },
    { category: "API使用", items: ["控制temperature参数", "设置max_tokens限制", "处理流式输出"] },
  ],
  [
    { techId: "bert", techName: "BERT", strengths: ["双向理解", "适合理解任务"], weaknesses: ["不适合生成", "需要微调"], whenToChoose: "分类、抽取等理解任务" },
    { techId: "t5", techName: "T5", strengths: ["统一encoder-decoder", "多任务能力强"], weaknesses: ["生成质量略逊"], whenToChoose: "翻译、摘要等转换任务" },
  ],
  [
    { scenario: "文本生成", description: "文章写作、代码生成、创意写作", recommended: true },
    { scenario: "对话系统", description: "聊天机器人、客服助手", recommended: true },
    { scenario: "文本分类", description: "情感分析、主题分类", recommended: false },
  ]
)

const bertDeepDive = createDeepDive(
  [
    { title: "双向编码", description: "使用MLM(Masked Language Model)同时利用左右上下文信息。" },
    { title: "预训练+微调", description: "在大规模语料预训练，在下游任务微调，迁移学习效果显著。" },
    { title: "Transformer Encoder", description: "只使用编码器部分，专注于理解而非生成。" },
  ],
  [
    { type: "official", title: "BERT论文", url: "https://arxiv.org/abs/1810.04805", description: "Pre-training of Deep Bidirectional Transformers" },
    { type: "tutorial", title: "BERT详解", url: "https://huggingface.co/docs/transformers/model_doc/bert", description: "HuggingFace文档" },
  ],
  [
    { category: "微调策略", items: ["学习率要小(2e-5到5e-5)", "适当epoch数(2-4轮)", "使用Warmup"] },
  ],
  [
    { techId: "gpt", techName: "GPT", strengths: ["生成能力强", "零样本能力"], weaknesses: ["单向理解"], whenToChoose: "文本生成任务" },
    { techId: "roberta", techName: "RoBERTa", strengths: ["训练更充分", "性能更好"], weaknesses: ["计算成本更高"], whenToChoose: "追求最佳理解性能" },
  ],
  [
    { scenario: "文本分类", description: "情感分析、垃圾检测", recommended: true },
    { scenario: "命名实体识别", description: "人名、地名、组织名识别", recommended: true },
    { scenario: "问答系统", description: "抽取式问答", recommended: true },
  ]
)

const llamaDeepDive = createDeepDive(
  [
    { title: "开源开放", description: "模型权重开源，可本地部署和商用，社区生态丰富。" },
    { title: "高效架构", description: "使用RMSNorm、SwiGLU、RoPE等优化，提升训练稳定性。" },
    { title: "多种规模", description: "提供7B、13B、70B等不同规模，适应不同资源场景。" },
  ],
  [
    { type: "official", title: "LLaMA", url: "https://ai.meta.com/llama/", description: "Meta官方页面" },
    { type: "community", title: "HuggingFace", url: "https://huggingface.co/meta-llama", description: "模型下载" },
  ],
  [
    { category: "部署优化", items: ["使用量化降低显存", "vLLM加速推理", "考虑模型并行"] },
  ],
  [
    { techId: "gpt4", techName: "GPT-4", strengths: ["性能更强", "多模态"], weaknesses: ["闭源", "API成本"], whenToChoose: "需要最强性能且接受API" },
    { techId: "qwen", techName: "Qwen", strengths: ["中文优化", "开源"], weaknesses: ["英文稍弱"], whenToChoose: "中文场景优先" },
  ],
  [
    { scenario: "本地部署", description: "数据隐私要求高的场景", recommended: true },
    { scenario: "模型微调", description: "领域适配和定制", recommended: true },
  ]
)

const loraDeepDive = createDeepDive(
  [
    { title: "低秩适配", description: "在原始权重旁添加低秩矩阵，只训练少量参数。" },
    { title: "参数高效", description: "通常只训练0.1%-1%的参数，大幅降低计算和存储成本。" },
    { title: "即插即用", description: "可与基础模型权重分离，灵活切换不同适配器。" },
  ],
  [
    { type: "official", title: "LoRA论文", url: "https://arxiv.org/abs/2106.09685", description: "Low-Rank Adaptation of Large Language Models" },
    { type: "tutorial", title: "PEFT库", url: "https://huggingface.co/docs/peft", description: "HuggingFace参数高效微调" },
  ],
  [
    { category: "超参数", items: ["rank通常8-64", "alpha一般等于rank", "学习率可稍大"] },
  ],
  [
    { techId: "full-finetune", techName: "全量微调", strengths: ["效果可能更好", "简单直接"], weaknesses: ["资源消耗大", "灾难性遗忘"], whenToChoose: "资源充足且数据量大" },
    { techId: "prompt-tuning", techName: "Prompt Tuning", strengths: ["参数最少"], weaknesses: ["效果一般"], whenToChoose: "极度资源受限" },
  ],
  [
    { scenario: "领域适配", description: "医疗、法律等专业领域", recommended: true },
    { scenario: "任务特化", description: "特定任务性能优化", recommended: true },
  ]
)

const vllmDeepDive = createDeepDive(
  [
    { title: "PagedAttention", description: "借鉴操作系统虚拟内存管理，高效管理KV Cache。" },
    { title: "连续批处理", description: "动态添加新请求，提高GPU利用率。" },
    { title: "高吞吐量", description: "相比HuggingFace Transformers提升10-20倍吞吐量。" },
  ],
  [
    { type: "official", title: "vLLM", url: "https://docs.vllm.ai/", description: "官方文档" },
    { type: "official", title: "vLLM论文", url: "https://arxiv.org/abs/2309.06180", description: "Efficient Memory Management for LLM Serving" },
  ],
  [
    { category: "部署配置", items: ["tensor-parallel-size设置", "gpu-memory-utilization调优", "max-num-seqs控制"] },
  ],
  [
    { techId: "text-generation-inference", techName: "TGI", strengths: ["HuggingFace官方", "功能丰富"], weaknesses: ["吞吐量稍低"], whenToChoose: "需要HuggingFace生态集成" },
    { techId: "tensorrt-llm", techName: "TensorRT-LLM", strengths: ["NVIDIA优化", "极致性能"], weaknesses: ["仅N卡", "配置复杂"], whenToChoose: "NVIDIA GPU生产环境" },
  ],
  [
    { scenario: "高并发服务", description: "API服务、聊天机器人", recommended: true },
    { scenario: "本地部署", description: "个人或企业本地推理", recommended: true },
  ]
)

const pytorchDeepDive = createDeepDive(
  [
    { title: "动态图机制", description: "define-by-run，调试方便，灵活性高。" },
    { title: "Python优先", description: "原生Python体验，易于学习和使用。" },
    { title: "丰富生态", description: "TorchVision、TorchAudio、TorchText等完整工具链。" },
  ],
  [
    { type: "official", title: "PyTorch", url: "https://pytorch.org/", description: "官方网站" },
    { type: "tutorial", title: "PyTorch教程", url: "https://pytorch.org/tutorials/", description: "官方教程" },
  ],
  [
    { category: "训练优化", items: ["使用torch.compile加速", "混合精度训练", "DistributedDataParallel"] },
  ],
  [
    { techId: "tensorflow", techName: "TensorFlow", strengths: ["生产部署强", "静态图优化"], weaknesses: ["学习曲线陡", "调试困难"], whenToChoose: "生产环境部署优先" },
    { techId: "jax", techName: "JAX", strengths: ["函数式编程", "XLA编译"], weaknesses: ["生态较小"], whenToChoose: "科研和高效计算" },
  ],
  [
    { scenario: "深度学习研究", description: "学术界主流框架", recommended: true },
    { scenario: "模型训练", description: "LLM微调和训练", recommended: true },
    { scenario: "生产部署", description: "配合TorchServe", recommended: true },
  ]
)

// ============================================
// LLM应用 - 深度内容定义
// ============================================

const langchainDeepDive = createDeepDive(
  [
    { title: "链式调用", description: "将多个组件组合成链，实现复杂工作流。" },
    { title: "工具集成", description: "内置大量工具集成，如搜索引擎、数据库、API等。" },
    { title: "Agent系统", description: "让LLM自主决策，调用工具完成任务。" },
  ],
  [
    { type: "official", title: "LangChain", url: "https://python.langchain.com/", description: "官方文档" },
    { type: "official", title: "LangChain JS", url: "https://js.langchain.com/", description: "JavaScript版本" },
  ],
  [
    { category: "架构设计", items: ["模块化组件设计", "使用LCEL表达式", "合理拆分Chain"] },
  ],
  [
    { techId: "llamaindex", techName: "LlamaIndex", strengths: ["RAG专精", "索引丰富"], weaknesses: ["通用性稍弱"], whenToChoose: "主要做RAG应用" },
    { techId: "autogen", techName: "AutoGen", strengths: ["多Agent协作", "对话流程"], weaknesses: ["学习曲线陡"], whenToChoose: "复杂多Agent系统" },
  ],
  [
    { scenario: "RAG应用", description: "知识库问答", recommended: true },
    { scenario: "Agent开发", description: "自动化任务执行", recommended: true },
    { scenario: "工作流编排", description: "复杂业务流程", recommended: true },
  ]
)

const llamaindexDeepDive = createDeepDive(
  [
    { title: "数据索引", description: "多种索引策略：列表、树、向量、知识图谱等。" },
    { title: "检索优化", description: "高级检索策略：多查询、路由、递归等。" },
    { title: "数据连接器", description: "支持PDF、数据库、Notion等多种数据源。" },
  ],
  [
    { type: "official", title: "LlamaIndex", url: "https://docs.llamaindex.ai/", description: "官方文档" },
  ],
  [
    { category: "索引策略", items: ["小数据用ListIndex", "大数据用VectorStoreIndex", "层次数据用TreeIndex"] },
  ],
  [
    { techId: "langchain", techName: "LangChain", strengths: ["生态丰富", "工具多"], weaknesses: ["RAG不够专精"], whenToChoose: "需要丰富工具集成" },
    { techId: "haystack", techName: "Haystack", strengths: ["企业级", "Pipeline清晰"], weaknesses: ["社区较小"], whenToChoose: "企业RAG应用" },
  ],
  [
    { scenario: "企业知识库", description: "内部文档问答", recommended: true },
    { scenario: "多数据源RAG", description: "整合多种数据源", recommended: true },
  ]
)

const autogptDeepDive = createDeepDive(
  [
    { title: "自主Agent", description: "给定目标后自主规划、执行、反思，无需人工逐步指导。" },
    { title: "工具调用", description: "可调用搜索、文件操作、代码执行等多种工具。" },
    { title: "长期记忆", description: "使用向量数据库存储和检索历史信息。" },
  ],
  [
    { type: "official", title: "AutoGPT", url: "https://github.com/Significant-Gravitas/AutoGPT", description: "GitHub仓库" },
  ],
  [
    { category: "使用建议", items: ["设定清晰目标", "监控执行过程", "设置预算限制"] },
  ],
  [
    { techId: "langchain", techName: "LangChain", strengths: ["更成熟", "生态丰富"], weaknesses: ["需要更多配置"], whenToChoose: "生产环境应用" },
    { techId: "autogen", techName: "AutoGen", strengths: ["多Agent协作"], weaknesses: ["微软生态绑定"], whenToChoose: "多Agent对话场景" },
  ],
  [
    { scenario: "自动化任务", description: "自动完成复杂多步骤任务", recommended: true },
    { scenario: "研究助手", description: "自动搜索、整理信息", recommended: true },
  ]
)

const pineconeDeepDive = createDeepDive(
  [
    { title: "向量检索", description: "基于相似度的高效向量搜索，支持百万级规模。" },
    { title: "元数据过滤", description: "结合向量相似度和元数据过滤，精确检索。" },
    { title: "实时更新", description: "支持实时插入和更新向量数据。" },
  ],
  [
    { type: "official", title: "Pinecone", url: "https://www.pinecone.io/", description: "官方网站" },
    { type: "tutorial", title: "Pinecone Docs", url: "https://docs.pinecone.io/", description: "官方文档" },
  ],
  [
    { category: "最佳实践", items: ["选择合适的dimension", "合理设置top_k", "使用metadata过滤"] },
  ],
  [
    { techId: "weaviate", techName: "Weaviate", strengths: ["开源", "GraphQL接口"], weaknesses: ["社区较小"], whenToChoose: "需要开源方案" },
    { techId: "chromadb", techName: "ChromaDB", strengths: ["轻量", "易用"], weaknesses: ["功能较简单"], whenToChoose: "本地开发和小型项目" },
  ],
  [
    { scenario: "RAG应用", description: "大模型知识增强", recommended: true },
    { scenario: "语义搜索", description: "基于含义的搜索", recommended: true },
    { scenario: "推荐系统", description: "相似内容推荐", recommended: true },
  ]
)

const ollamaDeepDive = createDeepDive(
  [
    { title: "一键部署", description: "简单的命令行工具，一条命令运行大模型。" },
    { title: "模型管理", description: "自动下载、管理和切换不同模型。" },
    { title: "本地API", description: "提供兼容OpenAI的API接口。" },
  ],
  [
    { type: "official", title: "Ollama", url: "https://ollama.com/", description: "官方网站" },
    { type: "official", title: "Ollama GitHub", url: "https://github.com/ollama/ollama", description: "开源仓库" },
  ],
  [
    { category: "使用技巧", items: ["使用Modelfile自定义", "配合WebUI使用", "注意内存要求"] },
  ],
  [
    { techId: "lmstudio", techName: "LM Studio", strengths: ["图形界面", "更易用"], weaknesses: ["不开源", "功能受限"], whenToChoose: "需要GUI界面" },
    { techId: "textgenerationwebui", techName: "Text Generation WebUI", strengths: ["功能丰富", "高度可配置"], weaknesses: ["配置复杂"], whenToChoose: "高级用户" },
  ],
  [
    { scenario: "本地开发", description: "开发测试LLM应用", recommended: true },
    { scenario: "离线使用", description: "无网络环境下的AI助手", recommended: true },
    { scenario: "数据隐私", description: "敏感数据处理", recommended: true },
  ]
)

// ============================================
// LLM算法 - 技术数据
// ============================================

export const llmAlgorithmData: Record<string, TechDetail> = {
  transformer: {
    id: "transformer",
    name: "Transformer",
    category: "llm-algorithm",
    subcategory: "基础架构",
    description: "基于自注意力机制的深度学习架构，是现代大语言模型的基础",
    tagline: "注意力机制的革命性架构",
    version: "2017",
    pros: ["并行计算高效", "长距离依赖建模强", "可扩展性好", "成为行业标准"],
    cons: ["计算复杂度高", "内存消耗大", "对位置信息处理需额外设计"],
    bestFor: ["自然语言处理", "序列建模", "大语言模型基础"],
    notFor: ["简单序列任务", "资源极度受限场景"],
    learningCurve: "advanced",
    ecosystemScore: 98,
    popularity: { githubStars: 0 },
    companyUsers: ["Google", "OpenAI", "Meta", "Microsoft"],
    createdYear: 2017,
    maintainedBy: "Google Research",
    officialUrl: "https://arxiv.org/abs/1706.03762",
    githubUrl: "",
    documentationUrl: "https://arxiv.org/abs/1706.03762",
    alternatives: ["RNN", "LSTM", "CNN"],
    scores: {
      popularity: 95, maintenance: 95, ecosystem: 98, learningCurve: 60, enterpriseAdoption: 95,
      total: 92, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: transformerDeepDive
  },

  gpt: {
    id: "gpt",
    name: "GPT",
    category: "llm-algorithm",
    subcategory: "基础模型",
    description: "OpenAI开发的生成式预训练Transformer模型，引领大语言模型浪潮",
    tagline: "生成式AI的标杆",
    version: "GPT-4",
    pros: ["生成能力极强", "上下文学习优秀", "API生态完善", "多模态支持"],
    cons: ["闭源不透明", "API成本高", "隐私风险", "幻觉问题"],
    bestFor: ["文本生成", "对话系统", "代码辅助", "创意写作"],
    notFor: ["完全离线场景", "成本敏感应用", "需要完全可控的场景"],
    learningCurve: "intermediate",
    ecosystemScore: 95,
    popularity: { githubStars: 0 },
    companyUsers: ["Microsoft", "Stripe", "Duolingo", "Klarna"],
    createdYear: 2018,
    maintainedBy: "OpenAI",
    officialUrl: "https://openai.com/gpt",
    githubUrl: "",
    documentationUrl: "https://platform.openai.com/docs",
    alternatives: ["Claude", "LLaMA", "Qwen"],
    scores: {
      popularity: 98, maintenance: 95, ecosystem: 95, learningCurve: 80, enterpriseAdoption: 90,
      total: 93, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: gptDeepDive
  },

  bert: {
    id: "bert",
    name: "BERT",
    category: "llm-algorithm",
    subcategory: "基础模型",
    description: "Google开发的双向编码器表示模型，开创了预训练+微调范式",
    tagline: "双向编码器的先驱",
    version: "BERT-large",
    pros: ["双向理解能力强", "微调效果好", "开源可复现", "理解任务SOTA"],
    cons: ["不适合生成任务", "模型体积大", "推理速度慢"],
    bestFor: ["文本分类", "命名实体识别", "问答系统", "语义理解"],
    notFor: ["文本生成", "实时对话", "长文本处理"],
    learningCurve: "intermediate",
    ecosystemScore: 88,
    popularity: { githubStars: 38000 },
    companyUsers: ["Google", "Microsoft", "Uber", "Airbnb"],
    createdYear: 2018,
    maintainedBy: "Google",
    officialUrl: "https://arxiv.org/abs/1810.04805",
    githubUrl: "https://github.com/google-research/bert",
    documentationUrl: "https://huggingface.co/docs/transformers/model_doc/bert",
    alternatives: ["RoBERTa", "ALBERT", "DistilBERT"],
    scores: {
      popularity: 85, maintenance: 80, ecosystem: 88, learningCurve: 75, enterpriseAdoption: 85,
      total: 84, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: bertDeepDive
  },

  llama: {
    id: "llama",
    name: "LLaMA",
    category: "llm-algorithm",
    subcategory: "开源模型",
    description: "Meta开发的开源大语言模型，性能接近闭源模型，推动开源AI发展",
    tagline: "开源大模型的领导者",
    version: "LLaMA 3.1",
    pros: ["开源可商用", "性能优秀", "社区生态丰富", "可本地部署"],
    cons: ["硬件要求高", "中文能力一般", "需要微调优化"],
    bestFor: ["本地部署", "模型微调", "研究实验", "隐私敏感场景"],
    notFor: ["即开即用", "中文为主场景", "无GPU环境"],
    learningCurve: "advanced",
    ecosystemScore: 90,
    popularity: { githubStars: 55000 },
    companyUsers: ["Meta", "AWS", "Microsoft", "众多初创公司"],
    createdYear: 2023,
    maintainedBy: "Meta AI",
    officialUrl: "https://ai.meta.com/llama/",
    githubUrl: "https://github.com/meta-llama/llama",
    documentationUrl: "https://llama.meta.com/",
    alternatives: ["Qwen", "Mistral", "Falcon"],
    scores: {
      popularity: 92, maintenance: 90, ecosystem: 90, learningCurve: 65, enterpriseAdoption: 80,
      total: 87, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: llamaDeepDive
  },

  lora: {
    id: "lora",
    name: "LoRA",
    category: "llm-algorithm",
    subcategory: "微调技术",
    description: "低秩适配技术，高效微调大语言模型的参数高效方法",
    tagline: "参数高效微调的标准",
    version: "1.0",
    pros: ["参数效率极高", "显存占用低", "可切换适配器", "效果接近全量微调"],
    cons: ["超参数需调优", "某些任务效果略差", "rank选择困难"],
    bestFor: ["领域适配", "任务特化", "资源受限微调", "多任务切换"],
    notFor: ["从头训练", "需要完全新能力"],
    learningCurve: "intermediate",
    ecosystemScore: 85,
    popularity: { githubStars: 15000 },
    companyUsers: ["Microsoft", "HuggingFace", "众多AI公司"],
    createdYear: 2021,
    maintainedBy: "Microsoft Research",
    officialUrl: "https://arxiv.org/abs/2106.09685",
    githubUrl: "https://github.com/microsoft/LoRA",
    documentationUrl: "https://huggingface.co/docs/peft",
    alternatives: ["Prefix Tuning", "Prompt Tuning", "Adapter"],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 85, learningCurve: 75, enterpriseAdoption: 85,
      total: 86, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: loraDeepDive
  },

  vllm: {
    id: "vllm",
    name: "vLLM",
    category: "llm-algorithm",
    subcategory: "推理优化",
    description: "高吞吐量大语言模型推理引擎，使用PagedAttention技术",
    tagline: "LLM推理性能优化利器",
    version: "0.5.0",
    pros: ["吞吐量极高", "内存利用率高", "兼容性好", "开源免费"],
    cons: ["仅支持部分模型", "配置较复杂", "需要GPU"],
    bestFor: ["高并发服务", "生产部署", "成本优化", "本地推理"],
    notFor: ["CPU推理", "边缘设备", "所有模型类型"],
    learningCurve: "advanced",
    ecosystemScore: 82,
    popularity: { githubStars: 28000 },
    companyUsers: ["Anyscale", "Replicate", "Together AI"],
    createdYear: 2023,
    maintainedBy: "Berkeley AI Research",
    officialUrl: "https://docs.vllm.ai/",
    githubUrl: "https://github.com/vllm-project/vllm",
    documentationUrl: "https://docs.vllm.ai/",
    alternatives: ["TGI", "TensorRT-LLM", "DeepSpeed"],
    scores: {
      popularity: 85, maintenance: 90, ecosystem: 82, learningCurve: 65, enterpriseAdoption: 75,
      total: 82, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: vllmDeepDive
  },

  pytorch: {
    id: "pytorch",
    name: "PyTorch",
    category: "llm-algorithm",
    subcategory: "训练框架",
    description: "开源深度学习框架，学术界和工业界的主流选择",
    tagline: "深度学习研究的首选框架",
    version: "2.3.0",
    pros: ["动态图灵活", "调试方便", "生态丰富", "学术界主流"],
    cons: ["生产部署较复杂", "移动端支持一般"],
    bestFor: ["模型研究", "LLM训练", "原型开发", "学术论文"],
    notFor: ["生产推理", "移动端部署"],
    learningCurve: "intermediate",
    ecosystemScore: 95,
    popularity: { githubStars: 85000 },
    companyUsers: ["Meta", "OpenAI", "HuggingFace", "Tesla"],
    createdYear: 2016,
    maintainedBy: "Meta AI",
    officialUrl: "https://pytorch.org/",
    githubUrl: "https://github.com/pytorch/pytorch",
    documentationUrl: "https://pytorch.org/docs/",
    alternatives: ["TensorFlow", "JAX", "PaddlePaddle"],
    scores: {
      popularity: 95, maintenance: 95, ecosystem: 95, learningCurve: 80, enterpriseAdoption: 90,
      total: 93, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: pytorchDeepDive
  },

  // ===== 新增：更多企业级LLM算法技术 =====

  claude: {
    id: "claude",
    name: "Claude",
    category: "llm-algorithm",
    subcategory: "基础模型",
    description: "Anthropic开发的AI助手，以安全性和长上下文著称，企业级应用首选",
    tagline: "企业级安全AI助手",
    version: "Claude 3.5 Sonnet",
    pros: ["超长上下文(200K)", "安全性高", "代码能力强", "企业级SLA", "多模态支持"],
    cons: ["API成本较高", "部分地区受限", "闭源不透明"],
    bestFor: ["企业文档处理", "代码审查", "长文本分析", "安全敏感场景"],
    notFor: ["成本敏感应用", "需要开源的场景"],
    learningCurve: "beginner",
    ecosystemScore: 88,
    popularity: { githubStars: 0 },
    companyUsers: ["Anthropic", "Notion", "Quora", "DuckDuckGo", "Northwestern Mutual"],
    createdYear: 2021,
    maintainedBy: "Anthropic",
    officialUrl: "https://claude.ai/",
    githubUrl: "",
    documentationUrl: "https://docs.anthropic.com/",
    alternatives: ["GPT-4", "Gemini", "LLaMA"],
    scores: {
      popularity: 88, maintenance: 95, ecosystem: 88, learningCurve: 85, enterpriseAdoption: 90,
      total: 90, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "Constitutional AI", description: "基于宪法AI的对齐技术，确保输出安全、有用、诚实。" },
        { title: "超长上下文", description: "支持200K token上下文，可处理整本书或大型代码库。" },
        { title: "Artifacts功能", description: "可生成和迭代完整的代码、文档、图表等内容。" }
      ],
      resources: [
        { type: "official", title: "Claude文档", url: "https://docs.anthropic.com/", description: "官方API文档" },
        { type: "tutorial", title: "Claude使用指南", url: "https://docs.anthropic.com/claude/docs", description: "最佳实践" }
      ],
      bestPractices: [
        { category: "提示工程", items: ["使用XML标签结构化提示", "提供清晰的上下文", "利用长上下文优势"] }
      ],
      comparisons: [
        { techId: "gpt4", techName: "GPT-4", strengths: ["上下文更长", "安全性更好"], weaknesses: ["工具生态稍弱"], whenToChoose: "需要长上下文或高安全性时" }
      ],
      useCases: [
        { scenario: "企业知识库", description: "处理大量内部文档", recommended: true },
        { scenario: "代码审查", description: "分析大型代码库", recommended: true }
      ]
    }
  },

  qwen: {
    id: "qwen",
    name: "Qwen",
    category: "llm-algorithm",
    subcategory: "开源模型",
    description: "阿里巴巴开源的大语言模型，中文能力优秀，支持多模态",
    tagline: "中文开源大模型领导者",
    version: "Qwen2.5",
    pros: ["中文能力极强", "开源可商用", "多模态支持", "代码能力强", "中文文档丰富"],
    cons: ["英文稍弱", "国际生态较小", "部分功能受限"],
    bestFor: ["中文应用", "国内企业", "中文代码生成", "多模态应用"],
    notFor: ["纯英文场景", "需要国际生态"],
    learningCurve: "intermediate",
    ecosystemScore: 85,
    popularity: { githubStars: 15000 },
    companyUsers: ["阿里巴巴", "钉钉", "通义千问", "众多中国企业"],
    createdYear: 2023,
    maintainedBy: "阿里巴巴",
    officialUrl: "https://qwen.ai/",
    githubUrl: "https://github.com/QwenLM/Qwen",
    documentationUrl: "https://qwen.readthedocs.io/",
    alternatives: ["LLaMA", "ChatGLM", "Baichuan"],
    scores: {
      popularity: 85, maintenance: 90, ecosystem: 85, learningCurve: 80, enterpriseAdoption: 88,
      total: 87, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "中文优化", description: "针对中文语料深度优化，中文理解和生成能力领先。" },
        { title: "多模态", description: "支持文本、图像、音频多模态理解和生成。" },
        { title: "工具调用", description: "原生支持函数调用和工具使用。" }
      ],
      resources: [
        { type: "official", title: "Qwen文档", url: "https://qwen.readthedocs.io/", description: "官方文档" },
        { type: "community", title: "ModelScope", url: "https://modelscope.cn/", description: "模型下载" }
      ],
      bestPractices: [
        { category: "部署", items: ["使用vLLM加速", "量化降低显存", "考虑中文分词"] }
      ],
      comparisons: [
        { techId: "llama", techName: "LLaMA", strengths: ["中文更好", "国内支持好"], weaknesses: ["英文稍弱"], whenToChoose: "中文场景优先" }
      ],
      useCases: [
        { scenario: "中文客服", description: "中文对话和理解", recommended: true },
        { scenario: "中文内容生成", description: "文章、报告生成", recommended: true }
      ]
    }
  },

  deepspeed: {
    id: "deepspeed",
    name: "DeepSpeed",
    category: "llm-algorithm",
    subcategory: "训练框架",
    description: "微软开源的深度学习优化库，专为大规模模型训练设计",
    tagline: "大规模模型训练利器",
    version: "0.15.0",
    pros: ["ZeRO优化器", "模型并行", "3D并行", "显存优化", "微软支持"],
    cons: ["配置复杂", "学习曲线陡", "调试困难"],
    bestFor: ["大模型训练", "分布式训练", "显存优化", "企业级训练"],
    notFor: ["小规模训练", "快速原型", "资源受限"],
    learningCurve: "advanced",
    ecosystemScore: 88,
    popularity: { githubStars: 35000 },
    companyUsers: ["Microsoft", "OpenAI", "众多AI公司"],
    createdYear: 2020,
    maintainedBy: "Microsoft",
    officialUrl: "https://www.deepspeed.ai/",
    githubUrl: "https://github.com/microsoft/DeepSpeed",
    documentationUrl: "https://www.deepspeed.ai/docs/",
    alternatives: ["FSDP", "Megatron-LM", "Colossal-AI"],
    scores: {
      popularity: 88, maintenance: 92, ecosystem: 88, learningCurve: 60, enterpriseAdoption: 85,
      total: 85, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "ZeRO优化", description: "Zero Redundancy Optimizer，将优化器状态分片到多个GPU。" },
        { title: "3D并行", description: "数据并行+模型并行+流水线并行的组合策略。" },
        { title: "显存优化", description: "Offload、Activation Checkpointing等技术大幅降低显存需求。" }
      ],
      resources: [
        { type: "official", title: "DeepSpeed文档", url: "https://www.deepspeed.ai/", description: "官方文档" },
        { type: "tutorial", title: "DeepSpeed教程", url: "https://www.deepspeed.ai/tutorials/", description: "官方教程" }
      ],
      bestPractices: [
        { category: "配置", items: ["从ZeRO-1开始", "逐步增加并行度", "监控显存使用"] }
      ],
      comparisons: [
        { techId: "fsdp", techName: "FSDP", strengths: ["功能更丰富", "微软支持"], weaknesses: ["配置更复杂"], whenToChoose: "需要高级优化功能" }
      ],
      useCases: [
        { scenario: "百亿级模型训练", description: "超大规模模型训练", recommended: true },
        { scenario: "显存受限训练", description: "优化显存使用", recommended: true }
      ]
    }
  },

  llama_cpp: {
    id: "llama_cpp",
    name: "llama.cpp",
    category: "llm-algorithm",
    subcategory: "推理优化",
    description: "纯C/C++实现的LLM推理引擎，支持多种量化格式，跨平台部署",
    tagline: "跨平台LLM推理引擎",
    version: "b3800",
    pros: ["跨平台", "多种量化支持", "纯CPU运行", "轻量级", "移动设备支持"],
    cons: ["功能相对简单", "性能不如GPU方案", "配置较复杂"],
    bestFor: ["边缘部署", "移动设备", "CPU推理", "跨平台应用"],
    notFor: ["高性能GPU场景", "需要高级功能"],
    learningCurve: "intermediate",
    ecosystemScore: 82,
    popularity: { githubStars: 65000 },
    companyUsers: ["个人开发者", "边缘计算项目"],
    createdYear: 2023,
    maintainedBy: "Georgi Gerganov",
    officialUrl: "https://github.com/ggerganov/llama.cpp",
    githubUrl: "https://github.com/ggerganov/llama.cpp",
    documentationUrl: "https://github.com/ggerganov/llama.cpp/blob/master/README.md",
    alternatives: ["Ollama", "MLC LLM", "Mamba"],
    scores: {
      popularity: 90, maintenance: 90, ecosystem: 82, learningCurve: 75, enterpriseAdoption: 70,
      total: 84, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "量化支持", description: "支持Q4、Q5、Q8等多种量化格式，大幅降低模型体积。" },
        { title: "跨平台", description: "支持Windows、Linux、macOS、iOS、Android等多种平台。" },
        { title: "纯CPU推理", description: "无需GPU即可运行，适合边缘设备。" }
      ],
      resources: [
        { type: "official", title: "GitHub", url: "https://github.com/ggerganov/llama.cpp", description: "开源仓库" }
      ],
      bestPractices: [
        { category: "量化", items: ["Q4_K_M平衡性能和精度", "测试不同量化方案", "注意内存对齐"] }
      ],
      comparisons: [
        { techId: "vllm", techName: "vLLM", strengths: ["跨平台", "CPU支持"], weaknesses: ["GPU性能不如vLLM"], whenToChoose: "需要CPU或跨平台部署" }
      ],
      useCases: [
        { scenario: "边缘设备", description: "物联网设备部署", recommended: true },
        { scenario: "移动应用", description: "手机端AI功能", recommended: true }
      ]
    }
  },

  tensorrt_llm: {
    id: "tensorrt_llm",
    name: "TensorRT-LLM",
    category: "llm-algorithm",
    subcategory: "推理优化",
    description: "NVIDIA推出的LLM推理优化库，提供极致的GPU性能",
    tagline: "NVIDIA GPU推理性能之王",
    version: "0.14.0",
    pros: ["极致性能", "NVIDIA官方支持", "FP8支持", "多GPU并行", "生产级稳定"],
    cons: ["仅NVIDIA GPU", "配置复杂", "闭源", "学习曲线陡"],
    bestFor: ["NVIDIA GPU生产环境", "极致性能需求", "企业级部署"],
    notFor: ["非NVIDIA硬件", "快速原型", "开源要求"],
    learningCurve: "advanced",
    ecosystemScore: 85,
    popularity: { githubStars: 9000 },
    companyUsers: ["NVIDIA", "众多使用NVIDIA GPU的企业"],
    createdYear: 2023,
    maintainedBy: "NVIDIA",
    officialUrl: "https://developer.nvidia.com/tensorrt",
    githubUrl: "https://github.com/NVIDIA/TensorRT-LLM",
    documentationUrl: "https://nvidia.github.io/TensorRT-LLM/",
    alternatives: ["vLLM", "TGI", "DeepSpeed Inference"],
    scores: {
      popularity: 75, maintenance: 95, ecosystem: 85, learningCurve: 60, enterpriseAdoption: 85,
      total: 82, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "FP8推理", description: "支持FP8精度推理，大幅提升吞吐量和降低显存。" },
        { title: "In-Flight Batching", description: "动态批处理技术，最大化GPU利用率。" },
        { title: "多GPU并行", description: "支持Tensor并行和Pipeline并行。" }
      ],
      resources: [
        { type: "official", title: "TensorRT-LLM文档", url: "https://nvidia.github.io/TensorRT-LLM/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "优化", items: ["使用FP8降低显存", "调整batch size", "启用In-Flight Batching"] }
      ],
      comparisons: [
        { techId: "vllm", techName: "vLLM", strengths: ["性能更高", "NVIDIA优化"], weaknesses: ["仅N卡", "闭源"], whenToChoose: "NVIDIA GPU生产环境" }
      ],
      useCases: [
        { scenario: "高吞吐服务", description: "企业级API服务", recommended: true },
        { scenario: "成本优化", description: "降低推理成本", recommended: true }
      ]
    }
  },
}

// ============================================
// LLM应用 - 技术数据
// ============================================

export const llmApplicationData: Record<string, TechDetail> = {
  langchain: {
    id: "langchain",
    name: "LangChain",
    category: "llm-application",
    subcategory: "应用框架",
    description: "构建LLM应用的开发框架，提供链式调用、工具集成和Agent能力",
    tagline: "LLM应用开发的事实标准",
    version: "0.3.0",
    pros: ["生态丰富", "组件模块化", "多语言支持", "社区活跃"],
    cons: ["学习曲线陡", "版本迭代快", "部分功能冗余"],
    bestFor: ["RAG应用", "Agent开发", "工作流编排", "原型开发"],
    notFor: ["简单API调用", "性能敏感场景"],
    learningCurve: "intermediate",
    ecosystemScore: 92,
    popularity: { githubStars: 95000 },
    companyUsers: ["Microsoft", "Google", "Amazon", "众多初创公司"],
    createdYear: 2022,
    maintainedBy: "LangChain Inc",
    officialUrl: "https://python.langchain.com/",
    githubUrl: "https://github.com/langchain-ai/langchain",
    documentationUrl: "https://python.langchain.com/docs/",
    alternatives: ["LlamaIndex", "Haystack", "Semantic Kernel"],
    scores: {
      popularity: 95, maintenance: 92, ecosystem: 92, learningCurve: 75, enterpriseAdoption: 88,
      total: 91, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "链式调用", description: "将多个组件组合成链，实现复杂工作流。" },
        { title: "工具集成", description: "内置大量工具集成，如搜索引擎、数据库、API等。" },
        { title: "Agent系统", description: "让LLM自主决策，调用工具完成任务。" }
      ],
      resources: [
        { type: "official", title: "LangChain文档", url: "https://python.langchain.com/", description: "官方文档" },
        { type: "official", title: "LangChain JS", url: "https://js.langchain.com/", description: "JavaScript版本" }
      ],
      bestPractices: [
        { category: "架构设计", items: ["模块化组件设计", "使用LCEL表达式", "合理拆分Chain"] }
      ],
      comparisons: [
        { techId: "llamaindex", techName: "LlamaIndex", strengths: ["生态丰富", "工具多"], weaknesses: ["RAG不够专精"], whenToChoose: "需要丰富工具集成" }
      ],
      useCases: [
        { scenario: "RAG应用", description: "知识库问答", recommended: true },
        { scenario: "Agent开发", description: "自动化任务执行", recommended: true }
      ]
    }
  },

  llamaindex: {
    id: "llamaindex",
    name: "LlamaIndex",
    category: "llm-application",
    subcategory: "RAG框架",
    description: "专注于RAG的数据框架，提供丰富的索引和检索策略",
    tagline: "RAG应用的专业框架",
    version: "0.11.0",
    pros: ["RAG专精", "索引策略丰富", "数据连接器多", "检索优化强"],
    cons: ["通用性较弱", "学习成本较高", "社区比LangChain小"],
    bestFor: ["企业知识库", "文档问答", "多数据源RAG", "高级检索"],
    notFor: ["简单Agent", "非RAG应用"],
    learningCurve: "intermediate",
    ecosystemScore: 85,
    popularity: { githubStars: 35000 },
    companyUsers: ["Uber", "Dropbox", "Salesforce"],
    createdYear: 2022,
    maintainedBy: "LlamaIndex Inc",
    officialUrl: "https://www.llamaindex.ai/",
    githubUrl: "https://github.com/run-llama/llama_index",
    documentationUrl: "https://docs.llamaindex.ai/",
    alternatives: ["LangChain", "Haystack", "Vercel AI SDK"],
    scores: {
      popularity: 85, maintenance: 90, ecosystem: 85, learningCurve: 75, enterpriseAdoption: 80,
      total: 85, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "数据索引", description: "多种索引策略：列表、树、向量、知识图谱等。" },
        { title: "检索优化", description: "高级检索策略：多查询、路由、递归等。" },
        { title: "数据连接器", description: "支持PDF、数据库、Notion等多种数据源。" }
      ],
      resources: [
        { type: "official", title: "LlamaIndex文档", url: "https://docs.llamaindex.ai/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "索引策略", items: ["小数据用ListIndex", "大数据用VectorStoreIndex", "层次数据用TreeIndex"] }
      ],
      comparisons: [
        { techId: "langchain", techName: "LangChain", strengths: ["RAG专精", "索引丰富"], weaknesses: ["通用性稍弱"], whenToChoose: "主要做RAG应用" }
      ],
      useCases: [
        { scenario: "企业知识库", description: "内部文档问答", recommended: true },
        { scenario: "多数据源RAG", description: "整合多种数据源", recommended: true }
      ]
    }
  },

  autogpt: {
    id: "autogpt",
    name: "AutoGPT",
    category: "llm-application",
    subcategory: "Agent框架",
    description: "自主AI Agent，能够自动分解任务、执行并反思结果",
    tagline: "自主AI Agent的先驱",
    version: "0.5.0",
    pros: ["自主决策", "自动规划", "工具丰富", "开源"],
    cons: ["稳定性一般", "成本高", "结果不可控", "实际应用有限"],
    bestFor: ["自动化研究", "任务自动化", "概念验证", "学习Agent"],
    notFor: ["生产环境", "关键任务", "成本敏感场景"],
    learningCurve: "advanced",
    ecosystemScore: 75,
    popularity: { githubStars: 165000 },
    companyUsers: ["个人开发者", "研究项目"],
    createdYear: 2023,
    maintainedBy: "Significant Gravitas",
    officialUrl: "https://agpt.co/",
    githubUrl: "https://github.com/Significant-Gravitas/AutoGPT",
    documentationUrl: "https://docs.agpt.co/",
    alternatives: ["AutoGen", "LangChain Agent", "BabyAGI"],
    scores: {
      popularity: 90, maintenance: 75, ecosystem: 75, learningCurve: 60, enterpriseAdoption: 50,
      total: 75, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "自主Agent", description: "给定目标后自主规划、执行、反思，无需人工逐步指导。" },
        { title: "工具调用", description: "可调用搜索、文件操作、代码执行等多种工具。" },
        { title: "长期记忆", description: "使用向量数据库存储和检索历史信息。" }
      ],
      resources: [
        { type: "official", title: "AutoGPT GitHub", url: "https://github.com/Significant-Gravitas/AutoGPT", description: "开源仓库" }
      ],
      bestPractices: [
        { category: "使用建议", items: ["设定清晰目标", "监控执行过程", "设置预算限制"] }
      ],
      comparisons: [
        { techId: "langchain", techName: "LangChain", strengths: ["更成熟", "生态丰富"], weaknesses: ["需要更多配置"], whenToChoose: "生产环境应用" }
      ],
      useCases: [
        { scenario: "自动化任务", description: "自动完成复杂多步骤任务", recommended: true },
        { scenario: "研究助手", description: "自动搜索、整理信息", recommended: true }
      ]
    }
  },

  pinecone: {
    id: "pinecone",
    name: "Pinecone",
    category: "llm-application",
    subcategory: "向量数据库",
    description: "托管式向量数据库服务，专为AI应用设计的高性能向量检索",
    tagline: "面向AI的向量数据库",
    version: "2024",
    pros: ["完全托管", "高性能", "易扩展", "即开即用"],
    cons: ["成本较高", "厂商锁定", "开源替代多"],
    bestFor: ["RAG应用", "语义搜索", "推荐系统", "快速启动"],
    notFor: ["成本敏感", "需要本地部署", "简单应用"],
    learningCurve: "beginner",
    ecosystemScore: 88,
    popularity: { githubStars: 0 },
    companyUsers: ["Shopify", "HubSpot", "Gong", "Zapier"],
    createdYear: 2019,
    maintainedBy: "Pinecone Systems",
    officialUrl: "https://www.pinecone.io/",
    githubUrl: "",
    documentationUrl: "https://docs.pinecone.io/",
    alternatives: ["Weaviate", "ChromaDB", "Milvus"],
    scores: {
      popularity: 85, maintenance: 90, ecosystem: 88, learningCurve: 85, enterpriseAdoption: 85,
      total: 87, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "向量检索", description: "基于相似度的高效向量搜索，支持百万级规模。" },
        { title: "元数据过滤", description: "结合向量相似度和元数据过滤，精确检索。" },
        { title: "实时更新", description: "支持实时插入和更新向量数据。" }
      ],
      resources: [
        { type: "official", title: "Pinecone文档", url: "https://docs.pinecone.io/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "最佳实践", items: ["选择合适的dimension", "合理设置top_k", "使用metadata过滤"] }
      ],
      comparisons: [
        { techId: "weaviate", techName: "Weaviate", strengths: ["托管服务", "易用"], weaknesses: ["成本较高"], whenToChoose: "需要快速启动" }
      ],
      useCases: [
        { scenario: "RAG应用", description: "大模型知识增强", recommended: true },
        { scenario: "语义搜索", description: "基于含义的搜索", recommended: true }
      ]
    }
  },

  ollama: {
    id: "ollama",
    name: "Ollama",
    category: "llm-application",
    subcategory: "部署工具",
    description: "本地运行大语言模型的工具，一键部署开源模型",
    tagline: "本地运行LLM的最简单方式",
    version: "0.3.0",
    pros: ["一键部署", "简单易用", "开源免费", "API兼容"],
    cons: ["硬件要求高", "模型选择有限", "性能不如云端"],
    bestFor: ["本地开发", "离线使用", "隐私保护", "学习实验"],
    notFor: ["生产环境", "高并发", "无GPU设备"],
    learningCurve: "beginner",
    ecosystemScore: 80,
    popularity: { githubStars: 90000 },
    companyUsers: ["个人开发者", "小型团队"],
    createdYear: 2023,
    maintainedBy: "Ollama Inc",
    officialUrl: "https://ollama.com/",
    githubUrl: "https://github.com/ollama/ollama",
    documentationUrl: "https://github.com/ollama/ollama/blob/main/README.md",
    alternatives: ["LM Studio", "Text Generation WebUI", "llama.cpp"],
    scores: {
      popularity: 92, maintenance: 90, ecosystem: 80, learningCurve: 90, enterpriseAdoption: 60,
      total: 85, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "一键部署", description: "简单的命令行工具，一条命令运行大模型。" },
        { title: "模型管理", description: "自动下载、管理和切换不同模型。" },
        { title: "本地API", description: "提供兼容OpenAI的API接口。" }
      ],
      resources: [
        { type: "official", title: "Ollama官网", url: "https://ollama.com/", description: "官方网站" }
      ],
      bestPractices: [
        { category: "使用技巧", items: ["使用Modelfile自定义", "配合WebUI使用", "注意内存要求"] }
      ],
      comparisons: [
        { techId: "lmstudio", techName: "LM Studio", strengths: ["简单", "开源"], weaknesses: ["功能较少"], whenToChoose: "开发者本地使用" }
      ],
      useCases: [
        { scenario: "本地开发", description: "开发测试LLM应用", recommended: true },
        { scenario: "离线使用", description: "无网络环境下的AI助手", recommended: true }
      ]
    }
  },

  // ===== 新增：更多企业级LLM应用技术 =====

  haystack: {
    id: "haystack",
    name: "Haystack",
    category: "llm-application",
    subcategory: "RAG框架",
    description: "端到端NLP框架，专注于构建生产级搜索和问答系统",
    tagline: "企业级NLP和搜索框架",
    version: "2.8.0",
    pros: ["Pipeline架构清晰", "企业级功能", "多种检索器", "可扩展性强", "德企出品"],
    cons: ["社区较小", "学习曲线陡", "文档不够丰富"],
    bestFor: ["企业搜索", "知识库问答", "文档处理", "生产级RAG"],
    notFor: ["快速原型", "小型项目", "社区支持需求"],
    learningCurve: "advanced",
    ecosystemScore: 78,
    popularity: { githubStars: 15000 },
    companyUsers: ["SAP", "Airbus", "Bosch", "欧洲企业"],
    createdYear: 2019,
    maintainedBy: "deepset",
    officialUrl: "https://haystack.deepset.ai/",
    githubUrl: "https://github.com/deepset-ai/haystack",
    documentationUrl: "https://docs.haystack.deepset.ai/",
    alternatives: ["LangChain", "LlamaIndex", "Vercel AI SDK"],
    scores: {
      popularity: 78, maintenance: 88, ecosystem: 78, learningCurve: 70, enterpriseAdoption: 82,
      total: 81, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "Pipeline架构", description: "模块化Pipeline设计，组件可自由组合和替换。" },
        { title: "多种检索器", description: "支持BM25、Embedding、多模态等多种检索方式。" },
        { title: "Agent支持", description: "内置Agent能力，支持工具调用和多步推理。" }
      ],
      resources: [
        { type: "official", title: "Haystack文档", url: "https://docs.haystack.deepset.ai/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "Pipeline设计", items: ["模块化组件", "合理选择检索器", "添加评估节点"] }
      ],
      comparisons: [
        { techId: "langchain", techName: "LangChain", strengths: ["企业级功能", "Pipeline清晰"], weaknesses: ["社区较小"], whenToChoose: "需要企业级RAG方案" }
      ],
      useCases: [
        { scenario: "企业搜索", description: "内部文档搜索", recommended: true },
        { scenario: "合规审查", description: "文档合规检查", recommended: true }
      ]
    }
  },

  autogen: {
    id: "autogen",
    name: "AutoGen",
    category: "llm-application",
    subcategory: "Agent框架",
    description: "微软开源的多Agent对话框架，支持复杂的多Agent协作",
    tagline: "多Agent协作框架",
    version: "0.4.0",
    pros: ["多Agent协作", "微软支持", "对话流程", "代码生成强", "灵活配置"],
    cons: ["学习曲线陡", "配置复杂", "文档分散", "调试困难"],
    bestFor: ["多Agent系统", "复杂任务分解", "代码生成团队", "研究项目"],
    notFor: ["简单应用", "快速原型", "资源受限"],
    learningCurve: "advanced",
    ecosystemScore: 82,
    popularity: { githubStars: 35000 },
    companyUsers: ["Microsoft", "研究机构", "AI实验室"],
    createdYear: 2023,
    maintainedBy: "Microsoft",
    officialUrl: "https://microsoft.github.io/autogen/",
    githubUrl: "https://github.com/microsoft/autogen",
    documentationUrl: "https://microsoft.github.io/autogen/docs/",
    alternatives: ["LangChain Agent", "CrewAI", "AutoGPT"],
    scores: {
      popularity: 85, maintenance: 90, ecosystem: 82, learningCurve: 65, enterpriseAdoption: 78,
      total: 83, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "多Agent对话", description: "支持多个Agent之间的对话和协作完成任务。" },
        { title: "代码执行", description: "Agent可以生成和执行代码，实现复杂计算。" },
        { title: "人类参与", description: "支持人类在循环中，可介入Agent对话。" }
      ],
      resources: [
        { type: "official", title: "AutoGen文档", url: "https://microsoft.github.io/autogen/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "Agent设计", items: ["明确定义Agent角色", "设计好对话流程", "设置终止条件"] }
      ],
      comparisons: [
        { techId: "crewai", techName: "CrewAI", strengths: ["微软支持", "更成熟"], weaknesses: ["更复杂"], whenToChoose: "需要复杂多Agent系统" }
      ],
      useCases: [
        { scenario: "软件开发", description: "多Agent协作编程", recommended: true },
        { scenario: "数据分析", description: "数据处理和可视化", recommended: true }
      ]
    }
  },

  crewai: {
    id: "crewai",
    name: "CrewAI",
    category: "llm-application",
    subcategory: "Agent框架",
    description: "多Agent团队协作框架，角色扮演和任务分配",
    tagline: "多Agent团队编排框架",
    version: "0.86.0",
    pros: ["角色扮演", "任务分配", "易用性好", "流程清晰", "Pythonic"],
    cons: ["相对较新", "功能有限", "社区较小", "企业级功能待完善"],
    bestFor: ["角色扮演场景", "团队协作模拟", "内容创作", "研究项目"],
    notFor: ["生产环境", "复杂逻辑", "需要高度可控"],
    learningCurve: "intermediate",
    ecosystemScore: 75,
    popularity: { githubStars: 22000 },
    companyUsers: ["初创公司", "内容团队", "研究机构"],
    createdYear: 2023,
    maintainedBy: "João Moura",
    officialUrl: "https://www.crewai.com/",
    githubUrl: "https://github.com/crewAIInc/crewAI",
    documentationUrl: "https://docs.crewai.com/",
    alternatives: ["AutoGen", "LangChain Agent", "AutoGPT"],
    scores: {
      popularity: 82, maintenance: 85, ecosystem: 75, learningCurve: 80, enterpriseAdoption: 65,
      total: 80, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "角色定义", description: "为每个Agent定义角色、目标和背景故事。" },
        { title: "任务分配", description: "将复杂任务分解为子任务分配给不同Agent。" },
        { title: "流程编排", description: "顺序、并行、条件等多种任务执行流程。" }
      ],
      resources: [
        { type: "official", title: "CrewAI文档", url: "https://docs.crewai.com/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "设计", items: ["明确定义角色", "合理分解任务", "设置清晰目标"] }
      ],
      comparisons: [
        { techId: "autogen", techName: "AutoGen", strengths: ["更易用", "角色扮演"], weaknesses: ["功能较少"], whenToChoose: "需要角色扮演场景" }
      ],
      useCases: [
        { scenario: "内容创作", description: "多角色协作写作", recommended: true },
        { scenario: "市场调研", description: "多Agent调研分析", recommended: true }
      ]
    }
  },

  weaviate: {
    id: "weaviate",
    name: "Weaviate",
    category: "llm-application",
    subcategory: "向量数据库",
    description: "开源向量数据库，支持GraphQL接口和混合搜索",
    tagline: "开源向量搜索引擎",
    version: "1.27.0",
    pros: ["开源", "GraphQL接口", "混合搜索", "模块化", "云原生"],
    cons: ["学习曲线陡", "资源占用较高", "社区较小"],
    bestFor: ["需要开源方案", "GraphQL偏好", "混合搜索", "云原生部署"],
    notFor: ["快速启动", "简单应用", "资源受限"],
    learningCurve: "intermediate",
    ecosystemScore: 82,
    popularity: { githubStars: 11000 },
    companyUsers: ["Reddit", "StackOverflow", "Instacart"],
    createdYear: 2019,
    maintainedBy: "Weaviate",
    officialUrl: "https://weaviate.io/",
    githubUrl: "https://github.com/weaviate/weaviate",
    documentationUrl: "https://weaviate.io/developers/weaviate",
    alternatives: ["Pinecone", "ChromaDB", "Milvus"],
    scores: {
      popularity: 82, maintenance: 88, ecosystem: 82, learningCurve: 75, enterpriseAdoption: 80,
      total: 83, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "GraphQL接口", description: "使用GraphQL进行查询，灵活且类型安全。" },
        { title: "混合搜索", description: "结合向量相似度和BM25关键词搜索。" },
        { title: "模块化", description: "可插拔的向量化模型和扩展模块。" }
      ],
      resources: [
        { type: "official", title: "Weaviate文档", url: "https://weaviate.io/developers/weaviate", description: "官方文档" }
      ],
      bestPractices: [
        { category: "设计", items: ["合理设计Schema", "选择合适的向量化模型", "使用混合搜索"] }
      ],
      comparisons: [
        { techId: "pinecone", techName: "Pinecone", strengths: ["开源", "GraphQL"], weaknesses: ["需要自托管"], whenToChoose: "需要开源和可控" }
      ],
      useCases: [
        { scenario: "企业搜索", description: "需要开源方案的企业", recommended: true },
        { scenario: "多租户", description: "数据隔离需求", recommended: true }
      ]
    }
  },

  chromadb: {
    id: "chromadb",
    name: "ChromaDB",
    category: "llm-application",
    subcategory: "向量数据库",
    description: "AI原生的开源向量数据库，简单易用，适合快速开发",
    tagline: "AI原生的向量数据库",
    version: "0.6.0",
    pros: ["简单易用", "开发者友好", "轻量级", "多种部署方式", "快速启动"],
    cons: ["功能较简单", "不适合大规模", "企业级功能有限"],
    bestFor: ["快速原型", "开发测试", "小型项目", "学习实验"],
    notFor: ["大规模生产", "高并发", "企业级需求"],
    learningCurve: "beginner",
    ecosystemScore: 85,
    popularity: { githubStars: 15000 },
    companyUsers: ["初创公司", "个人开发者", "AI项目"],
    createdYear: 2022,
    maintainedBy: "Chroma",
    officialUrl: "https://www.trychroma.com/",
    githubUrl: "https://github.com/chroma-core/chroma",
    documentationUrl: "https://docs.trychroma.com/",
    alternatives: ["Pinecone", "Weaviate", "FAISS"],
    scores: {
      popularity: 88, maintenance: 88, ecosystem: 85, learningCurve: 90, enterpriseAdoption: 65,
      total: 84, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "简单易用", description: "几行代码即可开始使用，开发者体验优秀。" },
        { title: "多种模式", description: "支持内存、磁盘、客户端-服务器多种模式。" },
        { title: "自动嵌入", description: "内置向量化模型，自动处理文本到向量。" }
      ],
      resources: [
        { type: "official", title: "Chroma文档", url: "https://docs.trychroma.com/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "使用", items: ["开发阶段使用内存模式", "生产使用持久化", "注意数据备份"] }
      ],
      comparisons: [
        { techId: "pinecone", techName: "Pinecone", strengths: ["简单", "免费"], weaknesses: ["功能较少"], whenToChoose: "快速原型和开发" }
      ],
      useCases: [
        { scenario: "快速原型", description: "验证RAG概念", recommended: true },
        { scenario: "学习实验", description: "学习向量数据库", recommended: true }
      ]
    }
  },

  milvus: {
    id: "milvus",
    name: "Milvus",
    category: "llm-application",
    subcategory: "向量数据库",
    description: "云原生向量数据库，专为AI应用设计，支持十亿级向量",
    tagline: "云原生向量数据库",
    version: "2.4.0",
    pros: ["云原生", "十亿级规模", "分布式", "GPU加速", "企业级"],
    cons: ["部署复杂", "资源需求高", "学习曲线陡"],
    bestFor: ["大规模应用", "企业级部署", "分布式系统", "十亿级向量"],
    notFor: ["小型项目", "快速原型", "资源受限"],
    learningCurve: "advanced",
    ecosystemScore: 85,
    popularity: { githubStars: 28000 },
    companyUsers: ["Nvidia", "eBay", "Shutterstock", "腾讯"],
    createdYear: 2019,
    maintainedBy: "Zilliz",
    officialUrl: "https://milvus.io/",
    githubUrl: "https://github.com/milvus-io/milvus",
    documentationUrl: "https://milvus.io/docs/",
    alternatives: ["Pinecone", "Weaviate", "ChromaDB"],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 85, learningCurve: 70, enterpriseAdoption: 88,
      total: 86, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "云原生架构", description: "存储计算分离，支持水平扩展和云原生部署。" },
        { title: "GPU加速", description: "支持GPU加速向量检索，提升查询性能。" },
        { title: "多副本", description: "支持数据多副本，保证高可用性。" }
      ],
      resources: [
        { type: "official", title: "Milvus文档", url: "https://milvus.io/docs/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "部署", items: ["使用K8s部署", "合理设计分片", "配置监控告警"] }
      ],
      comparisons: [
        { techId: "pinecone", techName: "Pinecone", strengths: ["开源", "大规模"], weaknesses: ["需要自运维"], whenToChoose: "需要大规模开源方案" }
      ],
      useCases: [
        { scenario: "大规模推荐", description: "十亿级向量检索", recommended: true },
        { scenario: "企业级RAG", description: "大规模知识库", recommended: true }
      ]
    }
  },

  tgi: {
    id: "tgi",
    name: "Text Generation Inference",
    category: "llm-application",
    subcategory: "部署工具",
    description: "HuggingFace出品的大模型推理服务，生产级部署方案",
    tagline: "HuggingFace官方推理服务",
    version: "2.4.0",
    pros: ["HuggingFace官方", "生产级稳定", "多种量化", "OpenAI兼容", "监控完善"],
    cons: ["资源占用高", "配置复杂", "仅支持部分模型"],
    bestFor: ["生产部署", "HuggingFace生态", "企业级服务", "需要监控"],
    notFor: ["快速原型", "资源受限", "非HF模型"],
    learningCurve: "advanced",
    ecosystemScore: 88,
    popularity: { githubStars: 9000 },
    companyUsers: ["HuggingFace", "AWS", "众多企业"],
    createdYear: 2022,
    maintainedBy: "HuggingFace",
    officialUrl: "https://huggingface.co/docs/text-generation-inference",
    githubUrl: "https://github.com/huggingface/text-generation-inference",
    documentationUrl: "https://huggingface.co/docs/text-generation-inference",
    alternatives: ["vLLM", "TensorRT-LLM", "Ollama"],
    scores: {
      popularity: 82, maintenance: 95, ecosystem: 88, learningCurve: 70, enterpriseAdoption: 85,
      total: 86, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "生产级特性", description: "支持连续批处理、流式生成、多GPU并行等企业级特性。" },
        { title: "OpenAI兼容", description: "API兼容OpenAI格式，便于迁移。" },
        { title: "量化支持", description: "支持GPTQ、AWQ、BitsAndBytes等多种量化方案。" }
      ],
      resources: [
        { type: "official", title: "TGI文档", url: "https://huggingface.co/docs/text-generation-inference", description: "官方文档" }
      ],
      bestPractices: [
        { category: "部署", items: ["使用Docker部署", "配置合适的量化", "启用监控指标"] }
      ],
      comparisons: [
        { techId: "vllm", techName: "vLLM", strengths: ["HF生态", "稳定性"], weaknesses: ["吞吐量稍低"], whenToChoose: "需要HF生态集成" }
      ],
      useCases: [
        { scenario: "生产API服务", description: "企业级模型服务", recommended: true },
        { scenario: "HF模型部署", description: "HuggingFace模型生产化", recommended: true }
      ]
    }
  },

  mlflow: {
    id: "mlflow",
    name: "MLflow",
    category: "llm-application",
    subcategory: "MLOps工具",
    description: "开源机器学习生命周期管理平台，支持LLM实验追踪和模型管理",
    tagline: "ML生命周期管理平台",
    version: "2.17.0",
    pros: ["开源", "生态丰富", "多框架支持", "模型注册", "实验追踪"],
    cons: ["UI较简单", "大规模性能一般", "LLM特化不足"],
    bestFor: ["实验管理", "模型版本控制", "团队协作", "模型部署"],
    notFor: ["纯LLM应用", "需要高级监控", "超大规模"],
    learningCurve: "intermediate",
    ecosystemScore: 90,
    popularity: { githubStars: 18000 },
    companyUsers: ["Databricks", "Microsoft", "众多企业"],
    createdYear: 2018,
    maintainedBy: "Databricks",
    officialUrl: "https://mlflow.org/",
    githubUrl: "https://github.com/mlflow/mlflow",
    documentationUrl: "https://mlflow.org/docs/latest/index.html",
    alternatives: ["Weights & Biases", "Comet", "DVC"],
    scores: {
      popularity: 90, maintenance: 92, ecosystem: 90, learningCurve: 80, enterpriseAdoption: 88,
      total: 89, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "实验追踪", description: "记录超参数、指标、模型artifact。" },
        { title: "模型注册", description: "模型版本管理和生命周期管理。" },
        { title: "模型服务", description: "支持模型部署为REST API。" }
      ],
      resources: [
        { type: "official", title: "MLflow文档", url: "https://mlflow.org/docs/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "使用", items: ["统一实验命名", "记录关键指标", "版本化模型"] }
      ],
      comparisons: [
        { techId: "wandb", techName: "Weights & Biases", strengths: ["开源免费", "功能全面"], weaknesses: ["UI不如W&B"], whenToChoose: "需要开源方案" }
      ],
      useCases: [
        { scenario: "LLM微调", description: "追踪微调实验", recommended: true },
        { scenario: "模型管理", description: "模型版本控制", recommended: true }
      ]
    }
  },

  langsmith: {
    id: "langsmith",
    name: "LangSmith",
    category: "llm-application",
    subcategory: "MLOps工具",
    description: "LangChain出品的LLM应用监控和调试平台，生产级可观测性",
    tagline: "LLM应用可观测性平台",
    version: "2024",
    pros: ["LLM专用", "链路追踪", "提示词管理", "评估工具", "LangChain集成"],
    cons: ["闭源商业", "成本较高", "仅LangChain生态"],
    bestFor: ["生产监控", "提示词优化", "LLM应用调试", "团队协作"],
    notFor: ["非LangChain项目", "成本敏感", "开源要求"],
    learningCurve: "intermediate",
    ecosystemScore: 88,
    popularity: { githubStars: 0 },
    companyUsers: ["使用LangChain的企业"],
    createdYear: 2023,
    maintainedBy: "LangChain Inc",
    officialUrl: "https://smith.langchain.com/",
    githubUrl: "",
    documentationUrl: "https://docs.smith.langchain.com/",
    alternatives: ["Weights & Biases", "PromptLayer", "Helicone"],
    scores: {
      popularity: 88, maintenance: 95, ecosystem: 88, learningCurve: 80, enterpriseAdoption: 85,
      total: 88, lastCalculated: "2025-02-21T10:00:00Z"
    },
    status: "active",
    deepDive: {
      features: [
        { title: "链路追踪", description: "详细记录LLM调用链，包括提示词、输出、延迟、成本。" },
        { title: "提示词管理", description: "版本化管理提示词，A/B测试不同版本。" },
        { title: "评估工具", description: "内置评估指标，支持自定义评估器。" }
      ],
      resources: [
        { type: "official", title: "LangSmith文档", url: "https://docs.smith.langchain.com/", description: "官方文档" }
      ],
      bestPractices: [
        { category: "监控", items: ["启用所有追踪", "设置关键指标", "定期评估"] }
      ],
      comparisons: [
        { techId: "promptlayer", techName: "PromptLayer", strengths: ["LLM专用", "LangChain集成"], weaknesses: ["闭源"], whenToChoose: "使用LangChain的项目" }
      ],
      useCases: [
        { scenario: "生产监控", description: "LLM应用性能监控", recommended: true },
        { scenario: "提示词优化", description: "提示词版本管理和优化", recommended: true }
      ]
    }
  },
}
