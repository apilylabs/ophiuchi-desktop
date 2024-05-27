import { ProxyManager } from "..";

export async function m002_addProxyCreatedAt(mgrInstance: ProxyManager) {
  const _proxyList = await mgrInstance.getProxies();
  _proxyList.map((proxy) => {
    if (!proxy.createdAt) {
      proxy.createdAt = new Date().toISOString();
    }
  });
}
