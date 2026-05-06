-- =====================================================
-- Regen 数据库 Schema
-- PostgreSQL 16
-- 生成日期: 2026-02-24
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 用于模糊搜索

-- =====================================================
-- 1. regen_users - 用户表
-- =====================================================
CREATE TABLE regen_users (
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

COMMENT ON TABLE regen_users IS '用户表';
COMMENT ON COLUMN regen_users.password_hash IS '加密后的密码';
COMMENT ON COLUMN regen_users.is_verified IS '邮箱是否已验证';

-- regen_users 表索引
CREATE INDEX idx_regen_users_email ON regen_users(email);
CREATE INDEX idx_regen_users_created_at ON regen_users(created_at);
CREATE INDEX idx_regen_users_deleted_at ON regen_users(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 2. regen_subscriptions - 订阅表
-- =====================================================
CREATE TABLE regen_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES regen_users(id) ON DELETE CASCADE,
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

COMMENT ON TABLE regen_subscriptions IS '用户订阅表';
COMMENT ON COLUMN regen_subscriptions.tier IS '订阅等级: free/basic/pro/premium';
COMMENT ON COLUMN regen_subscriptions.status IS '订阅状态: active/cancelled/expired/trial';

-- regen_subscriptions 表索引
CREATE INDEX idx_regen_subscriptions_user_id ON regen_subscriptions(user_id);
CREATE INDEX idx_regen_subscriptions_expires_at ON regen_subscriptions(expires_at);
CREATE INDEX idx_regen_subscriptions_status ON regen_subscriptions(status);

-- =====================================================
-- 3. regen_quota_records - 配额使用记录表
-- =====================================================
CREATE TABLE regen_quota_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES regen_users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,  -- 'jd_extract', 'resume_generate', etc.
    quantity INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    related_id UUID,  -- 关联的JD或Resume ID
    metadata JSONB    -- 额外信息
);

COMMENT ON TABLE regen_quota_records IS '配额使用记录表';
COMMENT ON COLUMN regen_quota_records.action_type IS '操作类型: jd_extract/resume_generate等';

-- regen_quota_records 表索引
CREATE INDEX idx_regen_quota_records_user_id ON regen_quota_records(user_id);
CREATE INDEX idx_regen_quota_records_used_at ON regen_quota_records(used_at);
CREATE INDEX idx_regen_quota_records_user_time ON regen_quota_records(user_id, used_at);
CREATE INDEX idx_regen_quota_records_action_type ON regen_quota_records(action_type);

-- =====================================================
-- 4. regen_experiences - 经历表
-- =====================================================
CREATE TABLE regen_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES regen_users(id) ON DELETE CASCADE,
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

COMMENT ON TABLE regen_experiences IS '用户经历表';
COMMENT ON COLUMN regen_experiences.type IS '经历类型: work/education/project';
COMMENT ON COLUMN regen_experiences.is_current IS '是否当前正在进行';

-- regen_experiences 表索引
CREATE INDEX idx_regen_experiences_user_id ON regen_experiences(user_id);
CREATE INDEX idx_regen_experiences_type ON regen_experiences(type);
CREATE INDEX idx_regen_experiences_dates ON regen_experiences(start_date, end_date);
CREATE INDEX idx_regen_experiences_user_type ON regen_experiences(user_id, type);
CREATE INDEX idx_regen_experiences_deleted_at ON regen_experiences(deleted_at) WHERE deleted_at IS NULL;

-- 经历描述全文搜索索引
CREATE INDEX idx_regen_experiences_search ON regen_experiences
    USING gin(to_tsvector('chinese', COALESCE(description, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(organization, '')));

-- =====================================================
-- 5. regen_job_descriptions - JD表
-- =====================================================
CREATE TABLE regen_job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES regen_users(id) ON DELETE CASCADE,

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

COMMENT ON TABLE regen_job_descriptions IS '职位描述(JD)表';
COMMENT ON COLUMN regen_job_descriptions.source IS '来源: zhipin/maimai/manual/ocr/excel';
COMMENT ON COLUMN regen_job_descriptions.raw_content IS '原始JD文本内容';
COMMENT ON COLUMN regen_job_descriptions.is_analyzed IS '是否已完成AI分析';

-- regen_job_descriptions 表索引
CREATE INDEX idx_regen_job_descriptions_user_id ON regen_job_descriptions(user_id);
CREATE INDEX idx_regen_job_descriptions_source ON regen_job_descriptions(source);
CREATE INDEX idx_regen_job_descriptions_status ON regen_job_descriptions(status);
CREATE INDEX idx_regen_job_descriptions_company ON regen_job_descriptions(company_name);
CREATE INDEX idx_regen_job_descriptions_user_source ON regen_job_descriptions(user_id, source);
CREATE INDEX idx_regen_job_descriptions_deleted_at ON regen_job_descriptions(deleted_at) WHERE deleted_at IS NULL;

-- JD全文搜索索引
CREATE INDEX idx_regen_job_descriptions_search ON regen_job_descriptions
    USING gin(to_tsvector('chinese', raw_content || ' ' || COALESCE(position_title, '') || ' ' || COALESCE(company_name, '')));

-- =====================================================
-- 6. regen_resumes - 简历表
-- =====================================================
CREATE TABLE regen_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES regen_users(id) ON DELETE CASCADE,

    -- 关联JD
    jd_id UUID REFERENCES regen_job_descriptions(id),

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

COMMENT ON TABLE regen_resumes IS '简历表';
COMMENT ON COLUMN regen_resumes.content IS '简历内容JSON结构';
COMMENT ON COLUMN regen_resumes.selected_experience_ids IS '用户选中的经历ID列表';

-- regen_resumes 表索引
CREATE INDEX idx_regen_resumes_user_id ON regen_resumes(user_id);
CREATE INDEX idx_regen_resumes_jd_id ON regen_resumes(jd_id);
CREATE INDEX idx_regen_resumes_status ON regen_resumes(status);
CREATE INDEX idx_regen_resumes_user_status ON regen_resumes(user_id, status);
CREATE INDEX idx_regen_resumes_template_id ON regen_resumes(template_id);
CREATE INDEX idx_regen_resumes_deleted_at ON regen_resumes(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 7. regen_resume_versions - 简历版本表
-- =====================================================
CREATE TABLE regen_resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES regen_resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,  -- 版本内容快照
    change_summary TEXT,  -- 变更摘要
    created_by VARCHAR(20) DEFAULT 'user' CHECK (created_by IN ('user', 'ai', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(resume_id, version_number)
);

COMMENT ON TABLE regen_resume_versions IS '简历版本历史表';
COMMENT ON COLUMN regen_resume_versions.created_by IS '版本创建者: user/ai/system';

-- regen_resume_versions 表索引
CREATE INDEX idx_regen_resume_versions_resume_id ON regen_resume_versions(resume_id);
CREATE INDEX idx_regen_resume_versions_created_at ON regen_resume_versions(created_at);

-- =====================================================
-- 8. regen_templates - 简历模板表
-- =====================================================
CREATE TABLE regen_templates (
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

COMMENT ON TABLE regen_templates IS '简历模板表';
COMMENT ON COLUMN regen_templates.category IS '模板分类: tech/business/creative';
COMMENT ON COLUMN regen_templates.config IS '模板配置JSON';

-- regen_templates 表索引
CREATE INDEX idx_regen_templates_category ON regen_templates(category);
CREATE INDEX idx_regen_templates_is_active ON regen_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_regen_templates_is_premium ON regen_templates(is_premium);

-- =====================================================
-- 9. regen_ai_logs - AI调用日志表
-- =====================================================
CREATE TABLE regen_ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES regen_users(id),
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

COMMENT ON TABLE regen_ai_logs IS 'AI调用日志表';
COMMENT ON COLUMN regen_ai_logs.request_type IS '请求类型: jd_analysis/resume_generate等';
COMMENT ON COLUMN regen_ai_logs.cost_cents IS '调用成本（单位：分）';

-- regen_ai_logs 表索引
CREATE INDEX idx_regen_ai_logs_user_id ON regen_ai_logs(user_id);
CREATE INDEX idx_regen_ai_logs_created_at ON regen_ai_logs(created_at);
CREATE INDEX idx_regen_ai_logs_model ON regen_ai_logs(model);
CREATE INDEX idx_regen_ai_logs_user_time ON regen_ai_logs(user_id, created_at);
CREATE INDEX idx_regen_ai_logs_request_type ON regen_ai_logs(request_type);

-- =====================================================
-- 触发器: 自动更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新 updated_at 的表创建触发器
CREATE TRIGGER update_regen_users_updated_at BEFORE UPDATE ON regen_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regen_subscriptions_updated_at BEFORE UPDATE ON regen_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regen_experiences_updated_at BEFORE UPDATE ON regen_experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regen_job_descriptions_updated_at BEFORE UPDATE ON regen_job_descriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regen_resumes_updated_at BEFORE UPDATE ON regen_resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 权限设置 (可选)
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO regen_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO regen_app;
