import { onRequestPost as handleRsvp } from "./functions/api/rsvp.js";
import { onRequestPost as handleSubscribe } from "./functions/api/subscribe.js";

function methodNotAllowed() {
  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/rsvp") {
      return request.method === "POST"
        ? handleRsvp({ request, env })
        : methodNotAllowed();
    }

    if (pathname === "/api/subscribe") {
      return request.method === "POST"
        ? handleSubscribe({ request, env })
        : methodNotAllowed();
    }

    return env.ASSETS.fetch(request);
  },
};
