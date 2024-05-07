import { create } from "zustand";

export type EndpointData = {
  nickname: string;
  hostname: string;
  port: number;
};

interface ProxyListStore {
  proxyList: EndpointData[];
  setProxyList: (proxyList: EndpointData[]) => void;
}

const proxyListStore = create<ProxyListStore>((set) => ({
  proxyList: [],
  setProxyList: (proxyList: EndpointData[]) => set({ proxyList }),
}));

export default proxyListStore;
