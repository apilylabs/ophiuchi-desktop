export type IProxyData = {
  nickname: string;
  hostname: string;
  port: number;
  createdAt: string;
};

export type IProxyGroupData = {
  id: string;
  name: string;
  isNoGroup: boolean;
  includedHosts: (string | IProxyData)[];
  createdAt: string;
  updatedAt: string;
};
