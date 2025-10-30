# CF Image proxy

> Image proxy and CDN for [Cloudflare Workers](https://workers.cloudflare.com).

[![Build Status](https://github.com/transitive-bullshit/cf-image-proxy/actions/workflows/build.yml/badge.svg)](https://github.com/transitive-bullshit/cf-image-proxy/actions/workflows/build.yml) [![Code Style: Biome](https://img.shields.io/badge/code_style-biome-60a5fa.svg)](https://biomejs.dev)

## Features

- Free 💪
- Super simple to setup and self-host
- Perfect lighthouse scores
- Handles CORS for you
- Normalizes origin URLs
- Respects `pragma: no-cache` and related headers
- Used in hundreds of prod sites

## Setup

1. Create a new blank [Cloudflare Worker](https://workers.cloudflare.com) or prepare a route and custom domain.
2. Fork / clone this repo
3. Update the missing values in [wrangler.toml](./wrangler.toml)
4. `npm install`
5. `npm run dev` to test locally with Wrangler (Miniflare)
6. `npm run preview` to test against the edge runtime
7. `npm run deploy` to deploy to Cloudflare Workers 💪

### wrangler.toml

```toml
name = "cf-image-proxy"
main = "src/index.js"
account_id = "TODO"
workers_dev = true
compatibility_date = "2025-10-30"

[[routes]]
pattern = "TODO" # e.g. my.example.com
custom_domain = true
```

You can find your `account_id` in your Cloudflare Workers settings.

### Cloudflare Polish

You can optionally enable Polish in your Cloudflare zone settings if you want to enable on-the-fly image optimization as part of your CDN. In many cases, this will serve images to supported clients in an optimized `webp` format.

This may increase costs, so it's not recommended for everyone. The CF worker should support both configurations without issue.

### CDN

By default, all assets will be served with a `cache-control` header set to `public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60`, which effectively makes them cached at all levels indefinitely (or more practically until Cloudflare or your browser purges the asset from its cache).

If you want to change this `cache-control` header or add additional headers, see [src/fetch-request.js](./src/fetch-request.js).

## Development

The project uses [Biome](https://biomejs.dev) for linting and formatting. Available commands:

- `npm test` - Run tests with Vitest
- `npm run lint` - Check for linting issues
- `npm run format` - Format all files
- `npm run typecheck` - Run TypeScript type checking

## Usage

### General Usage

In the application where you want to consume your proxied images, you'll need to replace your third-party image URLs.

You can replace them with your proxy domain plus a path that contains the URI-encoded version of your original domain. In TypeScript, this looks like the following:

```ts
const imageCDNHost = 'https://exampledomain.com'

export const mapImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  if (imageCDNHost) {
    // Our proxy uses Cloudflare's global CDN to cache these image assets
    return `${imageCDNHost}/${encodeURIComponent(imageUrl)}`
  } else {
    return imageUrl
  }
}
```

## Technical Notes

A few notes about the implementation:

- It is hosted via Cloudflare (CF) edge [workers](https://workers.cloudflare.com).
- It is bundled by Wrangler (esbuild/workerd) before uploading to CF.
- CF runs our worker via V8 directly in an environment mimicking [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
- This means that our worker does not have access to Node.js primitives such as `fs`, `dns` and `http`.
- It does have access to a custom [web fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## TODO

- [x] Initial release extracted from Notion2Site
- [ ] Support restricting the origin domain in order to prevent abuse
- [ ] Add a snazzy demo

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

Support my OSS work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
