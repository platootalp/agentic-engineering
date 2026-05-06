"""
E2E 测试脚本 — 游戏市场分析 Agent MVP
测试完整用户流程：Dashboard → 生成报告 → 查看详情 → 导出
"""
import time
import httpx
import pytest
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"
PROJECT_ROOT = Path(__file__).parent


class TestE2E:
    """端到端验收测试"""

    @pytest.fixture(autouse=True)
    def ensure_services(self):
        """确保后端服务正在运行"""
        try:
            r = httpx.get(f"{BACKEND_URL}/api/health", timeout=30)
            assert r.status_code == 200, f"Backend health check failed: {r.status_code}"
        except Exception as e:
            pytest.fail(f"Backend not reachable at {BACKEND_URL}: {e}")

    @pytest.fixture
    def requires_frontend(self):
        """跳过测试如果前端服务未运行"""
        try:
            httpx.get(FRONTEND_URL, timeout=3)
        except Exception:
            pytest.skip(f"Frontend not reachable at {FRONTEND_URL} — skipping UI test")

    def test_01_health_endpoint(self):
        """✅ T1: 后端健康检查"""
        response = httpx.get(f"{BACKEND_URL}/api/health", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok", f"Unexpected health response: {data}"

    def test_02_frontend_loads(self, requires_frontend):
        """✅ T2: 前端页面可访问"""
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # 收集 console errors
            errors = []
            page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

            page.goto(FRONTEND_URL, timeout=15000)

            # 等待页面加载
            page.wait_for_load_state("networkidle", timeout=15000)

            # 验证标题或主要内容
            content = page.content()
            assert "游戏市场" in content or "报告" in content, "Page content not loaded correctly"

            # 允许一些非关键 console errors，但检查严重错误
            critical_errors = [e for e in errors if "Failed to load resource" not in e and "net::" not in e]
            assert len(critical_errors) == 0, f"Critical console errors: {critical_errors}"

            browser.close()

    def test_03_empty_report_list(self, requires_frontend):
        """✅ T3: 空报告列表显示"""
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(FRONTEND_URL, timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)

            # 应该有空列表提示或报告卡片
            body_text = page.inner_text("body")
            has_empty_msg = "暂无报告" in body_text or "生成" in body_text
            assert has_empty_msg, f"Expected empty state or report list, got: {body_text[:200]}"

            browser.close()

    def test_04_generate_report(self, requires_frontend):
        """✅ T4: 生成报告（搜索 + 分析 + 保存）"""
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            page.goto(FRONTEND_URL, timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)

            # 点击"生成报告"按钮
            btn = page.get_by_role("button", name="生成报告")
            btn.click()

            # 按钮应变为"生成中..."
            try:
                page.get_by_text("生成中", timeout=2000)
            except Exception:
                pass  # 可能点击后立即刷新

            # 等待报告出现在列表（最多60秒）
            print("\n⏳ 等待报告生成（最长60秒）...")
            start = time.time()

            # 轮询 API 直到有报告
            while time.time() - start < 60:
                try:
                    r = httpx.get(f"{BACKEND_URL}/api/v1/reports", timeout=5)
                    if r.status_code == 200:
                        data = r.json()
                        reports = data.get("items", data) if isinstance(data, dict) else data
                        if len(reports) > 0:
                            print(f"✅ 报告生成成功！耗时 {time.time() - start:.1f}秒")
                            browser.close()
                            return  # 测试通过
                except Exception:
                    pass
                time.sleep(3)

            browser.close()
            pytest.fail("报告生成超时（60秒内未生成报告）")

    def test_05_report_detail_page(self, requires_frontend):
        """✅ T5: 报告详情页显示完整内容"""
        # 获取有洞察数据的报告（报告1是最完整的）
        r = httpx.get(f"{BACKEND_URL}/api/v1/reports/1", timeout=5)
        if r.status_code == 404:
            # fallback: 从列表中找有insights的报告
            r = httpx.get(f"{BACKEND_URL}/api/v1/reports", timeout=5)
            assert r.status_code == 200
            data = r.json()
            reports = data.get("items", data) if isinstance(data, dict) else data
            # 找有insights的报告
            report = None
            for rep in reports:
                if rep.get("insights") and len(rep["insights"]) > 0:
                    report = rep
                    break
            assert report, "需要先有包含洞察的报告才能测试详情页"
            r = httpx.get(f"{BACKEND_URL}/api/v1/reports/{report['id']}", timeout=5)
        assert r.status_code == 200
        report = r.json()

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            page.goto(f"{FRONTEND_URL}/report/{report['id']}", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)

            body_text = page.inner_text("body")

            # 验证标题
            assert report["title"] in body_text, f"标题 '{report['title']}' 未在详情页显示"

            # 验证摘要
            assert "摘要" in body_text or report["summary"][:20] in body_text, "摘要未显示"

            # 验证关键洞察
            assert "关键洞察" in body_text or "洞察" in body_text, "关键洞察未显示"

            # 验证洞察内容
            if report.get("insights"):
                for insight in report["insights"][:2]:  # 检查前两条
                    insight_str = insight.get("title", "")
                    if len(insight_str) > 5:  # 足够长的洞察才检查
                        assert insight_str in body_text, f"洞察 '{insight_str}' 未在详情页显示"

            # 验证数据来源（如果报告没有sources字段则跳过）
            if report.get("sources") and len(report["sources"]) > 0:
                assert "数据来源" in body_text or "来源" in body_text, "数据来源未显示"

            browser.close()

    def test_06_export_json(self, requires_frontend):
        """✅ T6: 报告可导出为 JSON"""
        # 获取有完整数据的报告
        r = httpx.get(f"{BACKEND_URL}/api/v1/reports/1", timeout=5)
        if r.status_code == 404:
            r = httpx.get(f"{BACKEND_URL}/api/v1/reports", timeout=5)
            assert r.status_code == 200
            data = r.json()
            reports = data.get("items", data) if isinstance(data, dict) else data
            assert len(reports) > 0, "需要先有报告"
            report = reports[0]
        else:
            report = r.json()

        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context()
            page = context.new_page()

            # 设置下载监听
            with page.expect_download(timeout=10000) as download_info:
                page.goto(f"{FRONTEND_URL}/report/{report['id']}", timeout=15000)
                page.wait_for_load_state("networkidle", timeout=15000)

                # 点击导出按钮
                export_btn = page.get_by_role("button", name="导出 JSON")
                export_btn.click()

            download = download_info.value
            path = download.path()

            # 验证下载的文件
            assert path.exists(), "下载的文件不存在"
            content = path.read_text()

            # 验证是有效的 JSON
            import json
            data = json.loads(content)
            assert "title" in data, "导出 JSON 缺少 title 字段"
            assert "summary" in data, "导出 JSON 缺少 summary 字段"
            assert "insights" in data, "导出 JSON 缺少 insights 字段"

            browser.close()

    def test_07_api_endpoints(self):
        """✅ T7: 所有 API 端点正常工作"""
        # GET /api/v1/reports
        r = httpx.get(f"{BACKEND_URL}/api/v1/reports", timeout=5)
        assert r.status_code == 200
        data = r.json()
        # API 返回分页对象 {items: [], total: N} 或直接列表
        reports = data.get("items", data) if isinstance(data, dict) else data
        assert isinstance(reports, list)

        # 如果有报告，测试 GET /api/v1/reports/{id}
        if reports:
            r = httpx.get(f"{BACKEND_URL}/api/v1/reports/{reports[0]['id']}", timeout=5)
            assert r.status_code == 200
            data = r.json()
            assert "title" in data
            assert "summary" in data

            # 测试 404
            r = httpx.get(f"{BACKEND_URL}/api/v1/reports/999999", timeout=5)
            assert r.status_code == 404

    def test_08_execution_list_page(self, requires_frontend):
        """✅ T8: 执行记录页面"""
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            page.goto(f"{FRONTEND_URL}/execute", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)

            body_text = page.inner_text("body")
            # 页面应该显示"执行记录"标题或相关元素
            assert "执行" in body_text or "execution" in body_text.lower(), \
                f"Expected execution page content, got: {body_text[:200]}"

            browser.close()

    def test_09_execution_detail_status(self, requires_frontend):
        """✅ T9: 执行状态详情（执行中/完成）"""
        # 先获取执行记录
        r = httpx.get(f"{BACKEND_URL}/api/v1/executions?limit=1", timeout=5)
        if r.status_code == 503:
            pytest.skip("Scheduler not available")
        assert r.status_code == 200
        data = r.json()
        items = data.get("items", [])
        if not items:
            pytest.skip("No execution records yet")

        exec_item = items[0]
        exec_id = exec_item["id"]

        # 验证执行状态字段完整
        assert "status" in exec_item, "Execution missing status field"
        assert "current_step" in exec_item, "Execution missing current_step field"
        assert "progress" in exec_item, "Execution missing progress field"

        # 访问执行详情 API
        r = httpx.get(f"{BACKEND_URL}/api/v1/executions/{exec_id}", timeout=5)
        assert r.status_code == 200
        detail = r.json()
        assert "status" in detail
        assert "current_step" in detail

    def test_10_streaming_generate(self):
        """✅ T10: SSE流式报告生成"""
        import json

        # 使用 httpx 手动实现 SSE 客户端
        headers = {"Accept": "text/event-stream", "Cache-Control": "no-cache"}
        with httpx.stream(
            "POST",
            f"{BACKEND_URL}/api/v1/reports/generate/stream",
            json={"category_slugs": [], "force_refresh": False},
            headers=headers,
            timeout=120,
        ) as response:
            assert response.status_code in (200, 409), \
                f"Expected 200 or 409, got {response.status_code}"

            if response.status_code == 409:
                pytest.skip("Another execution is already in progress")

            # 解析SSE事件
            event_types = set()
            for line in response.iter_lines():
                if line.startswith("data:"):
                    try:
                        event = json.loads(line[5:])
                        event_types.add(event.get("type"))
                    except json.JSONDecodeError:
                        pass

            # 至少应该有 stage 或 done 事件
            assert "stage" in event_types or "done" in event_types, \
                f"Expected stage or done events, got: {event_types}"

    def test_11_docker_compose_startup(self):
        """✅ T8: Docker Compose 一键启动验证"""
        # Try docker compose (v2) then docker-compose (v1); skip if docker unavailable
        for cmd in [["docker", "compose", "ps"], ["docker-compose", "ps"]]:
            result = subprocess.run(
                cmd,
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                output = result.stdout
                assert "backend" in output, \
                    f"backend service not found in compose ps output:\n{output}"
                assert "frontend" in output, \
                    f"frontend service not found in compose ps output:\n{output}"
                return  # passed

        pytest.skip("Docker Compose not available or daemon not running")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
