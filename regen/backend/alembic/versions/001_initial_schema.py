"""Initial schema migration

创建所有核心表结构
Revision ID: 001
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001'
down_revision: Union[str, None] = None

def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')

    # users table
    op.create_table('regen_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100)),
        sa.Column('last_name', sa.String(100)),
        sa.Column('avatar_url', sa.Text()),
        sa.Column('phone', sa.String(20)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
    )
    op.create_index('idx_users_email', 'regen_users', ['email'])
    op.create_index('idx_users_created_at', 'regen_users', ['created_at'])
    op.create_index('idx_users_deleted_at', 'regen_users', ['deleted_at'], postgresql_where=sa.text('deleted_at IS NULL'))

    # subscriptions table
    op.create_table('regen_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tier', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('expires_at', sa.DateTime(timezone=True)),
        sa.Column('auto_renew', sa.Boolean(), default=True),
        sa.Column('stripe_subscription_id', sa.String(100)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.UniqueConstraint('user_id'),
        sa.CheckConstraint("tier IN ('free', 'basic', 'pro', 'premium')", name='ck_subscriptions_tier'),
        sa.CheckConstraint("status IN ('active', 'cancelled', 'expired', 'trial')", name='ck_subscriptions_status'),
    )
    op.create_index('idx_subscriptions_user_id', 'regen_subscriptions', ['user_id'])
    op.create_index('idx_subscriptions_expires_at', 'regen_subscriptions', ['expires_at'])
    op.create_index('idx_subscriptions_status', 'regen_subscriptions', ['status'])

    # quota_records table
    op.create_table('regen_quota_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('action_type', sa.String(50), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, default=1),
        sa.Column('used_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('related_id', postgresql.UUID(as_uuid=True)),
        sa.Column('metadata', postgresql.JSONB()),
    )
    op.create_index('idx_quota_records_user_id', 'regen_quota_records', ['user_id'])
    op.create_index('idx_quota_records_used_at', 'regen_quota_records', ['used_at'])
    op.create_index('idx_quota_records_user_time', 'regen_quota_records', ['user_id', 'used_at'])
    op.create_index('idx_quota_records_action_type', 'regen_quota_records', ['action_type'])

    # experiences table
    op.create_table('regen_experiences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('organization', sa.String(200)),
        sa.Column('location', sa.String(200)),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date()),
        sa.Column('is_current', sa.Boolean(), default=False),
        sa.Column('description', sa.Text()),
        sa.Column('description_ai', sa.Text()),
        sa.Column('skills', postgresql.ARRAY(sa.String())),
        sa.Column('achievements', postgresql.ARRAY(sa.String())),
        sa.Column('metadata', postgresql.JSONB()),
        sa.Column('order_index', sa.Integer(), default=0),
        sa.Column('is_highlighted', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
        sa.CheckConstraint("type IN ('work', 'education', 'project')", name='ck_experiences_type'),
    )
    op.create_index('idx_experiences_user_id', 'regen_experiences', ['user_id'])
    op.create_index('idx_experiences_type', 'regen_experiences', ['type'])
    op.create_index('idx_experiences_dates', 'regen_experiences', ['start_date', 'end_date'])
    op.create_index('idx_experiences_user_type', 'regen_experiences', ['user_id', 'type'])
    op.create_index('idx_experiences_deleted_at', 'regen_experiences', ['deleted_at'], postgresql_where=sa.text('deleted_at IS NULL'))

    # job_descriptions table
    op.create_table('regen_job_descriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('source', sa.String(50), nullable=False),
        sa.Column('source_url', sa.Text()),
        sa.Column('source_id', sa.String(100)),
        sa.Column('company_name', sa.String(200), nullable=False),
        sa.Column('company_size', sa.String(50)),
        sa.Column('company_stage', sa.String(50)),
        sa.Column('company_industry', sa.String(100)),
        sa.Column('position_title', sa.String(200), nullable=False),
        sa.Column('position_level', sa.String(50)),
        sa.Column('department', sa.String(100)),
        sa.Column('location', sa.String(200)),
        sa.Column('salary_min', sa.Integer()),
        sa.Column('salary_max', sa.Integer()),
        sa.Column('salary_months', sa.Integer(), default=12),
        sa.Column('raw_content', sa.Text(), nullable=False),
        sa.Column('analysis', postgresql.JSONB()),
        sa.Column('requirements', postgresql.ARRAY(sa.String())),
        sa.Column('responsibilities', postgresql.ARRAY(sa.String())),
        sa.Column('required_skills', postgresql.ARRAY(sa.String())),
        sa.Column('preferred_skills', postgresql.ARRAY(sa.String())),
        sa.Column('status', sa.String(20), default='active'),
        sa.Column('is_analyzed', sa.Boolean(), default=False),
        sa.Column('analyzed_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
        sa.CheckConstraint("status IN ('active', 'archived', 'deleted')", name='ck_job_descriptions_status'),
    )
    op.create_index('idx_job_descriptions_user_id', 'regen_job_descriptions', ['user_id'])
    op.create_index('idx_job_descriptions_source', 'regen_job_descriptions', ['source'])
    op.create_index('idx_job_descriptions_status', 'regen_job_descriptions', ['status'])
    op.create_index('idx_job_descriptions_company', 'regen_job_descriptions', ['company_name'])
    op.create_index('idx_job_descriptions_user_source', 'regen_job_descriptions', ['user_id', 'source'])
    op.create_index('idx_job_descriptions_deleted_at', 'regen_job_descriptions', ['deleted_at'], postgresql_where=sa.text('deleted_at IS NULL'))

    # resumes table
    op.create_table('regen_resumes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('jd_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_job_descriptions.id')),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('template_id', sa.String(100), nullable=False, default='modern'),
        sa.Column('content', postgresql.JSONB(), nullable=False),
        sa.Column('selected_experience_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True))),
        sa.Column('generation_config', postgresql.JSONB()),
        sa.Column('ai_suggestions', postgresql.JSONB()),
        sa.Column('pdf_url', sa.Text()),
        sa.Column('word_url', sa.Text()),
        sa.Column('markdown_content', sa.Text()),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('is_default', sa.Boolean(), default=False),
        sa.Column('view_count', sa.Integer(), default=0),
        sa.Column('download_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('deleted_at', sa.DateTime(timezone=True)),
        sa.CheckConstraint("status IN ('draft', 'published', 'archived')", name='ck_resumes_status'),
    )
    op.create_index('idx_resumes_user_id', 'regen_resumes', ['user_id'])
    op.create_index('idx_resumes_jd_id', 'regen_resumes', ['jd_id'])
    op.create_index('idx_resumes_status', 'regen_resumes', ['status'])
    op.create_index('idx_resumes_user_status', 'regen_resumes', ['user_id', 'status'])
    op.create_index('idx_resumes_template_id', 'regen_resumes', ['template_id'])
    op.create_index('idx_resumes_deleted_at', 'regen_resumes', ['deleted_at'], postgresql_where=sa.text('deleted_at IS NULL'))

    # resume_versions table
    op.create_table('regen_resume_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('resume_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_resumes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('content', postgresql.JSONB(), nullable=False),
        sa.Column('change_summary', sa.Text()),
        sa.Column('created_by', sa.String(20), default='user'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.UniqueConstraint('resume_id', 'version_number'),
        sa.CheckConstraint("created_by IN ('user', 'ai', 'system')", name='ck_resume_versions_created_by'),
    )
    op.create_index('idx_resume_versions_resume_id', 'regen_resume_versions', ['resume_id'])
    op.create_index('idx_resume_versions_created_at', 'regen_resume_versions', ['created_at'])

    # templates table
    op.create_table('regen_templates',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('is_premium', sa.Boolean(), default=False),
        sa.Column('preview_image_url', sa.Text()),
        sa.Column('config', postgresql.JSONB(), nullable=False),
        sa.Column('html_template', sa.Text()),
        sa.Column('css_styles', sa.Text()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
    )
    op.create_index('idx_templates_category', 'regen_templates', ['category'])
    op.create_index('idx_templates_is_active', 'regen_templates', ['is_active'], postgresql_where=sa.text('is_active = TRUE'))
    op.create_index('idx_templates_is_premium', 'regen_templates', ['is_premium'])

    # ai_logs table
    op.create_table('regen_ai_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('regen_users.id')),
        sa.Column('request_type', sa.String(50), nullable=False),
        sa.Column('model', sa.String(50), nullable=False),
        sa.Column('prompt_tokens', sa.Integer()),
        sa.Column('completion_tokens', sa.Integer()),
        sa.Column('total_tokens', sa.Integer()),
        sa.Column('latency_ms', sa.Integer()),
        sa.Column('cost_cents', sa.Integer()),
        sa.Column('request_data', postgresql.JSONB()),
        sa.Column('response_data', postgresql.JSONB()),
        sa.Column('error_message', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
    )
    op.create_index('idx_ai_logs_user_id', 'regen_ai_logs', ['user_id'])
    op.create_index('idx_ai_logs_created_at', 'regen_ai_logs', ['created_at'])
    op.create_index('idx_ai_logs_model', 'regen_ai_logs', ['model'])
    op.create_index('idx_ai_logs_user_time', 'regen_ai_logs', ['user_id', 'created_at'])
    op.create_index('idx_ai_logs_request_type', 'regen_ai_logs', ['request_type'])


def downgrade() -> None:
    op.drop_table('regen_ai_logs')
    op.drop_table('regen_templates')
    op.drop_table('regen_resume_versions')
    op.drop_table('regen_resumes')
    op.drop_table('regen_job_descriptions')
    op.drop_table('regen_experiences')
    op.drop_table('regen_quota_records')
    op.drop_table('regen_subscriptions')
    op.drop_table('regen_users')
