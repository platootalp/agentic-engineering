import os
import json
import time
from typing import Optional

try:
    import anthropic
except ImportError:
    anthropic = None


class ClaudeAnalyzer:
    """使用 Claude API 分析游戏市场数据"""

    SYSTEM_PROMPT = """你是一位资深游戏市场分析师。请分析以下搜索结果，生成结构化的市场洞察报告。

**输出要求（严格遵循）：**
1. 只输出纯 JSON 格式，不要包含任何 markdown 代码块标记
2. JSON 必须包含以下三个字段：
   - summary：150-200字的市场摘要，包含市场规模、增长趋势、关键发现
   - insights：3-5条关键洞察，每条30-60字，格式为"- 洞察内容"
   - sources：数据来源列表，每条格式为"来源名称：URL"

**输出模板：**
{"summary": "市场摘要内容...", "insights": ["洞察1", "洞察2", "洞察3"], "sources": ["来源1：URL", "来源2：URL"]}

**分析维度：**
- 市场规模与增长趋势
- 热门游戏类型与玩法
- 用户行为与偏好
- 竞争格局与机会点
- 未来发展预测"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        if anthropic is None:
            raise ImportError("anthropic not installed. Run: pip install anthropic")
        base_url = os.getenv("ANTHROPIC_BASE_URL") or None
        self.client = anthropic.Anthropic(api_key=self.api_key, base_url=base_url)

    def _validate_and_normalize(self, result: dict) -> dict:
        """验证并标准化分析结果，确保字段完整"""
        return {
            "summary": result.get("summary", ""),
            "insights": result.get("insights", []) if isinstance(result.get("insights"), list) else [],
            "sources": result.get("sources", []) if isinstance(result.get("sources"), list) else [],
        }

    def _generate_fallback_analysis(self, raw_results: list[dict]) -> dict:
        """当 API 调用失败时，从原始结果生成基础分析"""
        titles = [item.get('title', '') for item in raw_results[:10] if item.get('title')]
        urls = [item.get('url', '') for item in raw_results[:10] if item.get('url')]

        summary = f"基于 {len(raw_results)} 条搜索结果的初步分析。主要涉及领域包括：{', '.join(titles[:5])}等。完整数据请查看原始结果。"
        insights = [
            f"搜索返回 {len(raw_results)} 条相关结果",
            f"数据来源涵盖 {len(set(urls))} 个不同网站",
            "建议关注游戏类型、用户评价和市场趋势",
        ]
        sources = list(set(urls))[:10]

        return {
            "summary": summary,
            "insights": insights,
            "sources": sources,
        }

    def analyze(self, raw_results: list[dict]) -> dict:
        """
        分析原始搜索结果，返回结构化报告。
        带重试机制和降级处理。
        """
        if not raw_results:
            return {"summary": "", "insights": [], "sources": []}

        # 构建 user prompt，限制每条 text 长度避免超出 token 限制
        user_content = "以下是搜索结果，请分析并生成报告：\n\n"
        for i, item in enumerate(raw_results[:30]):  # 最多 30 条
            text = (item.get('text', '') or item.get('snippet', '') or '')[:300]
            user_content += f"{i+1}. [{item.get('title', '')}]({item.get('url', '')})\n"
            if text:
                user_content += f"   {text}\n\n"
            else:
                user_content += "\n"

        # 重试机制：最多尝试 3 次
        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                response = self.client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=4096,
                    system=self.SYSTEM_PROMPT,
                    messages=[
                        {"role": "user", "content": user_content}
                    ]
                )

                # 解析 JSON 响应 - 支持 TextBlock，处理代码块标记
                content = ""
                for block in response.content:
                    if hasattr(block, 'text'):
                        content += block.text

                # 清理可能的 markdown 代码块标记
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                elif content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                # 尝试提取 JSON
                try:
                    result = json.loads(content)
                    # 验证返回格式
                    if isinstance(result, dict) and ('summary' in result or 'insights' in result):
                        return self._validate_and_normalize(result)
                except json.JSONDecodeError:
                    # 尝试从文本中提取 JSON
                    start = content.find("{")
                    end = content.rfind("}") + 1
                    if start != -1 and end != 0:
                        try:
                            result = json.loads(content[start:end])
                            if isinstance(result, dict) and ('summary' in result or 'insights' in result):
                                return self._validate_and_normalize(result)
                        except json.JSONDecodeError:
                            pass

                # JSON 解析失败但有内容，使用内容作为摘要
                if content.strip():
                    return self._validate_and_normalize({
                        "summary": content[:500] if content else "",
                        "insights": ["分析结果待整理"],
                        "sources": [],
                    })

            except Exception as e:
                error_str = str(e).lower()
                # 检查是否是 529 Overloaded 错误
                if '529' in error_str or 'overloaded' in error_str:
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        retry_delay *= 2  # 指数退避
                        continue
                # 其他错误，记录并降级处理
                return self._validate_and_normalize(self._generate_fallback_analysis(raw_results))

        # 所有重试都失败，降级处理
        return self._validate_and_normalize(self._generate_fallback_analysis(raw_results))
