import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    await request.arrayBuffer();
    return new Response();
}
