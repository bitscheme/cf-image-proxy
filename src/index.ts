import type { EventLike } from './types'
import { fetchCache } from './fetch-cache'
import { fetchRequest } from './fetch-request'
import { getRequestCacheKey } from './get-request-cache-key'
import { globalResHeaders } from './global-res-headers'
import { handleOptions } from './handle-options'
import { resolveRequest } from './resolve-request'

export default {
  async fetch(
    request: Request,
    _env: Record<string, unknown>,
    ctx: ExecutionContext
  ): Promise<Response> {
    const gatewayStartTime = Date.now()
    let gatewayTimespan = 0
    let res: Response

    function recordTimespans() {
      const now = Date.now()
      gatewayTimespan = now - gatewayStartTime
    }

    try {
      const { method } = request

      if (method === 'OPTIONS') {
        return handleOptions(request)
      }

      const eventLike: EventLike = {
        waitUntil(promise: Promise<unknown>) {
          ctx.waitUntil(promise)
        },
      }

      const { originReq } = await resolveRequest(eventLike, request)

      try {
        const cacheKey = await getRequestCacheKey(originReq)
        const originRes = await fetchCache({
          event: eventLike,
          cacheKey,
          fetch: () => fetchRequest(eventLike, { originReq }),
        })

        res = new Response(originRes.body, originRes)
        recordTimespans()

        res.headers.set('x-proxy-response-time', `${gatewayTimespan}ms`)

        return res
      } catch (err) {
        console.error(err)
        recordTimespans()

        const e = err as { message?: string; type?: string; code?: string }
        res = new Response(
          JSON.stringify({
            error: e?.message,
            type: e?.type,
            code: e?.code,
          }),
          { status: 500, headers: globalResHeaders }
        )

        return res
      }
    } catch (err) {
      console.error(err)

      const e = err as { message?: string; type?: string; code?: string; response?: Response }
      if (e?.response) {
        // TODO: make sure this response also has CORS globalResHeaders
        return e.response
      }
      return new Response(
        JSON.stringify({
          error: e?.message,
          type: e?.type,
          code: e?.code,
        }),
        {
          status: 500,
          headers: globalResHeaders,
        }
      )
    }
  },
}
