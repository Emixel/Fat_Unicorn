var assert = require('node:assert/strict');
var http = require('node:http');
var test = require('node:test');

process.env.DISCORD_BOT_TOKEN = 'test-token-never-returned';
process.env.DISCORD_GUILD_ID = '12345678901234567';

var discordRequests = 0;
global.fetch = async function(url, options) {
  discordRequests += 1;
  assert.equal(
    url,
    'https://discord.com/api/v10/guilds/12345678901234567?with_counts=true'
  );
  assert.equal(options.headers.Authorization, 'Bot test-token-never-returned');
  return new Response(JSON.stringify({
    name: 'Test Unicorn Server',
    approximate_member_count: 1250,
    approximate_presence_count: 342
  }), {
    headers: { 'content-type': 'application/json' }
  });
};

var app = require('../app');
var server;

function request(path) {
  return new Promise(function(resolve, reject) {
    http.get({
      host: '127.0.0.1',
      port: server.address().port,
      path: path,
      headers: { Accept: 'application/json' }
    }, function(response) {
      var body = '';
      response.setEncoding('utf8');
      response.on('data', function(chunk) { body += chunk; });
      response.on('end', function() {
        resolve({ status: response.statusCode, headers: response.headers, body: body });
      });
    }).on('error', reject);
  });
}

test.before(async function() {
  server = app.listen(0, '127.0.0.1');
  await new Promise(function(resolve, reject) {
    server.once('listening', resolve);
    server.once('error', reject);
  });
});

test.after(async function() {
  await new Promise(function(resolve, reject) {
    server.close(function(error) {
      if (error) reject(error);
      else resolve();
    });
  });
});

test('returns only public guild statistics and never the bot token', async function() {
  var response = await request('/api/discord/stats');
  var body = JSON.parse(response.body);

  assert.equal(response.status, 200);
  assert.equal(body.serverName, 'Test Unicorn Server');
  assert.equal(body.totalMembers, 1250);
  assert.equal(body.onlineMembers, 342);
  assert.equal(body.stale, false);
  assert.ok(Number.isFinite(Date.parse(body.lastUpdated)));
  assert.equal(response.headers['access-control-allow-origin'], undefined);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.body.includes('test-token-never-returned'), false);
  assert.equal(discordRequests, 1);
});

test('limits statistics requests by client IP without re-fetching Discord', async function() {
  for (var index = 0; index < 59; index += 1) {
    var allowed = await request('/api/discord/stats');
    assert.equal(allowed.status, 200);
  }

  var limited = await request('/api/discord/stats');
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers['retry-after']) > 0);
  assert.equal(discordRequests, 1);
});

test('renders the separate pages with the matching navigation item selected', async function() {
  var pages = [
    { path: '/', heading: 'Gaming community', navigation: 'Welcome' },
    { path: '/about', heading: 'Who we are', navigation: 'About Us' },
    { path: '/about/joinus', heading: 'Who we are', navigation: 'About Us' },
    { path: '/community/contentcreators', heading: 'Our streamers', navigation: 'Creators' },
    { path: '/games/eventsTournaments', heading: 'Happenings', navigation: 'Events' },
    { path: '/shop', heading: 'Merch', navigation: 'Merch' },
    { path: '/community', heading: 'Games & live servers', navigation: 'Servers' },
    { path: '/community/socials', heading: 'Games & live servers', navigation: 'Servers' },
    { path: '/games/teamsStats', heading: 'Games & live servers', navigation: 'Servers' }
  ];

  for (var page of pages) {
    var response = await request(page.path);
    assert.equal(response.status, 200, page.path + ' should render');
    assert.ok(response.body.includes(page.heading), page.path + ' should show its page content');
    assert.ok(
      response.body.includes('aria-current="page">' + page.navigation),
      page.path + ' should mark its navigation item current'
    );
  }
});
