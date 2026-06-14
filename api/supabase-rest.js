const allowedTables = new Set([
  "learning_items",
  "srs_data",
  "learning_sessions",
  "study_logs"
]);

const allowedMethods = new Set(["GET", "POST", "PATCH", "DELETE"]);

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return sendJson(response, 500, { error: "Supabase environment variables are not configured." });
  }

  const payload = typeof request.body === "string"
    ? JSON.parse(request.body || "{}")
    : request.body || {};
  const { accessToken = "", method = "GET", table = "", query = "", body = null, prefer = "" } = payload;
  const normalizedMethod = String(method || "GET").toUpperCase();

  if (!allowedMethods.has(normalizedMethod) || !allowedTables.has(table)) {
    return sendJson(response, 400, { error: "Invalid Supabase proxy request." });
  }

  const authHeader = accessToken
    ? `Bearer ${accessToken}`
    : request.headers.authorization;
  if (!authHeader || !String(authHeader).startsWith("Bearer ")) {
    return sendJson(response, 401, { error: "Supabase access token is required." });
  }

  const targetUrl = new URL(`/rest/v1/${table}`, supabaseUrl);
  if (query) {
    targetUrl.search = query;
  }

  const headers = {
    apikey: anonKey,
    authorization: authHeader,
    "content-type": "application/json",
    accept: "application/json"
  };

  if (prefer) {
    headers.prefer = prefer;
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: normalizedMethod,
      headers,
      body: ["POST", "PATCH"].includes(normalizedMethod) ? JSON.stringify(body) : undefined
    });
    const text = await upstream.text();
    response.statusCode = upstream.status;
    response.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    response.end(text);
  } catch (error) {
    sendJson(response, 502, { error: error.message || "Supabase proxy request failed." });
  }
}
