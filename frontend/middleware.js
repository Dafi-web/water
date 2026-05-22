/**
 * Proxies /api/* and /uploads/* to Render before SPA rewrites run.
 * Set API_PROXY_TARGET on Vercel (your Render URL, no trailing slash).
 */
export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
};

function getBackendBase() {
  return (process.env.API_PROXY_TARGET || process.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
}

export default async function middleware(request) {
  const backend = getBackendBase();
  if (!backend) {
    return new Response(
      JSON.stringify({
        message: 'Set API_PROXY_TARGET on Vercel to your Render backend URL, then redeploy.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const incoming = new URL(request.url);
  const target = `${backend}${incoming.pathname}${incoming.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  try {
    return await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    });
  } catch (error) {
    console.error('API proxy error', target, error);
    return new Response(
      JSON.stringify({
        message: 'Could not reach backend. Check Render is running and API_PROXY_TARGET is correct.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
