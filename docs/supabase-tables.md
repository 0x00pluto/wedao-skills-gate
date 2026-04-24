# Supabase 表结构（Huyuan-AI 权限）

`public` 下技能授权相关表；已开 **RLS**，未配 policy 时 anon 不可访问，服务端 `service_role` 可读写。

---

## `companies`

企业主体；CLI 用 `enterprise_key` 识别租户。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` | 主键，默认 `gen_random_uuid()` |
| `name` | `text` | 企业名称 |
| `enterprise_key` | `text` | 唯一；与 CLI 登录用的 key 对应 |
| `expiry_at` | `timestamptz` | 授权到期时间 |

---

## `skills`

技能目录（与 `skills.index.yaml` 中条目对应，当前库表为子集字段）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `text` | 主键，如 `huyuan-ai-skill-installer` |
| `name` | `text` | 展示名 |
| `version` | `text` | 版本号 |
| `description` | `text` | 描述 |
| `tags` | `text[]` | 标签，默认 `{}` |
| `updated_at` | `date` | 索引中的更新日期 |

---

## `company_skills`

企业 ↔ 技能授权（多对多）；一行表示某企业可使用某技能。

| 字段 | 类型 | 说明 |
|------|------|------|
| `company_id` | `uuid` | 外键 → `companies.id`；企业删除时级联删除 |
| `skill_id` | `text` | 外键 → `skills.id`；有引用时不允许删技能 |

**主键**：`(company_id, skill_id)`。

---

## `admin_whitelist`

管理后台最小访问控制白名单；仅在此表中且 `status='active'` 的邮箱允许进入 `/admin`。

| 字段 | 类型 | 说明 |
|------|------|------|
| `email` | `text` | 主键；管理员邮箱（建议统一小写） |
| `status` | `text` | 状态，默认 `active`（可选 `disabled`） |
| `created_at` | `timestamptz` | 创建时间，默认 `now()` |
