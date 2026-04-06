# 面向自动化助手（Agent）的仓库说明

本文档供 AI 编码助手与自动化流程阅读；与 [README.md](README.md) 互补，侧重协作约定与本仓库特有配置。

## 项目简介

- **名称**：`huyuan-ai-skills-gate`（互远 AI 技能中心入口）
- **栈**：Next.js 16、React 19、TypeScript、[App Router](https://nextjs.org/docs/app)（源码主要在 `app/`）
- **服务端 API**：`GET /api/token?key=...&skillId=...` 经 Supabase 校验企业与技能授权后签发 GitHub Installation 访问令牌；实现见 [`app/api/token/route.ts`](app/api/token/route.ts)，Octokit 封装见 [`lib/github-app.ts`](lib/github-app.ts)，Supabase 客户端见 [`lib/supabase-server.ts`](lib/supabase-server.ts)。详情与 curl 示例见 [README.md](README.md)。
- **后端（数据与服务）**：[Supabase](https://supabase.com/) — 数据库、Auth、Edge Functions 等以 Supabase 为准；实现与迁移代码按项目内既有结构维护。

## Supabase 与助手开发

- **MCP**：本仓库在 [`.cursor/mcp.json`](.cursor/mcp.json) 中可配置 Supabase 官方 MCP（远程 `https://mcp.supabase.com/mcp?...`），便于在 Cursor 内让助手结合项目上下文操作/查询 Supabase。具体 `project_ref` 与是否启用以该文件为准；勿在文档或示例中粘贴生产环境密钥或服务角色密钥。

## 包管理与命令

- **包管理器**：统一使用 **pnpm**（见 `package.json` 的 `packageManager` 字段）。
- **常用命令**：
  - `pnpm install` — 安装依赖
  - `pnpm dev` — 本地开发
  - `pnpm build` / `pnpm start` — 构建与生产启动
  - `pnpm lint` — ESLint
- **依赖变更**：若任务需要新增或移除 npm 包，请在说明或 PR 中给出对应 `pnpm add` / `pnpm remove` 命令，由维护者在本地执行；避免在无人确认的情况下擅自改写 `package.json` 依赖字段或 lockfile。

## 环境变量

- 本地：复制 `.env.example` 为 `.env.local`，再填入真实值（Next.js 会加载 `.env.local`）。
- **GitHub App 相关**（名称与 `.env.example` 一致）：
  - `GITHUB_APP_ID` — GitHub App 的 App ID
  - `GITHUB_INSTALLATION_ID` — 安装到组织/仓库后的 Installation ID
  - `GITHUB_PRIVATE_KEY` — App 私钥；可为 PEM 多行，或带 `\n` 的单行；部署环境（如 Vercel）支持多行配置，详见 `.env.example` 注释
- **Supabase**（名称与 `.env.example` 一致；Token API 与同步接口依赖 service_role）：
  - `NEXT_PUBLIC_SUPABASE_URL` — 项目 URL（`*.supabase.co`）
  - `SUPABASE_ANON_KEY` — 匿名/公开密钥（与 Dashboard anon 一致；受 RLS 约束；若仅在服务端使用可不使用 `NEXT_PUBLIC_` 前缀）
  - `SUPABASE_SERVICE_ROLE_KEY` — 服务端密钥，**不得**加 `NEXT_PUBLIC_`，勿暴露给前端；Token API 用其校验 `companies` / `company_skills` 与 `expiry_at`
  - `SUPABASE_JWT_SECRET` — 可选，仅当自行校验 JWT 或工具要求时再配置
  - Vercel 同步的 `POSTGRES_*`、`SUPABASE_URL` 等与直连数据库或平台集成相关；未在代码中使用 Prisma 等直连时，通常不必在应用里重复配置（以实际代码引用为准）。
- 勿将含密钥的 `.env.local` 提交到 Git。

## pnpm 与依赖构建脚本

- 仓库根目录 [`pnpm-workspace.yaml`](pnpm-workspace.yaml) 中配置了 `onlyBuiltDependencies`（含 `sharp`、`unrs-resolver`），用于在 pnpm v10 默认策略下允许这些包执行安装脚本（例如 `sharp` 拉取平台二进制）。
- 若安装时仍提示 *Ignored build scripts*，可在项目根目录执行 `pnpm approve-builds` 交互选择，或按需向 `onlyBuiltDependencies` 追加包名。

## 代码与风格

- **Lint**：ESLint 9 + `eslint-config-next`（配置见 `eslint.config.mjs`）。
- **样式**：Tailwind CSS v4（如 `postcss.config.mjs`、`app/globals.css`）。
- **改动原则**：只改与当前任务相关的文件；避免无关重构；命名与格式与周边代码保持一致。

## 安全与隐私

- 不要读取、复述或粘贴用户 `.env.local` 中的真实密钥。
- 文档与示例中仅使用占位符，不出现真实 App ID、Installation ID、私钥、企业 `enterprise_key`、Supabase `service_role` / anon 密钥等内容。
