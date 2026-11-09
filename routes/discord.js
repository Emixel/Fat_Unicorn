var express = require('express');
var discordStats = require('../utils/discordStats');

var router = express.Router();
var RATE_LIMIT = 60;
var RATE_WINDOW_MS = 60 * 1000;
var MAX_CLIENTS = 10000;
var clients = new Map();

var cleanupTimer = setInterval(function() {
  var now = Date.now();
  clients.forEach(function(entry, address) {
    if (entry.resetAt <= now) clients.delete(address);
  });
}, RATE_WINDOW_MS);
cleanupTimer.unref();

function rateLimit(req, res, next) {
  var now = Date.now();
  var address = req.ip || req.socket.remoteAddress || 'unknown';
  var entry = clients.get(address);

  if (!entry || entry.resetAt <= now) {
    if (!entry && clients.size >= MAX_CLIENTS) {
      clients.forEach(function(client, clientAddress) {
        if (client.resetAt <= now) clients.delete(clientAddress);
      });
    }

    if (!entry && clients.size >= MAX_CLIENTS) {
      res.set('Retry-After', String(Math.ceil(RATE_WINDOW_MS / 1000)));
      return res.status(503).json({ error: 'Statistics are temporarily unavailable.' });
    }

    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT) {
    res.set('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  entry.count += 1;
  clients.set(address, entry);
  next();
}

router.get('/stats', rateLimit, async function(req, res) {
  res.set('Cache-Control', 'no-store');

  try {
    var result = await discordStats.getStats();
    res.json({
      serverName: result.stats.serverName,
      totalMembers: result.stats.totalMembers,
      onlineMembers: result.stats.onlineMembers,
      lastUpdated: result.stats.lastUpdated,
      stale: result.stale
    });
  } catch (error) {
    var retryAfter = error && Number.isSafeInteger(error.retryAfter) ? error.retryAfter : 15;
    var reason = error && typeof error.code === 'string' ? error.code : 'unexpected_error';
    console.error('Discord statistics unavailable:', reason);
    res.set('Retry-After', String(Math.max(1, retryAfter)));
    res.status(503).json({ error: 'Statistics are temporarily unavailable.' });
  }
});

module.exports = router;
