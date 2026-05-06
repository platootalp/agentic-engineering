-- ============================================
-- regen - PostgreSQL 初始化脚本
-- 在容器首次启动时自动执行
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 用于全文搜索

-- 创建应用用户（可选，用于更细粒度的权限控制）
-- CREATE USER resume_app WITH PASSWORD 'app_password';
-- GRANT CONNECT ON DATABASE regen_db TO resume_app;
-- GRANT USAGE ON SCHEMA public TO resume_app;
-- GRANT CREATE ON SCHEMA public TO resume_app;

-- 创建更新时间戳自动更新的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 注释说明
COMMENT ON FUNCTION update_updated_at_column() IS '自动更新updated_at字段的触发器函数';

-- 打印初始化完成信息
DO $$
BEGIN
    RAISE NOTICE 'regen database initialization completed successfully!';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Time: %', CURRENT_TIMESTAMP;
END $$;
