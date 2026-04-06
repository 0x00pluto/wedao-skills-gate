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
| `VALID_COMPANY_KEY` | 调用下方 Token API 时，查询参数 `key` 须与此一致 |
| `GITHUB_APP_ID` | GitHub App 的 App ID |
| `GITHUB_INSTALLATION_ID` | App 安装后的 Installation ID |
| `GITHUB_PRIVATE_KEY` | App 私钥（PEM；可为多行或带 `\n` 的单行） |

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

`GET /api/token?key=<VALID_COMPANY_KEY>`

成功时返回 JSON：`{ "token": "<installation_access_token>" }`。

- 仅服务端逻辑；请在 **HTTPS** 环境下调用，并妥善保管 `key` 与返回的 `token`。
- MVP 使用查询参数传 `key`，生产环境建议后续改为请求头等方式并配合审计与限流。

**本地 curl 示例：**

```bash
curl -sS -G "http://localhost:3000/api/token" --data-urlencode "key=你的企业Key"
```

## 部署

推荐使用 [Vercel](https://vercel.com) 部署 Next.js 应用，并在项目中配置上述环境变量。详见 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 了解更多

- [Next.js 文档](https://nextjs.org/docs)
- [Next.js 学习教程](https://nextjs.org/learn)
