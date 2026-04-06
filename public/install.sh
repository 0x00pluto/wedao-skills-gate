#!/usr/bin/env bash
# 互远 AI 技能中心 · 同源一键安装（由本站 /install.sh 提供）
#
# 用法：curl -fsSL "https://<你的技能中心域名>/install.sh" | bash
#
# 环境变量（可选）：
#   HUYUAN_AI_LOGIN_KEY  企业授权码，非交互登录（勿写入 shell 历史；勿提交到仓库）
#   HUYUAN_AI_KEY        同上别名
#   HUYUAN_SKILL_IDS     逗号分隔的技能 id，默认：huyuan-ai-skill-installer
#
# 注意：通过管道执行时标准输入被脚本占用，授权码交互需从终端读取；若需输入，
# 脚本会从 /dev/tty 读取（请勿在无法访问 TTY 的环境使用交互模式）。

set -euo pipefail

DEFAULT_SKILL_IDS="huyuan-ai-skill-installer"
CLI_PKG="@huyuan-ai/cli@latest"

usage() {
  cat <<'EOF'
Usage:
  curl -fsSL "<本站>/install.sh" | bash

Optional env:
  HUYUAN_AI_LOGIN_KEY   enterprise key (non-interactive)
  HUYUAN_AI_KEY         alias of HUYUAN_AI_LOGIN_KEY
  HUYUAN_SKILL_IDS      comma-separated skill ids (default: huyuan-ai-skill-installer)

Prerequisites when CLI is missing:
  Node.js and npm (https://nodejs.org/)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: missing required command: $1" >&2
    exit 2
  }
}

ensure_cli() {
  if command -v huyuan-ai-cli >/dev/null 2>&1; then
    echo "Found huyuan-ai-cli, skipping global install."
    return 0
  fi
  echo "huyuan-ai-cli not found; installing ${CLI_PKG} ..."
  require_cmd npm
  npm install -g "$CLI_PKG"
}

login_cli() {
  local key="${HUYUAN_AI_LOGIN_KEY:-${HUYUAN_AI_KEY:-}}"

  if [[ -n "$key" ]]; then
    huyuan-ai-cli login "$key"
    return 0
  fi

  if huyuan-ai-cli huyuan-skill list >/dev/null 2>&1; then
    echo "Skipping login: huyuan-skill list succeeded (already authenticated)."
    return 0
  fi

  if [[ ! -r /dev/tty ]] || [[ ! -w /dev/tty ]]; then
    echo "ERROR: interactive login requires a TTY. Set HUYUAN_AI_LOGIN_KEY or run:" >&2
    echo "  huyuan-ai-cli login <your-key>" >&2
    exit 2
  fi
  echo "Enter enterprise login key (input hidden):" >&2
  IFS= read -r -s key </dev/tty || true
  echo >&2
  if [[ -z "$key" ]]; then
    echo "ERROR: empty key." >&2
    exit 2
  fi
  huyuan-ai-cli login "$key"
}

install_skills() {
  local raw="${HUYUAN_SKILL_IDS:-$DEFAULT_SKILL_IDS}"
  local IFS=,
  read -ra ids <<<"$raw" || true

  local id
  for id in "${ids[@]}"; do
    id="${id#"${id%%[![:space:]]*}"}"
    id="${id%"${id##*[![:space:]]}"}"
    [[ -z "$id" ]] && continue
    echo "Installing skill: $id"
    huyuan-ai-cli huyuan-skill install "$id"
  done
}

ensure_cli
login_cli
install_skills

echo "Done."
