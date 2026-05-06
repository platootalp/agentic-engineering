# API详细设计文档

**版本**: v1.0  
**日期**: 2026-02-24  
**基础URL**: `/api/v1`

---

## 目录

- [1. API设计原则](#1-api设计原则)
  - [1.1 RESTful规范](#11-restful规范)
  - [1.2 响应格式](#12-响应格式)

- [2. 认证相关](#2-认证相关)
  - [POST /auth/register - 用户注册](#post-authregister---用户注册)
  - [POST /auth/login - 用户登录](#post-authlogin---用户登录)
  - [POST /auth/refresh - 刷新Token](#post-authrefresh---刷新token)
  - [POST /auth/logout - 登出](#post-authlogout---登出)

- [3. 用户相关](#3-用户相关)

- [4. JD相关](#4-jd相关)

- [5. 经历相关](#5-经历相关)

- [6. 简历相关](#6-简历相关)

- [7. 订阅相关](#7-订阅相关)

- [8. Chrome插件专用接口](#8-chrome插件专用接口)

---

## 1. API设计原则

### 1.1 RESTful规范
- 使用HTTP方法表示操作：GET/POST/PUT/DELETE/PATCH
- 使用名词复数形式作为资源路径
- 使用HTTP状态码表示结果
- 使用JSON作为数据格式

### 1.2 响应格式
```json
{
  "success": true,
  "data": { },
  "message": "操作成功",
  "error": null
}
```

---

## 2. 认证相关

### POST /auth/register - 用户注册
```json
// 请求
{
  "email": "user@example.com",
  "password": "Password123!",
  "first_name": "张",
  "last_name": "三"
}
```

### POST /auth/login - 用户登录
```json
// 请求
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### POST /auth/refresh - 刷新Token
### POST /auth/logout - 登出

---

## 3. 用户相关

### GET /users/me - 获取当前用户信息
### PUT /users/me - 更新用户信息
### POST /users/me/avatar - 上传头像

---

## 4. JD相关

### GET /jobs - 获取JD列表
**查询参数**:
- page: 页码 (default: 1)
- limit: 每页数量 (default: 20)
- status: 状态过滤
- source: 来源过滤 (zhipin/maimai/manual/ocr/excel)
- search: 搜索关键词

### POST /jobs - 手动创建JD
```json
{
  "company_name": "阿里巴巴",
  "position_title": "Java开发工程师",
  "location": "杭州",
  "salary_min": 25000,
  "salary_max": 40000,
  "raw_content": "岗位职责：1. 负责后端开发...",
  "source": "manual"
}
```

### GET /jobs/:id - 获取JD详情
### POST /jobs/:id/analyze - 分析JD
### POST /jobs/extract-image - OCR识别JD图片
### POST /jobs/import-excel - 批量导入JD
### DELETE /jobs/:id - 删除JD

---

## 5. 经历相关

### GET /experiences - 获取经历列表
### POST /experiences - 创建经历
### PUT /experiences/:id - 更新经历
### DELETE /experiences/:id - 删除经历
### POST /experiences/parse-resume - 解析上传的简历

---

## 6. 简历相关

### GET /resumes - 获取简历列表
### POST /resumes/generate - 生成简历
```json
{
  "jd_id": "uuid",
  "template_id": "modern",
  "selected_experience_ids": ["exp1", "exp2", "exp3"],
  "config": {
    "optimize_with_ai": true,
    "highlight_skills": true
  }
}
```

### GET /resumes/:id - 获取简历详情
### PUT /resumes/:id - 更新简历内容
### POST /resumes/:id/regenerate - 重新生成简历
### GET /resumes/:id/versions - 获取简历版本历史
### POST /resumes/:id/rollback - 回滚到指定版本
### GET /resumes/:id/export - 导出简历
### DELETE /resumes/:id - 删除简历

---

## 7. 订阅相关

### GET /subscription/plans - 获取套餐列表
### GET /subscription - 获取当前订阅
### POST /subscription - 创建订阅
### POST /subscription/cancel - 取消订阅
### GET /subscription/usage - 获取使用统计

---

## 8. Chrome插件专用接口

### POST /extension/jobs - 插件推送JD
**请求头**: X-Extension-Token: {user_token}
```json
{
  "source": "zhipin",
  "site_url": "https://www.zhipin.com/job/xxx",
  "data": {
    "company_name": "字节跳动",
    "position_title": "高级后端工程师",
    "salary": "35k-50k",
    "location": "北京",
    "content": "完整JD文本..."
  }
}
```

### GET /extension/verify - 验证插件Token
