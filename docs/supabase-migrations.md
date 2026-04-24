# Supabase Migration 规范

本文档定义本仓库数据库结构变更的统一流程。目标是让变更可复现、可审计、可协作。

## 目录约定

- 迁移文件目录：`supabase/migrations/`
- 文件命名：`<timestamp>_<snake_case_name>.sql`
  - 示例：`202604240001_create_admin_whitelist.sql`
- 当前首个迁移：`supabase/migrations/202604240001_create_admin_whitelist.sql`

## 标准流程

1. 新建 migration 文件
2. 在 migration 中编写 DDL
3. 本地执行迁移并验证
4. 更新文档（如 `docs/supabase-tables.md`）
5. 合并后由目标环境执行同一批 migration

## 常用命令

在仓库根目录执行：

```bash
pnpm db:migration:new -- <migration_name>
pnpm db:migration:list
pnpm db:migrate
```

说明：

- `db:migration:new` 会生成带时间戳的 migration 文件。
- `db:migrate` 使用 Supabase CLI 推送本地 migration 到已 link 的项目。

## 协作规则

- 所有 DDL（建表、改表、索引、约束、RLS）必须先进入 migration 文件。
- 不再把 `docs/sql/*.sql` 作为主执行入口；该目录仅保留历史参考或示例。
- 禁止直接在生产库手工执行“未入库的 DDL”。

## 回滚与修复建议

- 优先使用“前滚修复”（新增 migration 修复问题），避免直接改历史 migration。
- 若出现环境漂移，先 `pnpm db:migration:list` 对齐状态，再补修复 migration。

## 常见问题

- `project_id` 未配置：请先在 `supabase/config.toml` 填写项目 ref，或执行 `supabase link`。
- CLI 未安装：先按 Supabase 官方文档安装 CLI。
- 迁移执行失败：检查 SQL 是否幂等、是否与现网结构冲突，然后通过新 migration 修复。
