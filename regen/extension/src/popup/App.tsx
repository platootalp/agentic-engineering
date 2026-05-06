import { useState, useEffect } from "react";
import type { JobData, ExtractionResult, ExtractionProgress, ExtractorConfig } from "@/types/jd";

type UIState = "idle" | "extracting" | "completed" | "error";

function App() {
  const [state, setState] = useState<UIState>("idle");
  const [message, setMessage] = useState("准备就绪，点击开始提取");
  const [_progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [config, setConfig] = useState<ExtractorConfig>({
    apiBaseUrl: "http://localhost:3000",
    userToken: "",
    autoSync: false,
    showFloatingButton: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    loadConfig();
    checkPageSupport();
    checkPreviousExtraction();
  }, []);

  useEffect(() => {
    const listener = (request: ExtractionProgress & { action: string }) => {
      if (request.action === "extractionProgress" && state === "extracting") {
        handleProgressUpdate(request);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [state]);

  const loadConfig = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getConfig" });
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (e) {
      console.error("加载配置失败:", e);
    }
  };

  const checkPageSupport = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url) {
        const supported = tab.url.includes("zhipin.com");
        setIsSupported(supported);
        if (!supported) {
          setMessage("请在Boss直聘页面使用");
          setState("error");
        }
      }
    } catch (e) {
      console.error("检查页面支持失败:", e);
    }
  };

  const checkPreviousExtraction = async () => {
    try {
      const result = await chrome.storage.local.get(["lastExtraction", "extractionStatus"]);
      if (result.extractionStatus === "completed" && result.lastExtraction) {
        setResult(result.lastExtraction);
        setState("completed");
        setMessage(`上次提取: \${result.lastExtraction.count} 个职位`);
      }
    } catch (e) {
      console.error("检查历史记录失败:", e);
    }
  };

  const handleProgressUpdate = (progressData: ExtractionProgress) => {
    const { status, current, total, message: progressMessage } = progressData;
    if (status === "progress" && total && total > 0) {
      const newProgress = 30 + Math.round((current! / total) * 60);
      setProgress(newProgress);
      setMessage(progressMessage || `正在提取 \${current}/\${total}...`);
    } else if (status === "completed") {
      setProgress(95);
      setMessage("正在生成结果...");
    } else if (progressMessage) {
      setMessage(progressMessage);
    }
  };

  const startExtraction = async () => {
    if (!isSupported) return;
    try {
      setState("extracting");
      setProgress(10);
      setMessage("正在初始化...");
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("无法获取当前标签页");
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      } catch (e) {}
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(20);
      setMessage("正在提取职位信息...");
      const response = await chrome.tabs.sendMessage(tab.id, { action: "extract" });
      if (!response || !response.success) {
        throw new Error(response?.error || "提取失败");
      }
      const extractionResult: ExtractionResult = response.data;
      if (extractionResult.pageType === "list" && "jobs" in extractionResult.data) {
        await handleListExtraction(tab.id, tab.url || "", extractionResult.data.jobs);
      } else {
        await handleDetailExtraction(extractionResult);
      }
    } catch (error) {
      console.error("提取错误:", error);
      setState("error");
      setMessage(error instanceof Error ? error.message : "提取失败");
    }
  };

  const handleListExtraction = async (_tabId: number, pageUrl: string, jobs: JobData[]) => {
    setProgress(30);
    setMessage(`找到 \${jobs.length} 个职位，正在深度提取...`);
    const result = await chrome.runtime.sendMessage({
      action: "batchExtract",
      jobs,
      pageUrl,
    });
    if (result.success) {
      setResult(result.data);
      setState("completed");
      setMessage(`共提取 \${result.data.count} 个职位`);
      await chrome.storage.local.set({
        lastExtraction: {
          type: "list",
          data: result.data.results,
          markdown: result.data.markdown,
          timestamp: new Date().toISOString(),
          count: result.data.count,
        },
        extractionStatus: "completed",
      });
    } else {
      throw new Error(result.error || "批量提取失败");
    }
  };

  const handleDetailExtraction = async (extractionResult: ExtractionResult) => {
    setProgress(80);
    await chrome.storage.local.set({
      lastExtraction: {
        type: "detail",
        data: extractionResult.data,
        markdown: extractionResult.markdown,
        timestamp: new Date().toISOString(),
        count: 1,
      },
      extractionStatus: "completed",
    });
    setResult(extractionResult);
    setState("completed");
    setMessage(`职位：\${(extractionResult.data as JobData).jobName}`);
  };

  const cancelExtraction = async () => {
    try {
      await chrome.runtime.sendMessage({ action: "cancelExtraction" });
      setState("idle");
      setMessage("已取消提取");
      setProgress(0);
    } catch (e) {
      console.error("取消提取失败:", e);
    }
  };

  const downloadMarkdown = async () => {
    if (!result) return;
    try {
      const markdown = result.markdown || "";
      const _timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `jd-extractor-${_timestamp}.md`;
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      await chrome.downloads.download({ url, filename, saveAs: false });
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("下载失败:", error);
      alert("下载失败: " + (error instanceof Error ? error.message : "未知错误"));
    }
  };

  const saveConfig = async () => {
    try {
      await chrome.runtime.sendMessage({ action: "setConfig", config });
      alert("配置已保存");
    } catch (e) {
      console.error("保存配置失败:", e);
      alert("保存失败");
    }
  };

  const _getStatusBoxClass = () => {
    switch (state) {
      case "idle":
        return "status-idle";
      case "extracting":
        return "status-extracting";
      case "completed":
        return "status-success";
      case "error":
        return "status-error";
      default:
        return "status-idle";
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>JD提取器 Pro</h1>
        <p>多网站职位信息提取工具</p>
      </div>
      {state === "idle" && (
        <button className="btn btn-primary" onClick={startExtraction} disabled={!isSupported}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          开始提取
        </button>
      )}
      {state === "extracting" && (
        <button className="btn btn-cancel" onClick={cancelExtraction}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          取消提取
        </button>
      )}
      {state === "completed" && (
        <>
          <button className="btn btn-primary" onClick={startExtraction}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            重新提取
          </button>
          <button className="btn btn-secondary" onClick={downloadMarkdown}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载Markdown
          </button>
        </>
      )}
      <div className={`status-box ${_getStatusBoxClass()}`}>
        <span>{message}</span>
        {state === "extracting" && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `\${progress}%` }} />
          </div>
        )}
      </div>
      {state === "completed" && result && (
        <div className="result-info">
          <h4>提取完成</h4>
          <p>
            {result.pageType === "list"
              ? `共提取 \${(result.data as { jobs: JobData[] }).jobs.length} 个职位`
              : `职位：\${(result.data as JobData).jobName}`}
          </p>
        </div>
      )}
      <div className="settings">
        <h3 onClick={() => setShowSettings(!showSettings)} style={{ cursor: "pointer" }}>
          设置 {showSettings ? "▼" : "▶"}
        </h3>
        {showSettings && (
          <>
            <div className="form-group">
              <label>API地址</label>
              <input
                type="text"
                value={config.apiBaseUrl}
                onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
                placeholder="http://localhost:3000"
              />
            </div>
            <div className="form-group">
              <label>用户Token {config.userToken && <span className="token-status valid">✓</span>}</label>
              <input
                type="password"
                value={config.userToken}
                onChange={(e) => setConfig({ ...config, userToken: e.target.value })}
                placeholder="输入您的Token"
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="autoSync"
                checked={config.autoSync}
                onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              />
              <label htmlFor="autoSync">自动同步到后端</label>
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="showFloatingButton"
                checked={config.showFloatingButton}
                onChange={(e) => setConfig({ ...config, showFloatingButton: e.target.checked })}
              />
              <label htmlFor="showFloatingButton">显示浮动按钮</label>
            </div>
            <button className="btn btn-secondary btn-small" onClick={saveConfig}>
              保存配置
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
