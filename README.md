# 互远 AI 技能中心 · Huyuan AI Skills Gate

基于 [Next.js](https://nextjs.org)（App Router）的 Web 入口：展示互远 AI 技能中心欢迎页，并提供纯服务端的 **GitHub App Installation 访问令牌**签发接口，供受控系统集成使用。

更细的协作约定与自动化说明见 [AGENTS.md](AGENTS.md)。

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS v4
- GitHub 集成：[@octokit/app](https://github.com/octokit/app.js)

## 本地开发

本仓库使用 [pnpm](https://pnpm.io)（见 `packageManager` 字段）。若尚未安装：`corepack enable`（推荐）或参考 pnpm 官方文档。

```bash
pnpm install
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 查看首页。

```bash
pnpm build   # 生产构建
pnpm start   # 生产启动
pnpm lint    # ESLint
```

## 环境变量

1. 复制 `.env.example` 为 `.env.local`，按注释填入真实值（**勿将 `.env.local` 提交到 Git**）。
2. 部署到 Vercel 等平台时，在控制台配置同名环境变量。

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SKILLS_GATE_ORIGIN` | （可选）首页一键安装命令里展示的站点根地址，如 `https://skills.example.com`，无末尾斜杠。未配置时首页使用浏览器当前访问的 origin。 |
| `GITHUB_APP_ID` | GitHub App 的 App ID |
| `GITHUB_INSTALLATION_ID` | App 安装后的 Installation ID |
| `GITHUB_PRIVATE_KEY` | App 私钥（PEM；可为多行或带 `\n` 的单行） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（`*.supabase.co`） |
| `SUPABASE_ANON_KEY` | Supabase anon 公钥（受 RLS 约束；与 Dashboard「anon public」一致） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role（**仅服务端**；Token API 校验企业与技能授权、同步接口写入 `skills` 等） |
| `ADMIN_SYNC_API_KEY` | 调用下方「同步技能目录」接口时，请求头 `x-api-key` 须与此一致 |
| `SKILLS_HUB_OWNER` | （可选）索引 YAML 所在仓库 owner，默认 `WeDAOLabs` |
| `SKILLS_HUB_REPO` | （可选）索引 YAML 所在仓库名，默认 `skills-hub` |
| `SKILLS_HUB_INDEX_PATH` | （可选）仓库内文件路径，默认 `skills.index.yaml` |

## 数据库迁移（Supabase CLI）

本仓库采用 `supabase/migrations/` 管理数据库结构变更（DDL）。

```bash
pnpm db:migration:new -- create_xxx
pnpm db:migration:list
pnpm db:migrate
```

- migration 文件目录：`supabase/migrations/`
- migration 命名格式：`<timestamp>_<snake_case>.sql`
- 已纳管示例：`admin_whitelist`（见 `supabase/migrations/202604240001_create_admin_whitelist.sql`）

详细协作规范见 [docs/supabase-migrations.md](docs/supabase-migrations.md)。

## 一键安装脚本

本仓库在 [`public/install.sh`](public/install.sh) 提供 Bash 安装脚本，部署后与站点**同源**访问：`GET /install.sh`（例如 `https://你的域名/install.sh`）。无需在其他仓库或域名托管该文件。

用户在本机执行：

```bash
curl -fsSL "https://你的域名/install.sh" | bash
```

脚本会按需全局安装 `@huyuan-ai/cli`、引导 `huyuan-ai-cli` 登录，并默认安装技能 `huyuan-ai-skill-installer`。可选环境变量（如 `HUYUAN_AI_LOGIN_KEY`、`HUYUAN_SKILL_IDS`）见脚本内注释。

**说明**：这与下面的 **GitHub Installation Token API** 不同；Token API 面向受控系统签发 GitHub 安装令牌，CLI 登录使用企业授权码，由 `huyuan-ai-cli login` 管理。

## HTTP API

### 获取 Installation Token

`GET /api/token?key=<enterprise_key>&skillId=<技能ID>`

- `key`：与 Supabase `companies.enterprise_key` 一致的企业授权码。
- `skillId`：目标技能 ID（须在该企业的 `company_skills` 授权范围内）。

成功时返回 JSON：`{ "token": "<installation_access_token>" }`（与此前成功形态一致）。

| 状态码 | 含义 |
|--------|------|
| `200` | 校验通过，返回 installation token |
| `400` | 未提供 `skillId`（响应体含提示文案） |
| `403` | 企业 key 无效、已过期，或无权访问该技能 |
| `500` | 服务端错误（如未配置 Supabase/GitHub 环境变量） |

- 仅服务端逻辑；请在 **HTTPS** 环境下调用，并妥善保管 `key` 与返回的 `token`。
- 查询参数传参便于对接；生产环境可再改为请求头等方式并配合审计与限流。

**本地 curl 示例：**

```bash
curl -sS -G "http://localhost:3000/api/token" \
  --data-urlencode "key=你的企业Key" \
  --data-urlencode "skillId=huyuan-ai-skill-installer"
```

### 同步技能目录（管理员）

`POST /api/admin/sync`

使用服务端已配置的 GitHub App 安装令牌读取私有仓库中的 `skills.index.yaml`，解析后 **upsert** 到 Supabase `skills` 表。须携带请求头 `x-api-key`，值与环境变量 `ADMIN_SYNC_API_KEY` 一致。

成功时返回 JSON，例如：`{ "ok": true, "synced": <数量>, "source": { "owner", "repo", "path" } }`。

| 状态码 | 含义 |
|--------|------|
| `200` | 同步成功 |
| `401` | 未授权（`x-api-key` 缺失或不匹配） |
| `500` | 服务端错误（如未配置密钥、GitHub/Supabase 失败） |

**本地 curl 示例：**

```bash
curl -sS -X POST "http://localhost:3000/api/admin/sync" \
  -H "x-api-key: 你的同步接口密钥"
```

私有仓库 YAML 更新后由 GitHub Actions 自动触发 Vercel 接口的步骤，见 [docs/skills-sync-action.md](docs/skills-sync-action.md)。

## 部署

推荐使用 [Vercel](https://vercel.com) 部署 Next.js 应用，并在项目中配置上述环境变量。详见 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 了解更多

- [Next.js 文档](https://nextjs.org/docs)
- [Next.js 学习教程](https://nextjs.org/learn)
