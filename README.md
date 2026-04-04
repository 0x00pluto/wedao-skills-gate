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
| `VALID_COMPANY_KEY` | 调用下方 Token API 时，查询参数 `key` 须与此一致 |
| `GITHUB_APP_ID` | GitHub App 的 App ID |
| `GITHUB_INSTALLATION_ID` | App 安装后的 Installation ID |
| `GITHUB_PRIVATE_KEY` | App 私钥（PEM；可为多行或带 `\n` 的单行） |

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
