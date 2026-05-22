/**
 * Proxies /api/* from the Vercel frontend to the Render backend (same-origin, no CORS).
 * Set API_PROXY_TARGET on Vercel to your Render URL, e.g. https://your-service.onrender.com
 */
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

function getBackendBase() {
  const raw = process.env.API_PROXY_TARGET || process.env.VITE_API_BASE_URL || "";
  return raw.replace(/\/$/, "");
}

function getIncomingApiPath(req) {
  const segments = req.query?.path;
  if (segments) {
    const joined = Array.isArray(segments) ? segments.join("/") : String(segments);
    return `/api/${joined}`;
  }

  const url = req.url || "";
  const pathOnly = url.split("?")[0];
  if (pathOnly.startsWith("/api")) return pathOnly;
  return "/api";
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const backend = getBackendBase();
  if (!backend) {
    res.status(503).json({
      message:
        "API proxy not configured. Set API_PROXY_TARGET on Vercel to your Render backend URL.",
    });
    return;
  }

  const pathname = getIncomingApiPath(req);
  const url = req.url || "";
  const qIndex = url.indexOf("?");
  const search = qIndex === -1 ? "" : url.slice(qIndex);
  const target = `${backend}${pathname}${search}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readBody(req);
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    res.status(upstream.status);
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error("API proxy error", target, error);
    res.status(502).json({
      message: "Could not reach backend API. Check API_PROXY_TARGET and Render service status.",
    });
  }
}
