export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== 'GET') return response
    if (!request.headers.get('accept')?.includes('text/html')) return response

    const fallback = new URL('/index.html', request.url)
    return env.ASSETS.fetch(new Request(fallback, request))
  },
}
