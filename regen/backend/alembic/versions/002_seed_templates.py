"""Seed default templates

插入默认简历模板数据:
- modern: 现代简约模板
- classic: 经典商务模板  
- creative: 创意设计模板

Revision ID: 002
Revises: 001
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002'
down_revision: str = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("""
        INSERT INTO regen_templates (id, name, description, category, is_premium, config, html_template, css_styles, is_active) VALUES
        (
            'modern',
            '现代简约',
            '简洁现代的简历模板，适合科技行业和初创公司。清晰的排版和充足的留白让内容更加突出。',
            'tech',
            false,
            '{"colors": {"primary": "#2563eb", "secondary": "#64748b", "background": "#ffffff", "text": "#1e293b", "accent": "#3b82f6"}, "fonts": {"heading": "Inter", "body": "Inter"}, "layout": {"maxWidth": "800px", "padding": "40px", "sectionSpacing": "24px"}, "sections": {"header": {"style": "centered", "showPhoto": true}, "experience": {"style": "timeline", "maxItems": 5}, "education": {"style": "compact"}, "skills": {"style": "tags", "columns": 2}}}',
            '<div class="resume-modern"><header class="resume-header"><h1 class="name">{{name}}</h1><div class="contact"><span>{{email}}</span><span>{{phone}}</span><span>{{location}}</span></div></header><section class="summary"><h2>个人简介</h2><p>{{summary}}</p></section><section class="experience"><h2>工作经历</h2>{{#experiences}}<div class="exp-item"><h3>{{title}}</h3><div class="exp-meta">{{organization}} | {{start_date}} - {{end_date}}</div><p>{{description}}</p></div>{{/experiences}}</section></div>',
            '.resume-modern { font-family: Inter, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; } .resume-header { text-align: center; margin-bottom: 30px; } .name { font-size: 32px; color: #1e293b; margin-bottom: 10px; } .contact { color: #64748b; font-size: 14px; } .contact span { margin: 0 10px; } h2 { color: #2563eb; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-top: 24px; } .exp-item { margin-bottom: 20px; } .exp-item h3 { font-size: 16px; color: #1e293b; margin-bottom: 4px; } .exp-meta { color: #64748b; font-size: 14px; margin-bottom: 8px; }',
            true
        ),
        (
            'classic',
            '经典商务',
            '传统商务风格的简历模板，适合金融、咨询和大型企业。专业稳重的排版展现职业素养。',
            'business',
            false,
            '{"colors": {"primary": "#1a1a1a", "secondary": "#4a4a4a", "background": "#ffffff", "text": "#2d2d2d", "accent": "#8b0000"}, "fonts": {"heading": "Georgia", "body": "Times New Roman"}, "layout": {"maxWidth": "850px", "padding": "50px", "sectionSpacing": "20px"}, "sections": {"header": {"style": "traditional", "showPhoto": false}, "experience": {"style": "detailed", "maxItems": 6}, "education": {"style": "detailed"}, "skills": {"style": "list", "columns": 3}}}',
            '<div class="resume-classic"><header class="resume-header"><div class="header-left"><h1 class="name">{{name}}</h1><div class="title">{{title}}</div></div><div class="header-right"><div>{{email}}</div><div>{{phone}}</div><div>{{address}}</div></div></header><section class="experience"><h2>PROFESSIONAL EXPERIENCE</h2>{{#experiences}}<div class="exp-item"><div class="exp-header"><strong>{{organization}}</strong><span>{{location}}</span></div><div class="exp-title">{{title}}</div><div class="exp-date">{{start_date}} - {{end_date}}</div><ul class="exp-details">{{#achievements}}<li>{{.}}</li>{{/achievements}}</ul></div>{{/experiences}}</section></div>',
            '.resume-classic { font-family: "Times New Roman", serif; max-width: 850px; margin: 0 auto; padding: 50px; color: #2d2d2d; } .resume-header { display: flex; justify-content: space-between; border-bottom: 3px double #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; } .name { font-family: Georgia, serif; font-size: 28px; margin: 0; } .title { font-style: italic; color: #4a4a4a; margin-top: 5px; } .header-right { text-align: right; font-size: 14px; line-height: 1.6; } h2 { font-family: Georgia, serif; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1a1a1a; padding-bottom: 5px; margin-top: 25px; } .exp-item { margin-bottom: 20px; } .exp-header { display: flex; justify-content: space-between; font-size: 14px; } .exp-title { font-style: italic; margin: 5px 0; } .exp-date { font-size: 13px; color: #4a4a4a; } .exp-details { margin-top: 8px; padding-left: 20px; } .exp-details li { margin-bottom: 4px; font-size: 14px; }',
            true
        ),
        (
            'creative',
            '创意设计',
            '富有创意的简历模板，适合设计、媒体和创意行业。独特的布局和配色展现个人风格。',
            'creative',
            false,
            '{"colors": {"primary": "#ff6b6b", "secondary": "#4ecdc4", "background": "#f8f9fa", "text": "#2c3e50", "accent": "#ffe66d"}, "fonts": {"heading": "Poppins", "body": "Open Sans"}, "layout": {"maxWidth": "900px", "padding": "0", "sectionSpacing": "0"}, "sections": {"header": {"style": "sidebar", "showPhoto": true}, "experience": {"style": "cards", "maxItems": 4}, "education": {"style": "timeline"}, "skills": {"style": "visual", "columns": 2}}}',
            '<div class="resume-creative"><aside class="sidebar"><div class="profile-section"><h1 class="name">{{name}}</h1><div class="tagline">{{title}}</div></div><div class="contact-section"><h3>Contact</h3><div>{{email}}</div><div>{{phone}}</div><div>{{website}}</div></div><div class="skills-section"><h3>Skills</h3>{{#skills}}<div class="skill-tag">{{name}}</div>{{/skills}}</div></aside><main class="content"><section class="about"><h2>About Me</h2><p>{{summary}}</p></section><section class="experience"><h2>Experience</h2>{{#experiences}}<div class="exp-card"><div class="exp-period">{{start_date}} - {{end_date}}</div><h3>{{title}}</h3><div class="exp-company">{{organization}}</div><p>{{description}}</p></div>{{/experiences}}</section></main></div>',
            '.resume-creative { font-family: "Open Sans", sans-serif; display: flex; max-width: 900px; margin: 0 auto; background: #f8f9fa; } .sidebar { width: 300px; background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); color: white; padding: 40px 30px; } .content { flex: 1; padding: 40px; } .name { font-family: Poppins, sans-serif; font-size: 32px; margin: 0 0 10px 0; } .tagline { font-size: 16px; opacity: 0.9; } .contact-section, .skills-section { margin-top: 40px; } .contact-section h3, .skills-section h3 { font-family: Poppins, sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; } .skill-tag { display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; margin: 5px; font-size: 13px; } .content h2 { font-family: Poppins, sans-serif; color: #ff6b6b; font-size: 24px; margin-bottom: 20px; } .exp-card { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); } .exp-period { color: #4ecdc4; font-size: 13px; font-weight: 600; } .exp-card h3 { color: #2c3e50; margin: 10px 0 5px 0; } .exp-company { color: #7f8c8d; font-size: 14px; margin-bottom: 10px; }',
            true
        )
        ON CONFLICT (id) DO NOTHING;
    """)

def downgrade() -> None:
    op.execute("DELETE FROM regen_templates WHERE id IN ('modern', 'classic', 'creative');")
