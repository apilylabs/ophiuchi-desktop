import ProxyListComponent from "@/components/page-components/proxy-list";
import dynamic from "next/dynamic";

function EndpointListPage() {
  return <ProxyListComponent />;
}

export default dynamic(() => Promise.resolve(EndpointListPage), {
  ssr: false,
});
