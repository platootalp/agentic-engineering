'use client'

import { TechCategoryCard } from '@/components/tech'
import type { TechCategory } from '@/data/tech/types'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

const storageCategories: TechCategory[] = [
  {
    id: 'relational',
    name: '关系型数据库',
    icon: '🔐',
    color: '#336791',
    problem: '结构化数据存储与事务一致性',
    description: '支持SQL查询、ACID事务、复杂关联查询，适用于需要强数据一致性和结构化存储的企业级应用。',
    mainstream: [
      { name: 'PostgreSQL', description: '功能最强大的开源关系型数据库，SQL标准支持最好', popularity: 'high' },
      { name: 'MySQL', description: '互联网应用最广泛，生态成熟，运维简单', popularity: 'high' },
      { name: 'TiDB', description: '分布式SQL，水平扩展，MySQL兼容', popularity: 'rising' },
      { name: 'CockroachDB', description: '分布式SQL，Kubernetes原生，强一致', popularity: 'rising' },
    ]
  },
  {
    id: 'columnar',
    name: '列式存储',
    icon: '📊',
    color: '#FF6B35',
    problem: '海量数据分析与OLAP查询',
    description: '专为分析场景优化，列式存储向量化执行，高压缩率，支持万亿级数据秒级查询响应。',
    mainstream: [
      { name: 'ClickHouse', description: 'OLAP领域标杆，万亿级数据秒级响应', popularity: 'high' },
      { name: 'Apache Druid', description: '实时数据分析，秒级摄入延迟', popularity: 'medium' },
      { name: 'StarRocks', description: '新一代MPP数据库，MySQL协议支持', popularity: 'rising' },
      { name: 'Apache Pinot', description: '实时分析+低延迟查询，LinkedIn出品', popularity: 'medium' },
    ]
  },
  {
    id: 'document',
    name: '文档数据库',
    icon: '📄',
    color: '#4DB33D',
    problem: '灵活Schema与半结构化数据',
    description: 'JSON文档模型，无需预定义结构，天然适配敏捷开发和动态业务需求。',
    mainstream: [
      { name: 'MongoDB', description: '最流行的文档数据库，生态完善', popularity: 'high' },
      { name: 'Amazon DynamoDB', description: 'AWS全托管，Serverless，极高可用', popularity: 'high' },
      { name: 'Couchbase', description: '高性能，SQL++查询，内存优先', popularity: 'medium' },
    ]
  },
  {
    id: 'key-value',
    name: '键值存储',
    icon: '⚡',
    color: '#DC382D',
    problem: '极高读写性能与缓存场景',
    description: '极简数据模型，超高读写性能，主要用作缓存层或对延迟敏感的场景。',
    mainstream: [
      { name: 'Redis', description: '内存键值存储，数据结构丰富', popularity: 'high' },
      { name: 'RocksDB', description: '嵌入键值存储，LSM树，高写入', popularity: 'high' },
      { name: 'Memcached', description: '纯内存缓存，简单高效', popularity: 'medium' },
    ]
  },
  {
    id: 'timeseries',
    name: '时序数据库',
    icon: '📈',
    color: '#0085C4',
    problem: '监控指标与IoT时序数据',
    description: '专为时间序列数据优化，高写入压缩，支持时间窗口查询，适用于监控、IoT场景。',
    mainstream: [
      { name: 'InfluxDB', description: '时序数据库标杆，InfluxQL/Flux查询', popularity: 'high' },
      { name: 'TimescaleDB', description: 'PostgreSQL时序扩展，SQL能力', popularity: 'high' },
      { name: 'Prometheus', description: '云原生监控，Pull模式，K8s原生', popularity: 'high' },
    ]
  },
  {
    id: 'vector',
    name: '向量数据库',
    icon: '🔮',
    color: '#7B68EE',
    problem: 'AI向量检索与大模型语义搜索',
    description: '专为向量嵌入设计，支持十亿级向量相似度搜索，是RAG和AI应用的核心基础设施。',
    mainstream: [
      { name: 'Milvus', description: '开源向量数据库，十亿级支持', popularity: 'high' },
      { name: 'Qdrant', description: '高性能向量检索，Rust实现', popularity: 'rising' },
      { name: 'Weaviate', description: '向量搜索引擎，GraphQL API', popularity: 'rising' },
      { name: 'Pinecone', description: '托管向量数据库，完全托管', popularity: 'high' },
    ]
  },
  {
    id: 'graph',
    name: '图数据库',
    icon: '🕸️',
    color: '#0081CB',
    problem: '复杂关系与图遍历查询',
    description: '原生图存储与计算，社交网络、推荐系统、风控反欺诈等复杂关联场景的核心技术。',
    mainstream: [
      { name: 'Neo4j', description: '最成熟的图数据库，Cypher查询', popularity: 'high' },
      { name: 'TuGraph', description: '蚂蚁集团开源，高性能，国产', popularity: 'medium' },
      { name: 'Nebula Graph', description: '分布式图数据库，支持Cypher', popularity: 'rising' },
      { name: 'JanusGraph', description: 'Apache顶级项目，Berkeley DB后端', popularity: 'medium' },
    ]
  },
  {
    id: 'object-storage',
    name: '对象存储',
    icon: '🗄️',
    color: '#5C5C5C',
    problem: '海量非结构化文件存储',
    description: 'S3兼容接口，弹性扩展，适合文件、图片、视频、日志等非结构化数据的存储与分发。',
    mainstream: [
      { name: 'MinIO', description: '高性能对象存储，K8s原生', popularity: 'high' },
      { name: 'Ceph', description: '统一存储系统，对象/块/文件', popularity: 'high' },
      { name: 'AWS S3', description: '云对象存储事实标准', popularity: 'high' },
      { name: 'Cloudflare R2', description: 'S3兼容，零 egress 费用', popularity: 'rising' },
    ]
  },
]

export default function StoragePage() {
  const {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(storageCategories, { initialPageSize: 10 })

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">存储技术栈全景图</h1>
          <p className="page-subtitle">
            了解存储各项技术的核心价值，掌握关系型、列式、文档、键值、时序、向量、图等全场景存储选型
          </p>
        </div>

        <div className="legend-container">
          <div className="legend-item">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-400">主流 - 广泛采用</span>
          </div>
          <div className="legend-item">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-400">常用 - 稳定使用</span>
          </div>
          <div className="legend-item">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-400">新星 - 快速崛起</span>
          </div>
        </div>

        <div className="tech-grid">
          {currentData.map((category) => (
            <TechCategoryCard key={category.id} category={category} />
          ))}
        </div>

        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="mt-6"
        />

        <div className="footer-note">
          <p className="text-sm text-slate-500 m-0">
            💡 点击卡片可展开查看更多技术 | 存储选型应结合数据模型、扩展性、一致性需求和运维成本综合考量
          </p>
        </div>
      </div>
    </div>
  )
}
