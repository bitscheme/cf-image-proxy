const allowedMethods = 'GET, HEAD, POST, PUT, DELETE, TRACE, PATCH, OPTIONS'

export function handleOptions(request: Request): Response {
  // Make sure the necessary headers are present for this to be a valid pre-flight request
  const accessControlRequestHeaders = request.headers.get('Access-Control-Request-Headers')
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    accessControlRequestHeaders !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': allowedMethods,
        'Access-Control-Allow-Headers': accessControlRequestHeaders,
      },
    })
  }
  // Handle standard OPTIONS request.
  // If you want to allow other HTTP Methods, you can do that here.
  return new Response(null, {
    headers: {
      Allow: allowedMethods,
    },
  })
}
