# skills-hub 仓库：YAML 更新后触发技能目录同步

在私有仓库 `WeDAOLabs/skills-hub` 中，当 `skills.index.yaml` 变更时，通过 GitHub Actions 调用部署在 Vercel 上的 **Huyuan AI Skills Gate** 接口 `POST /api/admin/sync`，将索引写入 Supabase `skills` 表。

## Vercel（本应用）环境变量

在 Vercel 项目控制台配置（与 [README.md](../README.md)、`.env.example` 一致）：

- `ADMIN_SYNC_API_KEY`：与 Action 里使用的密钥一致（请求头 `x-api-key`）。
- `GITHUB_APP_ID`、`GITHUB_INSTALLATION_ID`、`GITHUB_PRIVATE_KEY`：GitHub App 须已安装到可访问 `skills-hub` 的范围。
- `NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`：用于 upsert `skills`。
- 可选：`SKILLS_HUB_OWNER`、`SKILLS_HUB_REPO`、`SKILLS_HUB_INDEX_PATH`（默认分别为 `WeDAOLabs`、`skills-hub`、`skills.index.yaml`）。

## skills-hub 仓库 Secrets

在 **WeDAOLabs/skills-hub** 仓库：**Settings → Secrets and variables → Actions** 中新增：

| Name | 说明 |
|------|------|
| `SYNC_ENDPOINT` | 完整 URL，例如 `https://你的部署域名/api/admin/sync`（无末尾斜杠以外的多余路径） |
| `SYNC_API_KEY` | 与 Vercel 上 `ADMIN_SYNC_API_KEY` **相同** |

## Workflow 文件

在 `skills-hub` 仓库新建 `.github/workflows/sync-skills-gate.yml`（文件名可自定），内容示例：

```yaml
name: Sync skills index to gate

on:
  push:
    branches:
      - main
    paths:
      - "skills.index.yaml"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel sync API
        env:
          SYNC_ENDPOINT: ${{ secrets.SYNC_ENDPOINT }}
          SYNC_API_KEY: ${{ secrets.SYNC_API_KEY }}
        run: |
          set -euo pipefail
          test -n "${SYNC_ENDPOINT}"
          test -n "${SYNC_API_KEY}"
          curl -sS -f -X POST "$SYNC_ENDPOINT" \
            -H "x-api-key: ${SYNC_API_KEY}" \
            -H "Accept: application/json"
```

说明：

- `paths` 仅在推送涉及 `skills.index.yaml` 时触发；若默认分支不是 `main`，请改为实际分支名。
- `workflow_dispatch` 支持在 Actions 界面手动运行，便于排查。
- 成功时接口返回 HTTP 200 与 JSON（含 `ok`、`synced` 等）；若返回 401/500，检查 Secrets 与 Vercel 环境变量是否一致、GitHub App 是否已安装到该私有仓库。
