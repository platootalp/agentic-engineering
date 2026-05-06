import asyncio
import json
from enum import Enum
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from config import get_cached_settings
from db.database import get_db
from db.models import Category
from middleware.auth import get_current_user, require_role
from middleware.rate_limit import limiter
from services.data_sources import ExaSearchService

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


# ─── Enums & Schemas ───────────────────────────────────────────────────────────


class DataSource(str, Enum):
    EXA = "exa"
    APPSTORE = "appstore"
    GOOGLE_PLAY = "google_play"


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    name: str
    slug: str
    keywords: list[str]
    data_sources: list[DataSource]
    enabled: bool = True
    priority: int = 0


class CreateCategoryRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9_]+$")
    keywords: list[str] = Field(..., min_length=1)
    data_sources: list[DataSource] = Field(..., min_length=1)
    enabled: bool = True
    priority: int = Field(default=0, ge=1, le=5)

    @field_validator("slug")
    @classmethod
    def slug_lowercase(cls, v: str) -> str:
        return v.lower()

    @field_validator("keywords")
    @classmethod
    def keywords_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("keywords must have at least 1 item")
        return [kw.strip() for kw in v if kw.strip()]


class UpdateCategoryRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=100, pattern=r"^[a-z0-9_]+$")
    keywords: list[str] | None = Field(default=None, min_length=1)
    data_sources: list[DataSource] | None = Field(default=None, min_length=1)
    enabled: bool | None = None
    priority: int | None = Field(default=None, ge=1, le=5)

    @field_validator("slug")
    @classmethod
    def slug_lowercase(cls, v: str | None) -> str | None:
        return v.lower() if v is not None else v

    @field_validator("keywords")
    @classmethod
    def keywords_not_empty(cls, v: list[str] | None) -> list[str] | None:
        if v is not None and not v:
            raise ValueError("keywords must have at least 1 item")
        if v is not None:
            return [kw.strip() for kw in v if kw.strip()]
        return v


class KeywordPreviewResponse(BaseModel):
    slug: str
    estimated_results: int


# ─── Helpers ─────────────────────────────────────────────────────────────────


def _model_to_response(cat: Category) -> CategoryResponse:
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        keywords=cat.keywords_list,
        data_sources=[DataSource(ds) for ds in cat.data_sources_list],
        enabled=cat.enabled,
        priority=cat.priority,
    )


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.post("/seed", response_model=list[CategoryResponse])
def seed_categories_endpoint(
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(require_role("admin")),
):
    """POST /api/v1/categories/seed — 种子默认品类（admin 权限）"""
    from db.database import seed_categories
    seed_categories(force=True)

    categories = db.query(Category).order_by(Category.priority.desc()).all()
    return [_model_to_response(c) for c in categories]


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(get_current_user),
):
    """GET /api/v1/categories — 返回所有品类列表（user 权限）"""
    categories = db.query(Category).order_by(Category.priority.desc(), Category.name).all()
    return [_model_to_response(c) for c in categories]


@router.post("", response_model=CategoryResponse, status_code=201)
@limiter.limit("20/minute")
def create_category(
    request: Request,
    req: CreateCategoryRequest,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(require_role("admin")),
):
    """POST /api/v1/categories — 创建新品类（admin 权限）"""
    # 检查 slug 唯一性
    existing = db.query(Category).filter(Category.slug == req.slug).first()
    if existing:
        raise HTTPException(status_code=422, detail=f"slug '{req.slug}' 已存在")

    cat = Category(
        name=req.name,
        slug=req.slug,
        keywords=json.dumps(req.keywords, ensure_ascii=False),
        data_sources=json.dumps([ds.value for ds in req.data_sources], ensure_ascii=False),
        enabled=req.enabled,
        priority=req.priority,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return _model_to_response(cat)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    req: UpdateCategoryRequest,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(require_role("admin")),
):
    """PUT /api/v1/categories/{id} — 更新品类（admin 权限）"""
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="品类不存在")

    # 检查 slug 唯一性（排除自身）
    if req.slug is not None and req.slug != cat.slug:
        existing = db.query(Category).filter(Category.slug == req.slug).first()
        if existing:
            raise HTTPException(status_code=422, detail=f"slug '{req.slug}' 已存在")

    # 应用更新字段
    update_data = req.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        if field == "data_sources":
            setattr(cat, field, json.dumps([ds.value for ds in value], ensure_ascii=False))
        elif field == "keywords":
            setattr(cat, field, json.dumps(value, ensure_ascii=False))
        else:
            setattr(cat, field, value)

    db.commit()
    db.refresh(cat)
    return _model_to_response(cat)


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(require_role("admin")),
):
    """DELETE /api/v1/categories/{id} — 删除品类（admin 权限）"""
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="品类不存在")

    db.delete(cat)
    db.commit()


@router.get("/{category_id}/preview", response_model=KeywordPreviewResponse)
def preview_keywords(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(get_current_user),
):
    """GET /api/v1/categories/{id}/preview — 关键词预览（user 权限）

    返回该品类的预估搜索结果数量，辅助用户判断关键词有效性。
    目前为简化实现：基于关键词数量估算，后续可接入 Exa API 获取真实数据。
    """
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="品类不存在")

    # 简化估算：每个关键词约 50 条结果，上限 500
    keywords_count = len(cat.keywords_list)
    estimated = min(keywords_count * 50, 500)

    return KeywordPreviewResponse(slug=cat.slug, estimated_results=estimated)


@router.get("/{category_id}/keywords")
async def get_category_keywords(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(get_current_user),
):
    """GET /api/v1/categories/{id}/keywords — 关键词搜索（user 权限）

    使用 Exa API 搜索该品类第一个关键词的实时数据。
    """
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="品类不存在")

    settings = get_cached_settings()
    service = ExaSearchService(api_key=settings.EXA_API_KEY)
    keywords = cat.keywords_list

    if not keywords:
        return {
            "slug": cat.slug,
            "keywords": [],
            "estimated_results": 0,
            "data_sources": cat.data_sources_list,
        }

    # 使用第一个关键词进行搜索
    results = await service.search_single(keywords[0], num_results=10)

    return {
        "slug": cat.slug,
        "keywords": keywords,
        "estimated_results": len(results),
        "data_sources": cat.data_sources_list,
    }
