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

export default async function handler(req, res) {
  const backend = getBackendBase();
  if (!backend) {
    res.status(503).json({ message: "API_PROXY_TARGET is not configured on Vercel." });
    return;
  }

  const incoming = req.url || "/uploads";
  const qIndex = incoming.indexOf("?");
  const pathname = qIndex === -1 ? incoming : incoming.slice(0, qIndex);
  const search = qIndex === -1 ? "" : incoming.slice(qIndex);
  const target = `${backend}${pathname}${search}`;

  try {
    const upstream = await fetch(target, { method: req.method, headers: req.headers });
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
