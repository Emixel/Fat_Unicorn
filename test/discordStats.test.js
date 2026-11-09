var assert = require('node:assert/strict');
var test = require('node:test');
var createDiscordStatsService = require('../utils/discordStats').createDiscordStatsService;

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json' }, headers)
  });
}

function guildResponse(overrides) {
  return Object.assign({
    name: 'Test Unicorn Server',
    approximate_member_count: 1250,
    approximate_presence_count: 342
  }, overrides);
}

function configureEnvironment() {
  process.env.DISCORD_BOT_TOKEN = 'test-token-not-for-output';
  process.env.DISCORD_GUILD_ID = '12345678901234567';
}

test('maps Discord guild counts and caches them for 60 seconds', async function() {
  configureEnvironment();
  var currentTime = Date.UTC(2026, 10, 9, 10, 0, 0);
  var requests = [];
  var service = createDiscordStatsService({
    now: function() { return currentTime; },
    fetchImpl: async function(url, options) {
      requests.push({ url: url, options: options });
      return jsonResponse(guildResponse());
    }
  });

  var first = await service.getStats();
  var cached = await service.getStats();

  assert.equal(first.stats.serverName, 'Test Unicorn Server');
  assert.equal(first.stats.totalMembers, 1250);
  assert.equal(first.stats.onlineMembers, 342);
  assert.equal(first.stats.lastUpdated, '2026-11-09T10:00:00.000Z');
  assert.equal(first.stale, false);
  assert.equal(cached.stats, first.stats);
  assert.equal(requests.length, 1);
  assert.equal(
    requests[0].url,
    'https://discord.com/api/v10/guilds/12345678901234567?with_counts=true'
  );
  assert.equal(requests[0].options.headers.Authorization, 'Bot test-token-not-for-output');

  currentTime += 60 * 1000;
  await service.getStats();
  assert.equal(requests.length, 2);
});

test('serves the last good values and backs off after a Discord rate limit', async function() {
  configureEnvironment();
  var currentTime = Date.UTC(2026, 10, 9, 10, 0, 0);
  var requestCount = 0;
  var service = createDiscordStatsService({
    now: function() { return currentTime; },
    fetchImpl: async function() {
      requestCount += 1;
      if (requestCount === 1) return jsonResponse(guildResponse());
      return jsonResponse({ retry_after: 30 }, 429);
    }
  });

  var original = await service.getStats();
  currentTime += 60 * 1000;
  var stale = await service.getStats();
  var backedOff = await service.getStats();

  assert.equal(stale.stale, true);
  assert.equal(stale.stats, original.stats);
  assert.equal(backedOff.stats, original.stats);
  assert.equal(requestCount, 2);
});

test('rejects invalid Discord response fields without inventing counts', async function() {
  configureEnvironment();
  var service = createDiscordStatsService({
    fetchImpl: async function() {
      return jsonResponse(guildResponse({ approximate_presence_count: 'many' }));
    }
  });

  await assert.rejects(service.getStats(), function(error) {
    return error.code === 'invalid_discord_response';
  });
});

test('does not make a Discord request with a malformed guild ID', async function() {
  process.env.DISCORD_BOT_TOKEN = 'test-token-not-for-output';
  process.env.DISCORD_GUILD_ID = 'not-a-guild-id';
  var requested = false;
  var service = createDiscordStatsService({
    fetchImpl: async function() {
      requested = true;
      return jsonResponse(guildResponse());
    }
  });

  await assert.rejects(service.getStats(), function(error) {
    return error.code === 'invalid_configuration';
  });
  assert.equal(requested, false);
});
