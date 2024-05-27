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
  load(): void;
  setProxyList: (proxyList: IProxyData[]) => void;
  addProxyItem: (data: IProxyData, group: IProxyGroupData) => void;
  addGroup: (groupName: string) => void;
  removeGroup: (groupId: string) => Promise<string | void>;
  // setProxyGroupList: (data: IProxyGroupData[]) => void;
  setSelectedGroup: (group: IProxyGroupData) => void;
}

const proxyListStore = create<ProxyListStore>((set, get) => ({
  proxyList: [],
  groupList: [],
  selectedGroup: null,
  load: async () => {
    const mgr = ProxyManager.sharedManager();
    const list = await mgr.getProxies();
    const gList = await mgr.getGroups();
    set({
      groupList: gList,
    });
    // if selectedGroup == null then set default group
    let selectedGroup = get().selectedGroup;
    if (!selectedGroup) {
      selectedGroup =
        gList.find((el) => el.id === DEFAULT_PROXY_GROUP_ID) ?? null;
      set({ selectedGroup });
    }
    // filter list from selectedGroup
    const filteredList = list.filter((el) =>
      selectedGroup?.proxyHosts.find((e) => e === el.hostname)
    );
    set({ proxyList: filteredList });
  },
  setProxyList: (proxyList: IProxyData[]) => set({ proxyList }),
  addGroup: async (groupName: string) => {
    const newGroupData: IProxyGroupData = {
      id: Math.random().toString(36).substring(7),
      name: groupName,
      proxyHosts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mgr = ProxyManager.sharedManager();
    const _groupList = await mgr.getGroups();
    _groupList.push(newGroupData);
    mgr.saveGroups(_groupList);
  },
  removeGroup: async (groupId: string) => {
    // if group is already selected, stop removing
    if (get().selectedGroup?.id === groupId) {
      return "Cannot remove selected group.";
    }
    const mgr = ProxyManager.sharedManager();
    const _groupList = await mgr.getGroups();
    const groupIndex = _groupList.findIndex((el) => el.id === groupId);
    _groupList.splice(groupIndex, 1);
    // remove from proxyList
    mgr.saveGroups(_groupList);
    set({ groupList: _groupList, proxyList: [] });
  },
  addProxyItem: async (data: IProxyData) => {
    const mgr = ProxyManager.sharedManager();
    const _proxyList = await mgr.getProxies();
    const _groupList = await mgr.getGroups();
    if (_proxyList.find((e: IProxyData) => e.hostname === data.hostname)) {
      // already exists
      return;
    }
    _proxyList.push(data);
    mgr.saveProxies(_proxyList);
    const selectedGroup = get().selectedGroup;
    if (selectedGroup) {
      selectedGroup.proxyHosts.push(data);
      // update groupsList
      const groupIndex = _groupList.findIndex(
        (el) => el.id === selectedGroup.id
      );
      _groupList[groupIndex] = selectedGroup;
      mgr.saveGroups(_groupList);
    }
    set({ proxyList: _proxyList });
  },
  // setProxyGroupList: async (data: IProxyGroupData[]) => {
  //   const mgr = ProxyManager.sharedManager();
  //   const g = await mgr.getGroups();
  //   set({
  //     groupList: g,
  //     selectedGroup:
  //       g.length > 0 ? g.find((el) => el.id === DEFAULT_PROXY_GROUP_ID) : null,
  //   });
  // },
  setSelectedGroup: (group: IProxyGroupData) => set({ selectedGroup: group }),
}));

export default proxyListStore;
