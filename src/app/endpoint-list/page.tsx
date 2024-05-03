import EndpointListComponent from "@/components/page-components/proxy-list";
import dynamic from "next/dynamic";

function EndpointListPage() {
  return <EndpointListComponent />;
}

export default dynamic(() => Promise.resolve(EndpointListPage), {
  ssr: false,
});
