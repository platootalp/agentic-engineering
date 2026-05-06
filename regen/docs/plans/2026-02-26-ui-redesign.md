# Regen UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 全面重新设计Regen AI简历生成器的UI界面，采用现代科技感风格（玻璃拟态），提升用户体验和视觉品质。

**Architecture:** 
1. 建立统一设计系统（Design System）- CSS变量、配色、字体
2. 重构全局组件（按钮、卡片、输入框）- 玻璃拟态风格
3. 逐页改造 - Header → Home → Auth → Dashboard → Jobs → Experiences → Resumes
4. 添加动效和微交互 - 入场动画、hover效果、页面过渡

**Tech Stack:** React 18 + TypeScript + TailwindCSS + shadcn/ui + Framer Motion

**Design Reference:** `frontend/design-system/regen/MASTER.md`

---

## Task 1: 设计系统配置 - CSS变量和字体

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/index.html`

**Step 1: 添加Google Fonts (Space Grotesk + DM Sans)**

在 `frontend/index.html` 的 `<head>` 中添加：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Step 2: 更新CSS变量（现代科技感配色）**

替换 `:root` 部分为新的设计系统配色。

**Step 3: 添加玻璃拟态工具类**

在 `@layer utilities` 中添加 `.glass`, `.gradient-text`, `.font-heading` 等工具类。

**Step 4: 更新tailwind配置**

添加 `fontFamily` 扩展到 `theme.extend`。

**Step 5: 运行开发服务器验证**

```bash
cd frontend && npm run dev
```

**Step 6: Commit**

```bash
git add frontend/src/index.css frontend/tailwind.config.js frontend/index.html
git commit -m "design: setup design system - CSS vars, fonts, glass utilities"
```

---

## Task 2: 创建全局动效组件

**Files:**
- Create: `frontend/src/components/ui/fade-in.tsx`
- Create: `frontend/src/components/ui/gradient-button.tsx`
- Create: `frontend/src/components/ui/glass-card.tsx`

**Step 1: 安装 Framer Motion**

```bash
cd frontend && npm install framer-motion
```

**Step 2: 创建 FadeIn 动画组件**

支持 `direction: 'up'|'down'|'left'|'right'|'none'` 的入场动画。

**Step 3: 创建 GradientButton 组件**

渐变按钮，支持 `primary/accent/outline` 三种变体，带hover缩放效果。

**Step 4: 创建 GlassCard 组件**

玻璃拟态卡片，支持hover上浮和发光效果。

**Step 5: Commit**

```bash
git add frontend/src/components/ui/fade-in.tsx frontend/src/components/ui/gradient-button.tsx frontend/src/components/ui/glass-card.tsx
git commit -m "feat: add animation components - FadeIn, GradientButton, GlassCard"
```

---

## Task 3: Header导航组件重构

**Files:**
- Modify: `frontend/src/components/common/Header.tsx`

**Changes:**
1. 玻璃拟态导航栏（固定定位，距边缘有间距）
2. 新增Regen品牌Logo（渐变背景+Sparkles图标）
3. 认证用户显示完整导航（仪表盘、职位、经历、简历）
4. 活跃页面高亮显示
5. 用户头像区域优化
6. 移动端菜单动画优化

**Key Features:**
- `glass` 类实现毛玻璃效果
- 渐变色Logo：`gradient-primary` + `shadow-indigo-500/30`
- 入场动画：`initial={{ y: -100, opacity: 0 }}`

---

## Task 4: Home首页视觉升级

**Files:**
- Modify: `frontend/src/pages/index.tsx`

**Changes:**
1. **Hero Section:**
   - 大标题使用 `font-heading` + `gradient-text`
   - 副标题使用淡紫色背景突出
   - CTA按钮使用 `GradientButton`
   - 右侧添加动态展示卡片（职位匹配效果预览）
   - 添加浮动装饰元素（blur circles）

2. **Features Section:**
   - 使用 `GlassCard` 替换普通卡片
   - 交错入场动画（stagger delay 0.1s each）
   - 图标使用渐变背景圆形

3. **How It Works:**
   - 步骤时间线设计
   - 连接线动画

4. **Chrome Extension CTA:**
   - 大号渐变图标
   - 产品截图预览框架

5. **Footer CTA:**
   - 渐变背景
   - 浮动动画

---

## Task 5: 登录/注册页面美化

**Files:**
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Register.tsx`
- Modify: `frontend/src/components/auth/LoginForm.tsx`
- Modify: `frontend/src/components/auth/RegisterForm.tsx`

**Changes:**
1. 全屏渐变背景（紫色到粉色）
2. 居中的玻璃拟态卡片
3. 输入框聚焦时发光效果
4. 社交登录按钮样式优化
5. 链接hover效果
6. 表单验证错误动画抖动

---

## Task 6: Dashboard仪表盘改造

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

**Changes:**
1. **Stats Cards:**
   - 使用 `GlassCard` 替换
   - 每个卡片不同渐变图标背景
   - 数字计数动画

2. **Quick Actions:**
   - 网格布局
   - 悬停时图标放大
   - 颜色编码（职位蓝、经历绿、简历紫等）

3. **Recent Activity:**
   - 列表项悬停效果
   - 空状态优化插图

4. **Progress Checklist:**
   - 完成动画（勾选弹跳）
   - 进度条渐变

5. **User Profile Card:**
   - 玻璃拟态风格
   - 头像区域优化

---

## Task 7: 职位管理页面美化

**Files:**
- Modify: `frontend/src/pages/jobs/JobList.tsx`
- Modify: `frontend/src/components/jobs/JobCard.tsx`

**Changes:**
1. **Search Bar:**
   - 玻璃拟态搜索框
   - 筛选器使用 pill 样式

2. **Job Cards:**
   - 使用 `GlassCard`
   - 状态标签颜色编码
   - 悬停显示操作按钮
   - 公司Logo占位优化

3. **Empty State:**
   - 插图 + 引导CTA

4. **Pagination:**
   - 圆角按钮
   - 当前页高亮

---

## Task 8: 经历管理页面美化

**Files:**
- Modify: `frontend/src/pages/experiences/ExperienceList.tsx`
- Modify: `frontend/src/components/experiences/ExperienceForm.tsx`

**Changes:**
1. 时间线布局设计
2. 经历卡片使用左侧色条区分类型（工作/项目/教育）
3. 标签云样式技能展示
4. 表单输入框统一风格

---

## Task 9: 简历生成器页面美化

**Files:**
- Modify: `frontend/src/pages/resumes/ResumeList.tsx`
- Modify: `frontend/src/pages/resumes/ResumeBuilder.tsx`
- Modify: `frontend/src/components/resumes/TemplateSelector.tsx`

**Changes:**
1. **Template Selector:**
   - 模板预览卡片
   - 选中状态动画
   - 悬停放大效果

2. **Resume Builder:**
   - 分步指示器
   - 实时预览区域
   - AI生成loading动画

---

## Task 10: 添加动效和微交互

**Files:**
- Create: `frontend/src/components/ui/page-transition.tsx`
- Modify: `frontend/src/App.tsx`

**Changes:**
1. **页面过渡:**
   - 路由切换淡入淡出
   - AnimatePresence 包裹

2. **全局微交互:**
   - 按钮点击反馈
   - 卡片悬停效果
   - 输入框聚焦发光

3. **加载状态:**
   - Skeleton 屏幕
   - 脉冲动画
   - 渐变shimmer效果

---

## Implementation Order

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10
```

每个Task完成后运行验证：
1. `npm run dev` 启动开发服务器
2. 检查页面无console错误
3. 验证响应式布局
4. git commit

---

## Success Criteria

- [ ] 所有页面采用统一设计系统
- [ ] Header玻璃拟态效果正常
- [ ] 首页有完整的入场动画
- [ ] 所有按钮有hover反馈
- [ ] 卡片有玻璃拟态效果
- [ ] 表单输入框有聚焦效果
- [ ] 移动端适配良好
- [ ] 无TypeScript错误
- [ ] Lighthouse评分 > 90
