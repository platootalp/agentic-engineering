# AI服务详细设计文档

**版本**: v1.0
**日期**: 2026-02-24
**主模型**: Kimi (Moonshot) + DeepSeek/Qwen/GLM备选

---

## 目录

- [1. AI服务架构](#1-ai服务架构)
  - [1.1 多模型网关架构](#11-多模型网关架构)
  - [1.2 模型选择策略](#12-模型选择策略)

- [2. Prompt工程](#2-prompt工程)
  - [2.1 JD分析Prompt](#21-jd分析prompt)
  - [2.2 简历生成Prompt](#22-简历生成prompt)
  - [2.3 经历匹配Prompt](#23-经历匹配prompt)

- [3. 核心类设计](#3-核心类设计)
  - [3.1 AI网关接口](#31-ai网关接口)
  - [3.2 Kimi适配器](#32-kimi适配器)
  - [3.3 请求路由器](#33-请求路由器)

- [4. 服务实现](#4-服务实现)
  - [4.1 JD分析服务](#41-jd分析服务)
  - [4.2 简历生成服务](#42-简历生成服务)
  - [4.3 经历匹配服务](#43-经历匹配服务)

- [5. 成本优化策略](#5-成本优化策略)
  - [5.1 智能降级](#51-智能降级)
  - [5.2 缓存策略](#52-缓存策略)
  - [5.3 限流保护](#53-限流保护)

- [6. 监控指标](#6-监控指标)
  - [6.1 关键指标](#61-关键指标)
  - [6.2 告警规则](#62-告警规则)

---

## 1. AI服务架构

### 1.1 多模型网关架构

```
┌─────────────────────────────────────────────────────────────┐
│                        AI服务网关                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌──────────────────────────────┐     │
│  │   API请求    │────►│     Request Router           │     │
│  └──────────────┘     │     (请求路由/负载均衡)       │     │
│                       └──────────────┬─────────────────┘    │
│                                      │                       │
│              ┌───────────────────────┼───────────────────┐  │
│              │                       │                   │  │
│              ▼                       ▼                   ▼  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │   Kimi适配器    │  │  DeepSeek适配器  │  │ Qwen适配器 │  │
│  │   (主模型)      │  │   (备选1)        │  │  (备选2)   │  │
│  │                 │  │                  │  │            │  │
│  │ - 200K上下文    │  │ - 128K上下文     │  │ - 32K上下文│  │
│  │ - 中文优秀      │  │ - 性价比最高     │  │ - 阿里生态 │  │
│  │ - 长文本强项    │  │ - 快速响应       │  │            │  │
│  └────────┬────────┘  └────────┬─────────┘  └─────┬──────┘  │
│           │                    │                  │        │
│           └────────────────────┴──────────────────┘        │
│                              │                             │
│                              ▼                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Fallback Manager (故障转移)            │  │
│  │                                                      │  │
│  │  1. Kimi失败 → 自动切换到DeepSeek                   │  │
│  │  2. 记录失败日志                                    │  │
│  │  3. 超过阈值触发告警                                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 模型选择策略

| 场景 | 首选模型 | 备选模型 | 原因 |
|------|---------|---------|------|
| JD分析 | Kimi | DeepSeek | 长文本，需完整分析 |
| 简历生成 | Kimi | Qwen | 需要长上下文保持 |
| 经历优化 | DeepSeek | Kimi | 短文本，成本优先 |
| 对话采集 | Kimi | DeepSeek | 需要上下文记忆 |
| 批量处理 | DeepSeek | Kimi | 成本控制 |

---

## 2. Prompt工程

### 2.1 JD分析Prompt

提取关键信息：
- summary: 职位一句话总结
- company_type: 公司类型
- position_level: 职位级别
- requirements: 硬性要求列表
- responsibilities: 职责列表
- required_skills: 必需技能
- preferred_skills: 加分技能
- education_requirement: 学历要求
- experience_years: 经验年限

### 2.2 简历生成Prompt

生成要求：
1. 根据JD选择最相关的3-5条经历
2. 优化经历描述匹配JD关键词
3. 使用STAR法则
4. 突出匹配技能
5. 量化成果

### 2.3 经历匹配Prompt

计算匹配度：
- match_score: 0-100分
- matched_skills: 匹配的技能列表
- reasoning: 匹配原因
- relevance: high/medium/low

---

## 3. 核心类设计

### 3.1 AI网关接口

```python
class AIModel(Enum):
    KIMI = "kimi"
    DEEPSEEK = "deepseek"
    QWEN = "qwen"
    GLM = "glm"

class AIGateway(ABC):
    @abstractmethod
    async def chat_completion(self, messages, temperature, max_tokens) -> Dict
    
    @abstractmethod
    async def health_check(self) -> bool
```

### 3.2 Kimi适配器

```python
class KimiAdapter(AIGateway):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.moonshot.cn/v1"
        self.model = "moonshot-v1-128k"
```

### 3.3 请求路由器

```python
class AIRequestRouter:
    def __init__(self, config: Dict):
        self.adapters = {}
        self.priority_order = [KIMI, DEEPSEEK, QWEN, GLM]
    
    async def route_request(self, messages, preferred_model=None) -> Dict:
        # 1. 优先使用指定模型
        # 2. 失败后按优先级尝试其他模型
        # 3. 记录所有失败日志
```

---

## 4. 服务实现

### 4.1 JD分析服务

```python
class JDAnalyzer:
    async def analyze(self, jd_content: str) -> Dict:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": jd_content}
        ]
        response = await ai_router.route_request(
            messages=messages,
            preferred_model=AIModel.KIMI,
            temperature=0.3,
            max_tokens=2000
        )
        return json.loads(response["content"])
```

### 4.2 简历生成服务

```python
class ResumeGenerator:
    async def generate(self, user_id, jd_id, selected_exp_ids):
        # 1. 获取JD信息
        jd = await jd_repo.get(jd_id)
        # 2. 获取用户经历
        experiences = await exp_repo.get_by_ids(selected_exp_ids)
        # 3. 构建Prompt
        prompt = self._build_prompt(jd, experiences)
        # 4. 调用AI
        response = await ai_router.route_request(prompt)
        # 5. 解析结果
        return self._parse_response(response)
```

### 4.3 经历匹配服务

```python
class ExperienceMatcher:
    async def calculate_match(self, jd_id, experience_ids):
        jd = await jd_repo.get(jd_id)
        results = []
        for exp_id in experience_ids:
            exp = await exp_repo.get(exp_id)
            score = await self._match(jd, exp)
            results.append({"exp_id": exp_id, "score": score})
        return sorted(results, key=lambda x: x["score"], reverse=True)
```

---

## 5. 成本优化策略

### 5.1 智能降级
- 简单任务使用DeepSeek (成本低)
- 复杂任务使用Kimi (质量好)
- 批量处理使用DeepSeek

### 5.2 缓存策略
- 相同JD分析结果缓存24小时
- 热门模板预生成
- 用户历史Prompt复用

### 5.3 限流保护
- 每分钟最大调用次数限制
- 并发请求数控制
- 异常流量熔断

---

## 6. 监控指标

### 6.1 关键指标
- 响应时间 P50/P95/P99
- 成功率
- 各模型使用比例
- Token消耗量
- 成本统计

### 6.2 告警规则
- 成功率低于95%
- 响应时间超过5s
- 单日成本超过预算
- 模型连续失败超过10次
