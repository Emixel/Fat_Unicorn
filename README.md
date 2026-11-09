# The Fat Unicorns

## Discord server statistics

The homepage reads the member count and approximate online presence from the
Discord REST API. The browser requests the same-origin `/api/discord/stats`
endpoint; only the Express server contacts Discord. The server validates the
Discord response, caches successful values for 60 seconds, coalesces concurrent
refreshes, and serves the last successful values if Discord is temporarily
unavailable. The endpoint is limited to 60 requests per client IP per minute.
The homepage refreshes the statistics every 60 seconds.

The integration uses the bot token only as a server-side credential. The bot
must be a member of the configured server. Do not grant Administrator
permissions or enable privileged Gateway intents for this REST request.

## Local configuration

Use Node.js 20 or newer. Copy `.env.example` to `.env` and set:

- `DISCORD_BOT_TOKEN`: the bot token from the Discord Developer Portal.
- `DISCORD_GUILD_ID`: the numeric ID of the Discord server.

Keep `.env` private; it is excluded by `.gitignore`. Never commit the real token,
put it in frontend files, or include it in a URL. If a token is exposed, reset it
in the Discord Developer Portal.

Install dependencies and run the app:

```sh
npm install
npm run dev
```

For production, start the existing Express application with:

```sh
npm start
```

## Test the endpoint

With the app running locally, request the JSON endpoint:

```sh
curl -i http://localhost:3000/api/discord/stats
```

A successful response contains `serverName`, `totalMembers`,
`onlineMembers`, and `lastUpdated`. `stale` is `true` when the service is
temporarily returning its last successful cached values. If no cached values
are available, the endpoint responds with a generic `503` error and a
`Retry-After` header. Requests exceeding the per-IP limit receive `429`.

Run the automated tests with:

```sh
npm test
```

## Secure deployment

Configure `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID` as private environment
variables in the hosting platform's secret manager. Do not upload `.env` or
expose environment variables through templates or API responses. Deploy behind
HTTPS (for example, with TLS terminated by a trusted hosting reverse proxy);
do not expose the app over public plain HTTP. The statistics API is same-origin,
so it does not enable CORS. If the deployment changes to a cross-origin frontend,
add an explicit allowlist for that exact origin rather than a wildcard.

The IP rate limiter uses Express's direct client address and does not trust
forwarded headers. If deploying behind a reverse proxy, configure Express
`trust proxy` only for the known proxy topology so client-IP limiting cannot be
spoofed.
