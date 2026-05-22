/**
 * Proxies /uploads/* to the Render backend for gallery media.
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

function getIncomingUploadsPath(req) {
  const segments = req.query?.path;
  if (segments) {
    const joined = Array.isArray(segments) ? segments.join("/") : String(segments);
    return `/uploads/${joined}`;
  }

  const url = req.url || "";
  const pathOnly = url.split("?")[0];
  if (pathOnly.startsWith("/uploads")) return pathOnly;
  return "/uploads";
}

export default async function handler(req, res) {
  const backend = getBackendBase();
  if (!backend) {
    res.status(503).json({ message: "API_PROXY_TARGET is not configured on Vercel." });
    return;
  }

  const pathname = getIncomingUploadsPath(req);
  const url = req.url || "";
  const qIndex = url.indexOf("?");
  const search = qIndex === -1 ? "" : url.slice(qIndex);
  const target = `${backend}${pathname}${search}`;

  try {
    const upstream = await fetch(target, { method: req.method });
    res.status(upstream.status);
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error("Uploads proxy error", target, error);
    res.status(502).json({ message: "Could not reach backend for uploads." });
  }
}
