import { SetupComponent } from "@/components/page-components/setup";
import dynamic from "next/dynamic";

function Home() {
  return (
    <div className="min-h-screen">
      <SetupComponent />
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
