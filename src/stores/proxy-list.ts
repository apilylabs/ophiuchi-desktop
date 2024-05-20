import { ProxyManager } from "@/helpers/proxy-manager";
import { create } from "zustand";

export type EndpointData = {
  nickname: string;
  hostname: string;
  port: number;
};

interface ProxyListStore {
  proxyList: EndpointData[];
  setProxyList: (proxyList: EndpointData[]) => void;
  addProxyItem: (data: EndpointData) => void;
}

const proxyListStore = create<ProxyListStore>((set, get) => ({
  proxyList: [],
  setProxyList: (proxyList: EndpointData[]) => set({ proxyList }),
  addProxyItem: async (data: EndpointData) => {
    const mgr = ProxyManager.sharedManager();
    const _proxyList = await mgr.get();
    if (_proxyList.find((e: EndpointData) => e.hostname === data.hostname)) {
      // already exists
      return;
    }
    _proxyList.push(data);
    mgr.save(_proxyList);
    set({ proxyList: _proxyList });
  },
}));

export default proxyListStore;
