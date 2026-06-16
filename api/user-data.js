function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return sendJson(response, 500, { error: "Supabase environment variables are not configured." });
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !String(authHeader).startsWith("Bearer ")) {
    return sendJson(response, 401, { error: "Authorization header with Bearer token is required." });
  }

  const headers = {
    apikey: anonKey,
    authorization: authHeader,
    "content-type": "application/json"
  };

  if (request.method === "GET") {
    try {
      const upstream = await fetch(`${supabaseUrl}/auth/v1/user`, { headers });
      const text = await upstream.text();
      response.statusCode = upstream.status;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(text);
    } catch (error) {
      sendJson(response, 502, { error: error.message || "Failed to fetch user data." });
    }
    return;
  }

  if (request.method === "PATCH") {
    const body = typeof request.body === "string"
      ? JSON.parse(request.body || "{}")
      : request.body || {};

    const userMetadata = body.user_metadata;
    if (!userMetadata || typeof userMetadata !== "object") {
      return sendJson(response, 400, { error: "user_metadata is required." });
    }

    try {
      const upstream = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ data: userMetadata })
      });
      const text = await upstream.text();
      response.statusCode = upstream.status;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(text);
    } catch (error) {
      sendJson(response, 502, { error: error.message || "Failed to update user data." });
    }
    return;
  }

  response.setHeader("Allow", "GET, PATCH");
  sendJson(response, 405, { error: "Method not allowed" });
}
