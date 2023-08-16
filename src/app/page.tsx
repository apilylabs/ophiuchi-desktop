export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-100 bg-blue-950">
        <div className="flex flex-col gap-8 w-full max-w-sm">
          <div className="">
            <h1 className="text-2xl tracking-tight font-semibold">
              Local HTTPS Proxy Server
            </h1>
          </div>
          <div className="flex flex-col">
            <label>HOSTNAME</label>
            <input
              type="text"
              className="p-2 bg-transparent border-b border-b-blue-600 caret-blue-600"
              placeholder="hostname (ex:local.domain.com)"
            />
          </div>
          <div className="flex flex-col">
            <label>PORT</label>
            <input
              type="text"
              className="p-2 bg-transparent border-b border-b-blue-600 caret-blue-600"
              placeholder="proxy port number (ex:3000)"
            />
          </div>
          <div className="">
            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg">
              Start Docker Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
