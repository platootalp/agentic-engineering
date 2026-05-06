# 数据库详细设计文档

**版本**: v1.0  
**日期**: 2026-02-24  
**数据库**: PostgreSQL 16

---

## 目录

- [1. 数据库设计原则](#1-数据库设计原则)
  - [1.1 命名规范](#11-命名规范)
  - [1.2 通用字段](#12-通用字段)

- [2. 实体关系图 (ERD)](#2-实体关系图-erd)

- [3. 表结构设计](#3-表结构设计)
  - [3.1 用户域](#31-用户域)
  - [3.2 经历域](#32-经历域)
  - [3.3 JD域](#33-jd域)
  - [3.4 简历域](#34-简历域)
  - [3.5 其他表](#35-其他表)

- [4. 索引策略](#4-索引策略)
  - [4.1 常用查询索引](#41-常用查询索引)
  - [4.2 全文搜索](#42-全文搜索)

- [5. 数据迁移策略](#5-数据迁移策略)
  - [5.1 初始迁移 (Alembic)](#51-初始迁移-alembic)
  - [5.2 数据种子](#52-数据种子)

- [6. 备份策略](#6-备份策略)
  - [6.1 自动备份](#61-自动备份)
  - [6.2 异地备份](#62-异地备份)

---

## 1. 数据库设计原则

### 1.1 命名规范
- 表名: 小写下划线，复数形式（`users`, `job_descriptions`）
- 字段名: 小写下划线（`created_at`, `first_name`）
- 索引名: `idx_{table}_{columns}`
- 外键名: `fk_{table}_{ref_table}`

### 1.2 通用字段
所有表包含以下字段：
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
deleted_at TIMESTAMP WITH TIME ZONE  -- 软删除
```

---

## 2. 实体关系图 (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据库实体关系图                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐      ┌──────────────┐      ┌────────────────┐                │
│  │  users   │──────┤ subscriptions│      │ quota_records  │                │
│  │          │ 1:1  │              │      │                │                │
│  └────┬─────┘      └──────────────┘      └────────────────┘                │
│       │                                                                      │
│       │ 1:N                                                                 │
│       │                                                                      │
│  ┌────┴─────┐      ┌──────────────┐      ┌────────────────┐                │
│  │experiences│      │ job_descriptions                                │                │
│  │          │◄────►│              │      │ resume_jd_mapping            │                │
│  └────┬─────┘ N:M  └──────┬───────┘      └────────────────┘                │
│       │                   │                                                 │
│       │                   │                                                 │
│       │                   │                                                 │
│  ┌────┴─────┐      ┌──────┴───────┐                                        │
│  │  skills  │      │   resumes    │                                        │
│  │          │      │              │                                        │
│  └──────────┘      └──────┬───────┘                                        │
│                           │                                                 │
│                      ┌────┴─────┐                                           │
│                      │resume_versions                                    │
│                      │          │                                           │
│                      └──────────┘                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 表结构设计

### 3.1 用户域

#### users - 用户表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### subscriptions - 订阅表
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'premium')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
```

#### quota_records - 配额使用记录表
```sql
CREATE TABLE quota_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,  -- 'jd_extract', 'resume_generate', etc.
    quantity INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    related_id UUID,  -- 关联的JD或Resume ID
    metadata JSONB    -- 额外信息
);

CREATE INDEX idx_quota_records_user_id ON quota_records(user_id);
CREATE INDEX idx_quota_records_used_at ON quota_records(used_at);
```

### 3.2 经历域

#### experiences - 经历表
```sql
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('work', 'education', 'project')),
    title VARCHAR(200) NOT NULL,  -- 职位/学位/项目名称
    organization VARCHAR(200),    -- 公司/学校
    location VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,  -- NULL表示至今
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,  -- 原始描述
    description_ai TEXT,  -- AI优化后的描述
    skills TEXT[],  -- 关联技能
    achievements TEXT[],  -- 成就/亮点
    metadata JSONB,  -- 额外字段（学历等级、薪资等）
    order_index INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_experiences_user_id ON experiences(user_id);
CREATE INDEX idx_experiences_type ON experiences(type);
CREATE INDEX idx_experiences_dates ON experiences(start_date, end_date);
```

### 3.3 JD域

#### job_descriptions - JD表
```sql
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 基本信息
    source VARCHAR(50) NOT NULL,  -- 'zhipin', 'maimai', 'manual', 'ocr', 'excel'
    source_url TEXT,
    source_id VARCHAR(100),  -- 外部ID
    
    -- 公司信息
    company_name VARCHAR(200) NOT NULL,
    company_size VARCHAR(50),  -- '1-50', '50-200', etc.
    company_stage VARCHAR(50),  -- 'startup', 'growth', 'listed'
    company_industry VARCHAR(100),
    
    -- 职位信息
    position_title VARCHAR(200) NOT NULL,
    position_level VARCHAR(50),  -- 'junior', 'senior', 'lead', etc.
    department VARCHAR(100),
    
    -- 位置薪资
    location VARCHAR(200),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_months INTEGER DEFAULT 12,  -- 年薪月份
    
    -- 原始内容
    raw_content TEXT NOT NULL,  -- 原始JD文本
    
    -- AI分析结果
    analysis JSONB,  -- AI分析的结构化数据
    requirements TEXT[],  -- 提取的要求
    responsibilities TEXT[],  -- 职责
    required_skills TEXT[],  -- 必需技能
    preferred_skills TEXT[],  -- 加分技能
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    is_analyzed BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_job_descriptions_user_id ON job_descriptions(user_id);
CREATE INDEX idx_job_descriptions_source ON job_descriptions(source);
CREATE INDEX idx_job_descriptions_status ON job_descriptions(status);
CREATE INDEX idx_job_descriptions_company ON job_descriptions(company_name);

-- 全文搜索索引
CREATE INDEX idx_job_descriptions_search ON job_descriptions 
    USING gin(to_tsvector('chinese', raw_content || ' ' || COALESCE(position_title, '') || ' ' || COALESCE(company_name, '')));
```

### 3.4 简历域

#### resumes - 简历表
```sql
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 关联JD
    jd_id UUID REFERENCES job_descriptions(id),
    
    -- 基本信息
    title VARCHAR(200) NOT NULL,  -- 简历标题
    template_id VARCHAR(100) NOT NULL DEFAULT 'modern',
    
    -- 内容
    content JSONB NOT NULL,  -- 完整简历内容（结构化的经历、技能等）
    selected_experience_ids UUID[],  -- 选中的经历ID
    
    -- AI生成信息
    generation_config JSONB,  -- 生成配置
    ai_suggestions JSONB,     -- AI建议
    
    -- 文件
    pdf_url TEXT,
    word_url TEXT,
    markdown_content TEXT,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_default BOOLEAN DEFAULT FALSE,
    
    -- 统计
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_jd_id ON resumes(jd_id);
CREATE INDEX idx_resumes_status ON resumes(status);
```

#### resume_versions - 简历版本表
```sql
CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,  -- 版本内容快照
    change_summary TEXT,  -- 变更摘要
    created_by VARCHAR(20) DEFAULT 'user' CHECK (created_by IN ('user', 'ai', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(resume_id, version_number)
);

CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
```

### 3.5 其他表

#### templates - 简历模板表
```sql
CREATE TABLE templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- 'tech', 'business', 'creative'
    is_premium BOOLEAN DEFAULT FALSE,
    preview_image_url TEXT,
    config JSONB NOT NULL,  -- 模板配置（颜色、字体、布局等）
    html_template TEXT,  -- HTML模板
    css_styles TEXT,     -- CSS样式
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ai_logs - AI调用日志表
```sql
CREATE TABLE ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL,  -- 'jd_analysis', 'resume_generate', etc.
    model VARCHAR(50) NOT NULL,  -- 'kimi', 'deepseek', etc.
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    latency_ms INTEGER,
    cost_cents INTEGER,  -- 成本（分）
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at);
CREATE INDEX idx_ai_logs_model ON ai_logs(model);
```

---

## 4. 索引策略

### 4.1 常用查询索引
```sql
-- 用户相关
CREATE INDEX idx_experiences_user_type ON experiences(user_id, type);
CREATE INDEX idx_job_descriptions_user_source ON job_descriptions(user_id, source);
CREATE INDEX idx_resumes_user_status ON resumes(user_id, status);

-- 时间范围查询
CREATE INDEX idx_quota_records_user_time ON quota_records(user_id, used_at);
CREATE INDEX idx_ai_logs_user_time ON ai_logs(user_id, created_at);
```

### 4.2 全文搜索
```sql
-- 经历描述搜索
CREATE INDEX idx_experiences_search ON experiences 
    USING gin(to_tsvector('chinese', COALESCE(description, '') || ' ' || COALESCE(title, '')));
```

---

## 5. 数据迁移策略

### 5.1 初始迁移 (Alembic)
```bash
# 生成迁移脚本
alembic revision --autogenerate -m "initial migration"

# 执行迁移
alembic upgrade head
```

### 5.2 数据种子
```sql
-- 插入默认模板
INSERT INTO templates (id, name, category, config) VALUES
('modern', '现代简约', 'tech', '{"colors": ["#333", "#666"], "font": "Arial"}'),
('classic', '经典商务', 'business', '{"colors": ["#000", "#444"], "font": "Times"}'),
('creative', '创意设计', 'creative', '{"colors": ["#FF6B6B", "#4ECDC4"], "font": "Helvetica"}');
```

---

## 6. 备份策略

### 6.1 自动备份
```bash
# 每日全量备份 (cron)
0 2 * * * pg_dump -h localhost -U user regen_db | gzip > /backup/regen_db_$(date +\%Y\%m\%d).sql.gz

# 保留7天
find /backup -name "regen_db_*.sql.gz" -mtime +7 -delete
```

### 6.2 异地备份
- 阿里云OSS跨区域复制
- 或 rsync 到异地服务器
