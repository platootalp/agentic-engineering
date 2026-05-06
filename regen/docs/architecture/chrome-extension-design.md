# Chrome插件详细设计文档

**版本**: v1.0
**日期**: 2026-02-24
**Manifest版本**: V3

---

## 目录

- [1. 插件架构](#1-插件架构)
  - [1.1 整体架构](#11-整体架构)
  - [1.2 组件说明](#12-组件说明)

- [2. 多网站适配器设计](#2-多网站适配器设计)
  - [2.1 适配器接口](#21-适配器接口)
  - [2.2 支持的网站](#22-支持的网站)
  - [2.3 Boss直聘适配器示例](#23-boss直聘适配器示例)

- [3. 核心功能实现](#3-核心功能实现)
  - [3.1 Content Script](#31-content-script)
  - [3.2 Service Worker](#32-service-worker)
  - [3.3 Popup页面](#33-popup页面)

- [4. Manifest配置](#4-manifest配置)

- [5. 项目结构](#5-项目结构)

- [6. 开发规范](#6-开发规范)
  - [6.1 适配器开发规范](#61-适配器开发规范)
  - [6.2 性能优化](#62-性能优化)

---

## 1. 插件架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Chrome Extension Manifest V3                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Content Script  │  │  Service Worker  │  │     Popup        │  │
│  │  (内容脚本)       │  │  (后台服务)       │  │  (弹窗页面)       │  │
│  │                  │  │                  │  │                  │  │
│  │ - 注入招聘网站   │  │ - 接收JD数据     │  │ - 用户设置       │  │
│  │ - 提取JD信息     │  │ - 与后端通信     │  │ - 手动提取       │  │
│  │ - 高亮显示       │  │ - 管理状态       │  │ - 查看历史       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────────┘  │
│           │                     │                                   │
│           │ Message Passing     │                                   │
│           └─────────────────────┘                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Site Adapters                            │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │  │
│  │  │Boss直聘│ │ 脉脉   │ │ 拉勾   │ │ 智联   │ │ 前程   │    │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 组件说明

| 组件 | 职责 | 权限 | 生命周期 |
|------|------|------|----------|
| Content Script | 页面内容提取 | activeTab | 页面加载时注入 |
| Service Worker | 后台处理、API通信 | storage, background | 事件驱动 |
| Popup | 用户交互界面 | - | 点击图标时打开 |
| Site Adapters | 多网站适配 | - | 运行时动态加载 |

---

## 2. 多网站适配器设计

### 2.1 适配器接口

```typescript
interface SiteAdapter {
  // 网站标识
  name: string;
  hostname: string;
  
  // 检测当前页面是否匹配
  detect(): boolean;
  
  // 提取JD数据
  extract(): JDData | null;
  
  // 高亮显示提取区域
  highlight(element: HTMLElement): void;
}

interface JDData {
  source: string;           // 网站标识
  sourceUrl: string;        // 原始URL
  companyName: string;      // 公司名
  positionTitle: string;    // 职位名
  salary?: string;          // 薪资
  location?: string;        // 地点
  content: string;          // 完整JD文本
  extractedAt: string;      // 提取时间
}
```

### 2.2 支持的网站

| 网站 | 域名 | 优先级 | 状态 |
|------|------|--------|------|
| Boss直聘 | zhipin.com | P0 | 已实现 |
| 脉脉 | maimai.cn | P1 | 待实现 |
| 拉勾 | lagou.com | P1 | 待实现 |
| 智联招聘 | zhaopin.com | P2 | 待实现 |
| 前程无忧 | 51job.com | P2 | 待实现 |

### 2.3 Boss直聘适配器示例

```typescript
class ZhipinAdapter implements SiteAdapter {
  name = 'Boss直聘';
  hostname = 'zhipin.com';
  
  detect(): boolean {
    return location.hostname.includes('zhipin.com') && 
           !!document.querySelector('.job-sec-text');
  }
  
  extract(): JDData | null {
    try {
      const company = document.querySelector('.company-name')?.textContent?.trim();
      const title = document.querySelector('.name h1')?.textContent?.trim();
      const salary = document.querySelector('.salary')?.textContent?.trim();
      const location = document.querySelector('.location-address')?.textContent?.trim();
      const content = document.querySelector('.job-sec-text')?.textContent?.trim();
      
      if (!company || !title || !content) return null;
      
      return {
        source: 'zhipin',
        sourceUrl: location.href,
        companyName: company,
        positionTitle: title,
        salary,
        location,
        content,
        extractedAt: new Date().toISOString()
      };
    } catch (e) {
      console.error('提取失败:', e);
      return null;
    }
  }
  
  highlight(element: HTMLElement): void {
    element.style.border = '2px solid #00b38a';
    element.style.borderRadius = '4px';
  }
}
```

---

## 3. 核心功能实现

### 3.1 Content Script

```typescript
// content.ts
import { ZhipinAdapter } from './adapters/zhipin';
import { MaimaiAdapter } from './adapters/maimai';

const adapters = [
  new ZhipinAdapter(),
  new MaimaiAdapter(),
  // ... 其他适配器
];

// 找到匹配的适配器
const matchedAdapter = adapters.find(a => a.detect());

if (matchedAdapter) {
  console.log('检测到招聘网站:', matchedAdapter.name);
  
  // 监听提取命令
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_JD') {
      const data = matchedAdapter.extract();
      sendResponse({ success: !!data, data });
    }
  });
  
  // 自动提取并提示
  setTimeout(() => {
    const data = matchedAdapter.extract();
    if (data) {
      // 显示浮动提示按钮
      showFloatingButton(data);
    }
  }, 2000);
}

function showFloatingButton(data: JDData): void {
  const btn = document.createElement('div');
  btn.innerHTML = `
    <div style="position:fixed;right:20px;top:100px;z-index:99999;
                background:#00b38a;color:white;padding:10px 20px;
                border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
      识别到JD: ${data.positionTitle}
    </div>
  `;
  btn.onclick = () => {
    chrome.runtime.sendMessage({ action: 'SEND_JD_TO_BACKEND', data });
    btn.remove();
  };
  document.body.appendChild(btn);
}
```

### 3.2 Service Worker

```typescript
// background.ts

// 存储用户Token
chrome.storage.local.get(['userToken'], (result) => {
  if (!result.userToken) {
    console.log('未登录，请先在Web端登录');
  }
});

// 监听Content Script消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'SEND_JD_TO_BACKEND':
      handleSendJD(request.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // 异步响应
      
    case 'VERIFY_TOKEN':
      verifyToken(request.token)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false }));
      return true;
  }
});

async function handleSendJD(data: JDData): Promise<any> {
  const { userToken } = await chrome.storage.local.get(['userToken']);
  
  if (!userToken) {
    return { success: false, error: '请先登录' };
  }
  
  const response = await fetch('https://api.example.com/api/v1/extension/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Extension-Token': userToken
    },
    body: JSON.stringify({
      source: data.source,
      site_url: data.sourceUrl,
      data: data
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const result = await response.json();
  
  // 显示通知
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'JD提取成功',
    message: `${data.companyName} - ${data.positionTitle}`
  });
  
  return { success: true, data: result };
}
```

### 3.3 Popup页面

```typescript
// popup.ts

// 检查登录状态
async function checkAuth() {
  const { userToken } = await chrome.storage.local.get(['userToken']);
  
  if (!userToken) {
    document.getElementById('not-logged-in')!.style.display = 'block';
    document.getElementById('logged-in')!.style.display = 'none';
  } else {
    document.getElementById('not-logged-in')!.style.display = 'none';
    document.getElementById('logged-in')!.style.display = 'block';
    loadRecentJobs();
  }
}

// 加载最近JD
async function loadRecentJobs() {
  const { recentJobs = [] } = await chrome.storage.local.get(['recentJobs']);
  const list = document.getElementById('recent-jobs')!;
  list.innerHTML = recentJobs.map((job: any) => `
    <div class="job-item">
      <div class="company">${job.companyName}</div>
      <div class="position">${job.positionTitle}</div>
    </div>
  `).join('');
}

// 手动提取当前页面JD
document.getElementById('extract-btn')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id!, { action: 'EXTRACT_JD' }, (response) => {
    if (response?.success) {
      showSuccess('提取成功');
    } else {
      showError('未能识别JD，请确保在职位详情页');
    }
  });
});
```

---

## 4. Manifest配置

```json
{
  "manifest_version": 3,
  "name": "AI简历助手",
  "version": "1.0.0",
  "description": "一键提取JD，AI生成专属简历",
  "permissions": [
    "storage",
    "activeTab",
    "notifications"
  ],
  "host_permissions": [
    "https://*.zhipin.com/*",
    "https://*.maimai.cn/*",
    "https://*.lagou.com/*",
    "https://*.zhaopin.com/*",
    "https://*.51job.com/*",
    "https://api.example.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "https://*.zhipin.com/*",
        "https://*.maimai.cn/*",
        "https://*.lagou.com/*",
        "https://*.zhaopin.com/*",
        "https://*.51job.com/*"
      ],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

---

## 5. 项目结构

```
extension/
├── manifest.json
├── src/
│   ├── background/
│   │   └── background.ts      # Service Worker
│   ├── content/
│   │   ├── content.ts         # Content Script入口
│   │   └── ui/
│   │       └── floating-button.ts  # 浮动按钮组件
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   └── adapters/
│       ├── base.ts            # 适配器基类
│       ├── zhipin.ts          # Boss直聘适配器
│       ├── maimai.ts          # 脉脉适配器
│       ├── lagou.ts           # 拉勾适配器
│       ├── zhaopin.ts         # 智联适配器
│       └── 51job.ts           # 前程适配器
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── webpack.config.js
├── tsconfig.json
└── package.json
```

---

## 6. 开发规范

### 6.1 适配器开发规范

1. **选择器稳定性**
   - 使用class而非id
   - 避免使用动态生成的class
   - 使用属性选择器作为备选

2. **错误处理**
   - 所有选择器操作加try-catch
   - 返回null而非抛出异常
   - 记录错误日志

3. **DOM变化监听**
   - 使用MutationObserver监听SPA页面变化
   - 防抖处理避免频繁触发

### 6.2 性能优化

- Content Script延迟加载（document_idle）
- 使用chrome.storage而非localStorage
- API请求结果缓存
- 避免频繁的DOM操作
