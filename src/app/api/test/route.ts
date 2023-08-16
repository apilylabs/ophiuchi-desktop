export async function GET(req: Request) {
  return new Response(JSON.stringify({ message: "Hello world" }), {
    status: 200,
  });
}
