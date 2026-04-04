import { App } from "@octokit/app";

export function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n");
}

type GithubConfig = {
  appId: number;
  installationId: number;
  privateKey: string;
};

let cachedConfig: GithubConfig | null = null;
let appSingleton: App | null = null;

function readGithubEnv(): GithubConfig {
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_INSTALLATION_ID;
  const privateKeyRaw = process.env.GITHUB_PRIVATE_KEY;

  if (!appId || !installationId || !privateKeyRaw) {
    throw new Error(
      "Missing GITHUB_APP_ID, GITHUB_INSTALLATION_ID, or GITHUB_PRIVATE_KEY",
    );
  }

  const parsedAppId = Number(appId);
  const parsedInstallationId = Number(installationId);

  if (!Number.isFinite(parsedAppId) || !Number.isFinite(parsedInstallationId)) {
    throw new Error(
      "GITHUB_APP_ID and GITHUB_INSTALLATION_ID must be numeric strings",
    );
  }

  return {
    appId: parsedAppId,
    installationId: parsedInstallationId,
    privateKey: normalizePrivateKey(privateKeyRaw),
  };
}

function getGithubConfig(): GithubConfig {
  if (!cachedConfig) {
    cachedConfig = readGithubEnv();
  }
  return cachedConfig;
}

export function getGithubApp(): App {
  if (!appSingleton) {
    const { appId, privateKey } = getGithubConfig();
    appSingleton = new App({ appId, privateKey });
  }
  return appSingleton;
}

/**
 * 获取当前配置的 GitHub App Installation 访问令牌（字符串）。
 * 仅用于服务端；勿记录或下发到不可信环境。
 */
export async function getInstallationTokenString(): Promise<string> {
  const { installationId } = getGithubConfig();
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const authResult = await octokit.auth({
    type: "installation",
    installationId,
  });

  if (
    !authResult ||
    typeof authResult !== "object" ||
    !("token" in authResult) ||
    typeof (authResult as { token: unknown }).token !== "string"
  ) {
    throw new Error("Could not obtain installation access token");
  }

  return (authResult as { token: string }).token;
}
