import { ProxyManager } from "@/helpers/proxy-manager";
import { DEFAULT_PROXY_GROUP_ID } from "@/helpers/proxy-manager/constants";
import {
  IProxyData,
  IProxyGroupData,
} from "@/helpers/proxy-manager/interfaces";
import { create } from "zustand";

interface ProxyListStore {
  proxyList: IProxyData[];
  groupList: IProxyGroupData[];
  selectedGroup: IProxyGroupData | null;
  setProxyList: (proxyList: IProxyData[]) => void;
  addProxyItem: (data: IProxyData) => void;
  setProxyGroupList: (data: IProxyGroupData[]) => void;
  setSelectedGroup: (group: IProxyGroupData) => void;
}

const proxyListStore = create<ProxyListStore>((set, get) => ({
  proxyList: [],
  groupList: [],
  selectedGroup: null,
  setProxyList: (proxyList: IProxyData[]) => set({ proxyList }),
  addProxyItem: async (data: IProxyData) => {
    const mgr = ProxyManager.sharedManager();
    const _proxyList = await mgr.getProxies();
    if (_proxyList.find((e: IProxyData) => e.hostname === data.hostname)) {
      // already exists
      return;
    }
    _proxyList.push(data);
    mgr.saveProxies(_proxyList);
    set({ proxyList: _proxyList });
  },
  setProxyGroupList: async (data: IProxyGroupData[]) => {
    const mgr = ProxyManager.sharedManager();
    const g = await mgr.getGroups();
    set({
      groupList: g,
      selectedGroup:
        g.length > 0 ? g.find((el) => el.id === DEFAULT_PROXY_GROUP_ID) : null,
    });
  },
  setSelectedGroup: (group: IProxyGroupData) => set({ selectedGroup: group }),
}));

export default proxyListStore;
