export type IProxyData = {
  nickname: string;
  hostname: string;
  port: number;
};

export type IProxyGroupData = {
  id: string;
  name: string;
  proxyHosts: (string | IProxyData)[];
  createdAt: string;
  updatedAt: string;
};
