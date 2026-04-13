/** 一键安装块根节点 className（供服务端/客户端共用，避免 loading 与实装不一致） */
export function installCommandRootClasses(extra?: string): string {
  return extra?.trim()
    ? `w-full text-left ${extra.trim()}`
    : "mt-12 w-full max-w-xl text-left";
}
