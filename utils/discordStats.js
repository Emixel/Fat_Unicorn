var CACHE_TTL_MS = 60 * 1000;
var REQUEST_TIMEOUT_MS = 10 * 1000;
var DEFAULT_RETRY_SECONDS = 15;
var MAX_RETRY_SECONDS = 24 * 60 * 60;
var GUILD_ID_PATTERN = /^\d{17,20}$/;

function DiscordStatsError(code, retryAfter) {
  this.name = 'DiscordStatsError';
  this.message = 'Discord statistics are unavailable.';
  this.code = code;
  this.retryAfter = retryAfter;
  Error.captureStackTrace(this, DiscordStatsError);
}

DiscordStatsError.prototype = Object.create(Error.prototype);
DiscordStatsError.prototype.constructor = DiscordStatsError;

function parseRetrySeconds(value, now) {
  if (value === null || value === undefined || value === '') return null;

  var seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(1, Math.min(MAX_RETRY_SECONDS, Math.ceil(seconds)));
  }

  var retryAt = Date.parse(value);
  if (Number.isFinite(retryAt)) {
    return Math.max(1, Math.min(MAX_RETRY_SECONDS, Math.ceil((retryAt - now) / 1000)));
  }

  return null;
}

function createDiscordStatsService(options) {
  options = options || {};
  var fetchImpl = options.fetchImpl || function(url, requestOptions) {
    return fetch(url, requestOptions);
  };
  var now = options.now || Date.now;
  var cache = null;
  var inFlight = null;
  var retryAt = 0;
  var retrySeconds = DEFAULT_RETRY_SECONDS;

  async function getRetryAfter(response) {
    var nowValue = now();
    var delay = parseRetrySeconds(response.headers.get('retry-after'), nowValue);
    if (delay === null) {
      delay = parseRetrySeconds(response.headers.get('x-ratelimit-reset-after'), nowValue);
    }
    if (delay !== null) return delay;

    try {
      var body = await response.json();
      delay = parseRetrySeconds(body && body.retry_after, nowValue);
      if (delay !== null) return delay;
    } catch (error) {
      // Discord's rate-limit response body is optional; use a safe fallback.
    }

    return DEFAULT_RETRY_SECONDS;
  }

  async function fetchStats() {
    var token = process.env.DISCORD_BOT_TOKEN;
    var guildId = process.env.DISCORD_GUILD_ID;

    if (typeof token !== 'string' || token.trim() === '' ||
        typeof guildId !== 'string' || !GUILD_ID_PATTERN.test(guildId)) {
      throw new DiscordStatsError('invalid_configuration', 60);
    }

    var controller = new AbortController();
    var timeout = setTimeout(function() {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    var response;

    try {
      response = await fetchImpl(
        'https://discord.com/api/v10/guilds/' + encodeURIComponent(guildId) + '?with_counts=true',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bot ' + token.trim()
          },
          cache: 'no-store',
          redirect: 'error',
          signal: controller.signal
        }
      );

      if (response.status === 429) {
        throw new DiscordStatsError('discord_rate_limited', await getRetryAfter(response));
      }

      if (!response.ok) {
        var code = response.status === 401 || response.status === 403
          ? 'discord_auth_error'
          : response.status === 404
            ? 'guild_not_found'
            : 'discord_api_error';
        throw new DiscordStatsError(code, 60);
      }

      var contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        throw new DiscordStatsError('invalid_discord_response', DEFAULT_RETRY_SECONDS);
      }

      var body;
      try {
        body = await response.json();
      } catch (error) {
        throw new DiscordStatsError('invalid_discord_response', DEFAULT_RETRY_SECONDS);
      }

      if (!body || typeof body.name !== 'string' || body.name.trim() === '' ||
          body.name.length > 100 ||
          !Number.isSafeInteger(body.approximate_member_count) ||
          body.approximate_member_count < 0 ||
          !Number.isSafeInteger(body.approximate_presence_count) ||
          body.approximate_presence_count < 0) {
        throw new DiscordStatsError('invalid_discord_response', DEFAULT_RETRY_SECONDS);
      }

      return {
        serverName: body.name.trim(),
        totalMembers: body.approximate_member_count,
        onlineMembers: body.approximate_presence_count
      };
    } catch (error) {
      if (error instanceof DiscordStatsError) throw error;
      throw new DiscordStatsError('discord_network_error', DEFAULT_RETRY_SECONDS);
    } finally {
      clearTimeout(timeout);
    }
  }

  async function refresh() {
    try {
      var values = await fetchStats();
      var fetchedAt = now();
      cache = {
        serverName: values.serverName,
        totalMembers: values.totalMembers,
        onlineMembers: values.onlineMembers,
        lastUpdated: new Date(fetchedAt).toISOString(),
        fetchedAt: fetchedAt
      };
      retryAt = 0;
      retrySeconds = DEFAULT_RETRY_SECONDS;
      return { stats: cache, stale: false };
    } catch (error) {
      retrySeconds = error && Number.isSafeInteger(error.retryAfter)
        ? Math.max(1, Math.min(MAX_RETRY_SECONDS, error.retryAfter))
        : DEFAULT_RETRY_SECONDS;
      retryAt = now() + retrySeconds * 1000;

      if (cache) return { stats: cache, stale: true };
      throw error;
    }
  }

  function getStats() {
    var currentTime = now();
    if (cache && currentTime - cache.fetchedAt < CACHE_TTL_MS) {
      return Promise.resolve({ stats: cache, stale: false });
    }

    if (inFlight) return inFlight;
    if (currentTime < retryAt) {
      if (cache) return Promise.resolve({ stats: cache, stale: true });
      return Promise.reject(new DiscordStatsError('retry_backoff', retrySeconds));
    }

    inFlight = refresh().finally(function() {
      inFlight = null;
    });
    return inFlight;
  }

  return { getStats: getStats };
}

module.exports = createDiscordStatsService();
module.exports.createDiscordStatsService = createDiscordStatsService;
