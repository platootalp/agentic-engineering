# E2E 测试

Regen 项目的端到端测试，使用 Playwright 构建。

## 目录结构

```
e2e/
├── pages/              # Page Object Models
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── DashboardPage.ts
│   ├── JobListPage.ts
│   ├── JobCreatePage.ts
│   ├── ExperienceListPage.ts
│   ├── ResumeListPage.ts
│   └── ResumeBuilderPage.ts
├── fixtures/           # 测试夹具
│   └── auth.ts
├── *.spec.ts          # 测试文件
├── playwright.config.ts
└── README.md
```

## 运行测试

```bash
# 运行所有测试
npm run test:e2e

# 运行特定测试文件
npx playwright test e2e/auth.spec.ts

# 运行特定浏览器
npx playwright test --project=chromium

# 调试模式
npx playwright test --debug

# 查看报告
npx playwright show-report
```

## 测试策略

### 认证流程
- 登录表单验证
- 注册表单验证
- 访问控制（未认证用户重定向）

### 核心功能
- 仪表盘概览
- 职位 CRUD
- 经历管理
- 简历生成

### 注意事项

1. **认证要求**: 大部分测试需要已登录用户，请在运行前设置测试账号
2. **API Mock**: 建议在实际运行时使用 MSW 或 Playwright 的 route 功能模拟 API
3. **测试数据**: 测试会创建真实数据，请确保在测试环境运行

## 添加新测试

1. 创建 Page Object（如需要）
2. 在 `e2e/` 目录下创建 `.spec.ts` 文件
3. 使用 `test.describe` 组织测试
4. 运行 `npx playwright test` 验证

## 最佳实践

- 使用 Page Object 模式封装页面逻辑
- 使用 `data-testid` 属性定位元素
- 避免使用固定等待时间，使用自动等待
- 每个测试应该是独立的
