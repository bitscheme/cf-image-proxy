import type { EventLike } from './types'

// biome-ignore lint/suspicious/noExplicitAny: caches.default is not typed in standard lib
const cache = (caches as any).default as Cache

interface FetchCacheOptions {
  event: EventLike
  cacheKey: Request | null
  fetch: () => Promise<Response>
}

export async function fetchCache(opts: FetchCacheOptions): Promise<Response> {
  const { event, cacheKey, fetch: fetchResponse } = opts

  let response: Response | undefined

  if (cacheKey) {
    console.log('cacheKey', cacheKey.url)
    response = await cache.match(cacheKey)
  }

  if (!response) {
    response = await fetchResponse()
    response = new Response(response.body, response)

    if (cacheKey) {
      if (response.headers.has('Cache-Control')) {
        // cache will respect response headers
        event.waitUntil(
          cache.put(cacheKey, response.clone()).catch((err) => {
            console.warn('cache put error', cacheKey, err)
          })
        )
      }

      response.headers.set('cf-cache-status', 'MISS')
    } else {
      response.headers.set('cf-cache-status', 'BYPASS')
    }
  }

  return response
}
